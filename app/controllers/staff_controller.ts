import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { createHash, randomBytes } from 'node:crypto'
import { getMamContext } from '#services/access_service'
import NotificationService from '#services/notification_service'
import { appUrl } from '#config/app'
import RateLimitService from '#services/rate_limit_service'

const staffRoles = new Set(['admin', 'assistant'])

export default class StaffController {
  async index({ auth, inertia, response }: HttpContext) {
    const context = await getMamContext(auth.getUserOrFail())
    if (!context || context.role !== 'admin') return response.forbidden()
    const members = await db
      .from('memberships')
      .join('users', 'users.id', 'memberships.user_id')
      .where('memberships.mam_id', context.mamId)
      .whereIn('memberships.role', ['admin', 'assistant'])
      .orderBy('users.full_name')
      .select(
        'memberships.id',
        'memberships.user_id as userId',
        'memberships.role',
        'memberships.status',
        'users.full_name as fullName',
        'users.email'
      )
    const pending = await db
      .from('invitations')
      .where('mam_id', context.mamId)
      .whereNull('child_id')
      .whereIn('role', ['admin', 'assistant'])
      .whereNull('accepted_at')
      .where('expires_at', '>', new Date())
      .orderBy('created_at', 'desc')
      .select('id', 'email', 'role', 'expires_at as expiresAt')
    return inertia.render('staff/index', { members, pending, currentUserId: auth.user!.id })
  }

  async invite({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role !== 'admin') return response.forbidden()
    const email = String(request.input('email', '')).trim().toLowerCase()
    const role = String(request.input('role', 'assistant'))
    if (!/^\S+@\S+\.\S+$/.test(email) || !staffRoles.has(role)) {
      session.flash('error', 'Vérifiez l’adresse e-mail et le rôle choisi.')
      return response.redirect().back()
    }
    const inviteLimit = await new RateLimitService().hit('staff-invitation', user.id, {
      limit: 15,
      windowSeconds: 60 * 60,
    })
    if (!inviteLimit.allowed) {
      response.header('Retry-After', String(Math.max(inviteLimit.retryAfter, 60)))
      session.flash('error', 'Limite d’invitations atteinte. Réessayez dans une heure.')
      return response.redirect().back()
    }
    const existing = await db
      .from('memberships')
      .join('users', 'users.id', 'memberships.user_id')
      .where({ 'memberships.mam_id': context.mamId })
      .whereRaw('lower(users.email) = ?', [email])
      .first()
    if (existing) {
      session.flash('error', 'Cette personne appartient déjà à la MAM.')
      return response.redirect().back()
    }
    const token = randomBytes(32).toString('base64url')
    const [invitation] = await db
      .table('invitations')
      .insert({
        id: crypto.randomUUID(),
        mam_id: context.mamId,
        child_id: null,
        invited_by: user.id,
        email,
        role,
        relationship: null,
        token_hash: createHash('sha256').update(token).digest('hex'),
        expires_at: new Date(Date.now() + 7 * 86_400_000),
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('id')
    const notifications = new NotificationService()
    const [notificationId] = await notifications.notifyUsers({
      mamId: context.mamId,
      recipientIds: [user.id],
      actorId: user.id,
      category: 'establishment',
      type: 'staff.invitation_sent',
      title: 'Invitation professionnelle envoyée',
      body: `${email} a été invité${role === 'admin' ? ' comme administrateur' : ' comme AM'}.`,
      actionUrl: '/personnel',
      data: { invitationId: invitation.id },
    })
    await notifications.queueExternalDelivery(notificationId, 'email', email, {
      title: `Invitation à rejoindre ${context.mamName}`,
      body: `${user.fullName} vous invite à rejoindre l’équipe de ${context.mamName}. Le lien est valable 7 jours.`,
      actionUrl: new URL(`/invitations/${token}`, appUrl).toString(),
    })
    session.flash('success', 'Invitation professionnelle envoyée.')
    return response.redirect().back()
  }

  async update({ auth, request, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role !== 'admin') return response.forbidden()
    const membership = await db
      .from('memberships')
      .where({ id: params.id, mam_id: context.mamId })
      .whereIn('role', ['admin', 'assistant'])
      .first()
    if (!membership) return response.notFound()
    const role = String(request.input('role', membership.role))
    const status = String(request.input('status', membership.status))
    if (!staffRoles.has(role) || !new Set(['active', 'suspended']).has(status))
      return response.badRequest()
    if (membership.user_id === user.id && (role !== 'admin' || status !== 'active')) {
      session.flash('error', 'Vous ne pouvez pas retirer votre propre accès administrateur.')
      return response.redirect().back()
    }
    await db
      .from('memberships')
      .where('id', membership.id)
      .update({ role, status, updated_at: new Date() })
    await new NotificationService().notifyUsers({
      mamId: context.mamId,
      recipientIds: [membership.user_id],
      actorId: user.id,
      category: 'establishment',
      type: 'staff.access_updated',
      title: 'Votre accès à la MAM a été modifié',
      body:
        status === 'suspended'
          ? 'Votre accès a été suspendu.'
          : `Votre rôle est maintenant ${role === 'admin' ? 'administrateur' : 'AM'}.`,
      actionUrl: '/dashboard',
    })
    session.flash('success', 'Accès du membre mis à jour.')
    return response.redirect().back()
  }
}
