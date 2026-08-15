import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { createHash, randomBytes } from 'node:crypto'
import { assertChildAccess, getMamContext } from '#services/access_service'
import NotificationService from '#services/notification_service'
import { appUrl } from '#config/app'
import RateLimitService from '#services/rate_limit_service'

export default class InvitationsController {
  async index({ auth, params, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role === 'assistant') return response.forbidden()
    const child = await assertChildAccess(user, context, params.id)
    if (!child) return response.notFound()
    if (context.role === 'parent') {
      const guardian = await db
        .from('child_guardians')
        .where({ child_id: child.id, user_id: user.id, can_invite: true })
        .first()
      if (!guardian) return response.forbidden()
    }
    const guardians = await db
      .from('child_guardians')
      .join('users', 'users.id', 'child_guardians.user_id')
      .where({ 'child_guardians.mam_id': context.mamId, 'child_guardians.child_id': child.id })
      .orderBy('users.full_name')
      .select(
        'users.id',
        'users.full_name as fullName',
        'users.email',
        'child_guardians.relationship',
        'child_guardians.can_invite as canInvite'
      )
    const pending = await db
      .from('invitations')
      .where({ mam_id: context.mamId, child_id: child.id })
      .whereNull('accepted_at')
      .where('expires_at', '>', new Date())
      .orderBy('created_at', 'desc')
      .select('id', 'email', 'relationship', 'expires_at as expiresAt')
    return inertia.render('guardians/index', {
      child: { id: child.id, firstName: child.first_name, lastName: child.last_name },
      guardians,
      pending,
    })
  }

  async store({ auth, request, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role === 'assistant') return response.forbidden()
    const child = await assertChildAccess(user, context, params.id)
    if (!child) return response.notFound()
    if (context.role === 'parent') {
      const guardian = await db
        .from('child_guardians')
        .where({ mam_id: context.mamId, child_id: child.id, user_id: user.id, can_invite: true })
        .first()
      if (!guardian) return response.forbidden()
    }
    const body = request.only(['email', 'relationship'])
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase()
    const relationships = new Set(['parent', 'grandparent', 'nanny', 'guardian', 'other'])
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      session.flash('error', 'Adresse e-mail invalide.')
      return response.redirect().back()
    }
    const inviteLimit = await new RateLimitService().hit('guardian-invitation', user.id, {
      limit: 20,
      windowSeconds: 60 * 60,
    })
    if (!inviteLimit.allowed) {
      response.header('Retry-After', String(Math.max(inviteLimit.retryAfter, 60)))
      session.flash('error', 'Limite d’invitations atteinte. Réessayez dans une heure.')
      return response.redirect().back()
    }
    const token = randomBytes(32).toString('base64url')
    const [invitation] = await db
      .table('invitations')
      .insert({
        id: crypto.randomUUID(),
        mam_id: context.mamId,
        child_id: child.id,
        invited_by: user.id,
        email,
        role: 'parent',
        relationship: relationships.has(body.relationship) ? body.relationship : 'other',
        token_hash: createHash('sha256').update(token).digest('hex'),
        expires_at: new Date(Date.now() + 7 * 86_400_000),
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('id')
    const notifications = new NotificationService()
    if (context.role === 'parent')
      await notifications.notifyMamAdmins({
        mamId: context.mamId,
        actorId: user.id,
        category: 'guardian_invitation',
        type: 'guardian.invited',
        title: 'Nouveau responsable invité',
        body: `${user.fullName} a invité ${email} comme responsable de ${child.first_name}.`,
        actionUrl: `/enfants/${child.id}/fiche`,
        data: { childId: child.id, invitationId: invitation.id },
      })
    const [confirmationId] = await notifications.notifyUsers({
      mamId: context.mamId,
      recipientIds: [user.id],
      actorId: user.id,
      category: 'guardian_invitation',
      type: 'guardian.invitation_sent',
      title: 'Invitation envoyée',
      body: `L’invitation pour ${child.first_name} a été envoyée à ${email}.`,
      actionUrl: `/enfants/${child.id}/fiche`,
    })
    await notifications.queueExternalDelivery(confirmationId, 'email', email, {
      title: `Invitation à rejoindre ${child.first_name}`,
      body: `${user.fullName} vous invite à accéder aux informations de ${child.first_name} dans l’espace de la MAM. Ce lien est valable 7 jours.`,
      actionUrl: new URL(`/invitations/${token}`, appUrl).toString(),
    })
    session.flash('success', 'Invitation envoyée. La MAM a été notifiée.')
    return response.redirect().back()
  }
}
