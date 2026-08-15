import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import NotificationService from '#services/notification_service'
import { createHash } from 'node:crypto'
import RateLimitService from '#services/rate_limit_service'
import { getSecurityState } from '#services/account_security_service'

const digest = (token: string) => createHash('sha256').update(token).digest('hex')

export default class InvitationAcceptancesController {
  async show({ auth, params, inertia }: HttpContext) {
    const invitation = await this.findInvitation(params.token)
    if (!invitation)
      return inertia.render('invitations/accept', {
        invitation: null,
        state: 'invalid',
        signedInEmail: auth.user?.email ?? null,
        hasAccount: false,
      })
    const account = await User.findBy('email', invitation.email)
    return inertia.render('invitations/accept', {
      invitation: {
        email: invitation.email,
        childFirstName: invitation.child_first_name,
        mamName: invitation.mam_name,
        inviterName: invitation.inviter_name,
        relationship: invitation.relationship,
        role: invitation.role,
        isStaff: !invitation.child_id,
      },
      state: invitation.accepted_at ? 'accepted' : 'active',
      signedInEmail: auth.user?.email ?? null,
      hasAccount: Boolean(account),
    })
  }

  async store({ auth, request, params, response, session }: HttpContext) {
    const invitation = await this.findInvitation(params.token)
    if (!invitation || invitation.accepted_at) {
      session.flash('error', 'Cette invitation est invalide, expirée ou déjà utilisée.')
      return response.redirect(`/invitations/${params.token}`)
    }

    let user = auth.user ?? (await User.findBy('email', invitation.email))
    if (auth.user && auth.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      session.flash('error', `Cette invitation est destinée à ${invitation.email}.`)
      return response.redirect().back()
    }
    if (user && !auth.user) {
      const limiter = new RateLimitService()
      const state = await limiter.check('invitation-password', `${request.ip()}:${user.email}`)
      if (!state.allowed) {
        response.header('Retry-After', String(Math.max(state.retryAfter, 60)))
        session.flash('error', 'Trop de tentatives. Réessayez dans quelques minutes.')
        return response.redirect().back()
      }
      const password = String(request.input('password', ''))
      if (!(await hash.verify(user.password, password))) {
        await limiter.hit('invitation-password', `${request.ip()}:${user.email}`, {
          limit: 8,
          windowSeconds: 15 * 60,
          blockSeconds: 15 * 60,
        })
        session.flash('error', 'Mot de passe incorrect.')
        return response.redirect().back()
      }
      await limiter.clear('invitation-password', `${request.ip()}:${user.email}`)
      const security = await getSecurityState(user.id)
      if (security.mfa_enabled) {
        session.put('mfaPendingUserId', user.id)
        session.put('mfaPendingAt', Date.now())
        session.put('mfaPendingRedirect', `/invitations/${params.token}`)
        return response.redirect('/mfa')
      }
    }
    if (!user) {
      const fullName = String(request.input('fullName', '')).trim()
      const password = String(request.input('password', ''))
      if (fullName.length < 2 || password.length < 12) {
        session.flash('error', 'Indiquez votre nom et un mot de passe d’au moins 12 caractères.')
        return response.redirect().back()
      }
      user = await User.create({
        fullName,
        email: invitation.email,
        password,
        globalRole: 'member',
        status: 'active',
      })
    }

    await db.transaction(async (trx) => {
      const locked = await trx
        .from('invitations')
        .where({ id: invitation.id })
        .whereNull('accepted_at')
        .forUpdate()
        .first()
      if (!locked) throw new Error('INVITATION_ALREADY_ACCEPTED')
      await trx
        .table('memberships')
        .insert({
          id: crypto.randomUUID(),
          mam_id: invitation.mam_id,
          user_id: user.id,
          role: invitation.child_id
            ? 'parent'
            : invitation.role === 'admin' || invitation.role === 'mam_admin'
              ? 'admin'
              : 'assistant',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        })
        .onConflict(['mam_id', 'user_id'])
        .ignore()
      if (invitation.child_id)
        await trx
          .table('child_guardians')
          .insert({
            id: crypto.randomUUID(),
            mam_id: invitation.mam_id,
            child_id: invitation.child_id,
            user_id: user.id,
            relationship: invitation.relationship || 'other',
            can_invite: true,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .onConflict(['child_id', 'user_id'])
          .merge({
            relationship: invitation.relationship || 'other',
            can_invite: true,
            updated_at: new Date(),
          })
      await trx
        .from('invitations')
        .where('id', invitation.id)
        .update({ accepted_at: new Date(), updated_at: new Date() })
    })

    if (!auth.user) {
      const security = await getSecurityState(user.id)
      await auth.use('web').login(user)
      session.regenerate()
      session.put('securityVersion', Number(security.security_version))
    }
    await new NotificationService().notifyMamAdmins({
      mamId: invitation.mam_id,
      actorId: user.id,
      category: invitation.child_id ? 'guardian_invitation' : 'establishment',
      type: invitation.child_id ? 'guardian.invitation_accepted' : 'staff.invitation_accepted',
      title: 'Invitation acceptée',
      body: invitation.child_id
        ? `${user.fullName} a rejoint les responsables de ${invitation.child_first_name}.`
        : `${user.fullName} a rejoint l’équipe de la MAM.`,
      actionUrl: invitation.child_id ? `/enfants/${invitation.child_id}/fiche` : '/personnel',
      data: invitation.child_id ? { childId: invitation.child_id } : {},
    })
    session.flash(
      'success',
      invitation.child_id
        ? `Bienvenue dans l’espace de ${invitation.child_first_name}.`
        : `Bienvenue dans l’équipe de ${invitation.mam_name}.`
    )
    return response.redirect('/dashboard')
  }

  private async findInvitation(token: string) {
    if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) return null
    return db
      .from('invitations')
      .leftJoin('children', 'children.id', 'invitations.child_id')
      .join('mams', 'mams.id', 'invitations.mam_id')
      .join('users as inviter', 'inviter.id', 'invitations.invited_by')
      .where('invitations.token_hash', digest(token))
      .where('invitations.expires_at', '>', new Date())
      .select(
        'invitations.*',
        'children.first_name as child_first_name',
        'mams.name as mam_name',
        'inviter.full_name as inviter_name'
      )
      .first()
  }
}
