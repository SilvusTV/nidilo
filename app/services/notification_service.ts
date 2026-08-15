import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import DeliverNotification from '#jobs/deliver_notification'
import RateLimitService from '#services/rate_limit_service'

export type NotificationCategory =
  'daily_report' | 'message' | 'health' | 'guardian_invitation' | 'establishment' | 'system'

type NotificationInput = {
  mamId: string
  recipientIds: string[]
  actorId?: string
  category: NotificationCategory
  type: string
  title: string
  body?: string
  actionUrl?: string
  data?: Record<string, unknown>
}

export default class NotificationService {
  async notifyMamAdmins(input: Omit<NotificationInput, 'recipientIds'>) {
    const adminRows = await db
      .from('memberships')
      .where({ mam_id: input.mamId, role: 'admin', status: 'active' })
      .select('user_id')
    return this.notifyUsers({ ...input, recipientIds: adminRows.map((row) => row.user_id) })
  }

  async notifyUsers(input: NotificationInput) {
    const recipientIds = [...new Set(input.recipientIds)]
    const created: string[] = []
    for (const userId of recipientIds) {
      const [notification] = await db
        .table('notifications')
        .insert({
          id: crypto.randomUUID(),
          mam_id: input.mamId,
          user_id: userId,
          actor_id: input.actorId ?? null,
          category: input.category,
          type: input.type,
          title: input.title.slice(0, 255),
          body: input.body?.slice(0, 2_000) ?? null,
          action_url: input.actionUrl?.slice(0, 1024) ?? null,
          data: JSON.stringify(input.data ?? {}),
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('id')
      created.push(notification.id)
      await this.queueConfiguredDeliveries(notification.id, input.mamId, userId, input.category)
    }
    return created
  }

  async queueExternalDelivery(
    notificationId: string,
    channel: 'email' | 'sms',
    destination: string,
    content?: { title?: string; body?: string; actionUrl?: string },
    delayMs = 0
  ) {
    const limit = await new RateLimitService().hit(`notification-${channel}`, destination, {
      limit: channel === 'sms' ? 30 : 100,
      windowSeconds: 60 * 60,
    })
    if (!limit.allowed) return
    const deliveryId = crypto.randomUUID()
    await db.table('notification_deliveries').insert({
      id: deliveryId,
      notification_id: notificationId,
      channel,
      destination,
      title: content?.title?.slice(0, 255) ?? null,
      body: content?.body?.slice(0, 2_000) ?? null,
      action_url: content?.actionUrl?.slice(0, 1024) ?? null,
      status: 'queued',
      attempts: 0,
      created_at: new Date(),
      updated_at: new Date(),
    })
    const job = DeliverNotification.dispatch({ deliveryId }).toQueue('notifications')
    if (delayMs > 0) job.in(delayMs)
    await job
  }

  private async queueConfiguredDeliveries(
    notificationId: string,
    mamId: string,
    userId: string,
    category: NotificationCategory
  ) {
    const user = await db
      .from('users')
      .where('id', userId)
      .select('email', 'phone', 'phone_verified_at')
      .first()
    if (!user) return
    const preferences = await db
      .from('notification_preferences')
      .where({ mam_id: mamId, user_id: userId })
      .first()
    const categories = preferences?.category_settings ?? {}
    if (categories[category] === false) return
    const delayMs = await this.getQuietHoursDelay(preferences, mamId, category)
    if (preferences?.email_enabled && user.email) {
      await this.queueExternalDelivery(notificationId, 'email', user.email, undefined, delayMs)
    }
    if (preferences?.sms_enabled && user.phone && user.phone_verified_at) {
      await this.queueExternalDelivery(notificationId, 'sms', user.phone, undefined, delayMs)
    }
  }

  private async getQuietHoursDelay(
    preferences: Record<string, any> | undefined,
    mamId: string,
    category: NotificationCategory
  ) {
    if (
      category === 'health' ||
      !preferences?.quiet_hours_enabled ||
      !preferences.quiet_hours_start ||
      !preferences.quiet_hours_end
    )
      return 0
    const mam = await db.from('mams').where('id', mamId).select('timezone').first()
    const now = DateTime.now().setZone(mam?.timezone || 'Europe/Paris')
    const [startHour, startMinute] = String(preferences.quiet_hours_start)
      .slice(0, 5)
      .split(':')
      .map(Number)
    const [endHour, endMinute] = String(preferences.quiet_hours_end)
      .slice(0, 5)
      .split(':')
      .map(Number)
    let start = now.set({ hour: startHour, minute: startMinute, second: 0, millisecond: 0 })
    let end = now.set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 })
    if (end <= start) {
      if (now < end) start = start.minus({ days: 1 })
      else end = end.plus({ days: 1 })
    }
    if (now < start || now >= end) return 0
    return Math.max(0, end.toMillis() - now.toMillis())
  }
}
