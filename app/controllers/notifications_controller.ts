import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getMamContext } from '#services/access_service'
import { features } from '#config/features'

export default class NotificationsController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    const notificationsQuery = db
      .from('notifications')
      .where('user_id', user.id)
      .if(context, (query) => query.where('mam_id', context!.mamId))
    if (!features.healthData) notificationsQuery.whereNot('category', 'health')
    const notifications = await notificationsQuery
      .orderBy('created_at', 'desc')
      .limit(100)
      .select(
        'id',
        'category',
        'title',
        'body',
        'action_url as actionUrl',
        'read_at as readAt',
        'created_at as createdAt'
      )
    return inertia.render('notifications/index', { notifications })
  }

  async read({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await db
      .from('notifications')
      .where({ id: params.id, user_id: user.id })
      .update({ read_at: new Date(), updated_at: new Date() })
    return response.noContent()
  }

  async preferences({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context)
      return inertia.render('settings/notifications', {
        preferences: null,
        contact: { email: user.email, phone: user.phone },
        healthDataEnabled: features.healthData,
      })
    const preferences = await db
      .from('notification_preferences')
      .where({ mam_id: context.mamId, user_id: user.id })
      .first()
    return inertia.render('settings/notifications', {
      preferences: preferences
        ? {
            emailEnabled: preferences.email_enabled,
            smsEnabled: preferences.sms_enabled,
            quietHoursEnabled: preferences.quiet_hours_enabled,
            quietHoursStart: preferences.quiet_hours_start,
            quietHoursEnd: preferences.quiet_hours_end,
            categorySettings: preferences.category_settings,
          }
        : null,
      contact: { email: user.email, phone: user.phone },
      healthDataEnabled: features.healthData,
    })
  }

  async updatePreferences({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context) return response.forbidden()
    const body = request.only([
      'emailEnabled',
      'smsEnabled',
      'quietHoursEnabled',
      'quietHoursStart',
      'quietHoursEnd',
      'categories',
    ])
    const payload = {
      mam_id: context.mamId,
      user_id: user.id,
      email_enabled: body.emailEnabled === true,
      sms_enabled: body.smsEnabled === true && Boolean(user.phoneVerifiedAt),
      quiet_hours_enabled: body.quietHoursEnabled === true,
      quiet_hours_start: /^([01]\d|2[0-3]):[0-5]\d$/.test(body.quietHoursStart ?? '')
        ? body.quietHoursStart
        : null,
      quiet_hours_end: /^([01]\d|2[0-3]):[0-5]\d$/.test(body.quietHoursEnd ?? '')
        ? body.quietHoursEnd
        : null,
      category_settings: JSON.stringify({
        ...(typeof body.categories === 'object' && body.categories ? body.categories : {}),
        ...(!features.healthData ? { health: false } : {}),
      }),
      updated_at: new Date(),
    }
    await db
      .table('notification_preferences')
      .insert({ id: crypto.randomUUID(), ...payload, created_at: new Date() })
      .onConflict(['mam_id', 'user_id'])
      .merge(payload)
    session.flash('success', 'Préférences de notification enregistrées.')
    return response.redirect().back()
  }
}
