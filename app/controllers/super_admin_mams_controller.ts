import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { createHash, randomBytes } from 'node:crypto'
import NotificationService from '#services/notification_service'
import { appUrl } from '#config/app'
import RateLimitService from '#services/rate_limit_service'

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70) || 'mam'

export default class SuperAdminMamsController {
  async index({ auth, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isSuperAdmin) return response.forbidden()
    const mams = await db
      .from('mams')
      .leftJoin('children', 'children.mam_id', 'mams.id')
      .leftJoin('memberships', 'memberships.mam_id', 'mams.id')
      .groupBy('mams.id')
      .orderBy('mams.created_at', 'desc')
      .select(
        'mams.id',
        'mams.name',
        'mams.slug',
        'mams.email',
        'mams.active',
        'mams.created_at as createdAt',
        db.raw(
          'count(distinct children.id) filter (where children.active = true) as "childrenCount"'
        ),
        db.raw(
          "count(distinct memberships.user_id) filter (where memberships.role in ('admin', 'assistant') and memberships.status = 'active') as \"staffCount\""
        ),
        db.raw(
          "count(distinct memberships.user_id) filter (where memberships.role = 'admin' and memberships.status = 'active') as \"adminsCount\""
        )
      )
    const pending = await db
      .from('invitations')
      .join('mams', 'mams.id', 'invitations.mam_id')
      .where('invitations.role', 'mam_admin')
      .whereNull('invitations.accepted_at')
      .where('invitations.expires_at', '>', new Date())
      .select('invitations.id', 'invitations.email', 'mams.id as mamId')
    return inertia.render('super-admin/mams', { mams, pending })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isSuperAdmin) return response.forbidden()
    const name = String(request.input('name', '')).trim().slice(0, 150)
    const email = String(request.input('adminEmail', '')).trim().toLowerCase()
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
      session.flash('error', 'Indiquez le nom de la MAM et l’e-mail de son administrateur.')
      return response.redirect().back()
    }
    const inviteLimit = await new RateLimitService().hit('mam-invitation', user.id, {
      limit: 10,
      windowSeconds: 60 * 60,
    })
    if (!inviteLimit.allowed) {
      response.header('Retry-After', String(Math.max(inviteLimit.retryAfter, 60)))
      session.flash('error', 'Limite de créations atteinte. Réessayez dans une heure.')
      return response.redirect().back()
    }
    const baseSlug = slugify(name)
    let slug = baseSlug
    let suffix = 1
    while (await db.from('mams').where('slug', slug).first()) slug = `${baseSlug}-${++suffix}`
    const mamId = crypto.randomUUID()
    const token = randomBytes(32).toString('base64url')
    await db.transaction(async (trx) => {
      await trx.table('mams').insert({
        id: mamId,
        name,
        slug,
        email,
        timezone: 'Europe/Paris',
        assignment_mode: 'all',
        settings: JSON.stringify({}),
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      await trx.table('invitations').insert({
        id: crypto.randomUUID(),
        mam_id: mamId,
        child_id: null,
        invited_by: user.id,
        email,
        role: 'mam_admin',
        token_hash: createHash('sha256').update(token).digest('hex'),
        expires_at: new Date(Date.now() + 7 * 86_400_000),
        created_at: new Date(),
        updated_at: new Date(),
      })
      await trx.table('audit_logs').insert({
        mam_id: mamId,
        actor_id: user.id,
        action: 'mam.created',
        subject_type: 'mam',
        subject_id: mamId,
        metadata: JSON.stringify({}),
        created_at: new Date(),
      })
    })
    const notifications = new NotificationService()
    const [notificationId] = await notifications.notifyUsers({
      mamId,
      recipientIds: [user.id],
      actorId: user.id,
      category: 'system',
      type: 'mam.created',
      title: `${name} créée`,
      body: `L’invitation administrateur a été envoyée à ${email}.`,
      actionUrl: '/super-admin/mams',
    })
    await notifications.queueExternalDelivery(notificationId, 'email', email, {
      title: `Administrez ${name} sur Nidilo`,
      body: 'Votre MAM vient d’être créée. Acceptez cette invitation pour configurer son espace.',
      actionUrl: new URL(`/invitations/${token}`, appUrl).toString(),
    })
    session.flash('success', 'MAM créée et invitation administrateur envoyée.')
    return response.redirect().back()
  }

  async update({ auth, request, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isSuperAdmin) return response.forbidden()
    const mam = await db.from('mams').where('id', params.id).first()
    if (!mam) return response.notFound()
    const active = request.input('active') === true
    await db.from('mams').where('id', mam.id).update({ active, updated_at: new Date() })
    await db.table('audit_logs').insert({
      mam_id: mam.id,
      actor_id: user.id,
      action: active ? 'mam.reactivated' : 'mam.suspended',
      subject_type: 'mam',
      subject_id: mam.id,
      metadata: JSON.stringify({}),
      created_at: new Date(),
    })
    session.flash('success', active ? 'MAM réactivée.' : 'MAM suspendue.')
    return response.redirect().back()
  }
}
