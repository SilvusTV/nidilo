import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'
import BrevoService from '#services/brevo_service'

type Payload = { deliveryId: string }

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!
  )

export default class DeliverNotification extends Job<Payload> {
  static options: JobOptions = { queue: 'notifications', maxRetries: 4 }

  async execute() {
    const delivery = await db
      .from('notification_deliveries')
      .join('notifications', 'notifications.id', 'notification_deliveries.notification_id')
      .where('notification_deliveries.id', this.payload.deliveryId)
      .select(
        'notification_deliveries.*',
        'notifications.title as notification_title',
        'notifications.body as notification_body',
        'notifications.action_url as notification_action_url',
        'notifications.category as notification_category'
      )
      .first()
    if (!delivery || delivery.status === 'sent') return
    await db.from('notification_deliveries').where('id', delivery.id).increment('attempts', 1)

    const title = delivery.title ?? delivery.notification_title
    const body = delivery.body ?? delivery.notification_body ?? ''
    const actionUrl = delivery.action_url ?? delivery.notification_action_url
    const absoluteActionUrl = actionUrl ? new URL(actionUrl, env.get('APP_URL')).toString() : null
    const brevo = new BrevoService()
    if (!brevo.isConfigured) {
      await db.from('notification_deliveries').where('id', delivery.id).update({
        status: 'skipped',
        last_error: 'Brevo non configuré',
        updated_at: new Date(),
      })
      return
    }

    let providerMessageId: string
    if (delivery.channel === 'email') {
      const action = absoluteActionUrl
        ? `<p><a href="${escapeHtml(absoluteActionUrl)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#224833;color:#fff;text-decoration:none;font-weight:700">Ouvrir mon espace Nidilo</a></p>`
        : ''
      const result = await brevo.sendEmail({
        to: delivery.destination,
        subject: title,
        idempotencyKey: delivery.id,
        tags: ['nidilo', delivery.id],
        htmlContent: `<!doctype html><html lang="fr"><body style="margin:0;background:#f8f5ee;font-family:Arial,sans-serif;color:#224833"><main style="max-width:560px;margin:32px auto;padding:32px;border-radius:18px;background:#fff"><p style="font-weight:800">Nidilo</p><h1 style="font-size:24px">${escapeHtml(title)}</h1><p style="line-height:1.6;color:#53665a">${escapeHtml(body)}</p>${action}<p style="margin-top:28px;font-size:12px;color:#718077">Cet e-mail a été envoyé selon vos préférences de notification Nidilo.</p></main></body></html>`,
      })
      providerMessageId = result.messageId
    } else {
      const smsContent = [
        'Nidilo : une nouvelle notification est disponible dans votre espace securise.',
        absoluteActionUrl,
      ]
        .filter(Boolean)
        .join(' ')
      const result = await brevo.sendSms({
        to: delivery.destination,
        content: smsContent,
        tag: delivery.id,
      })
      providerMessageId = String(result.messageId)
    }
    await db.from('notification_deliveries').where('id', delivery.id).update({
      status: 'sent',
      provider_message_id: providerMessageId,
      provider_status: 'accepted',
      sent_at: new Date(),
      last_error: null,
      updated_at: new Date(),
    })
  }

  async failed(error: Error) {
    await db
      .from('notification_deliveries')
      .where('id', this.payload.deliveryId)
      .update({
        status: 'failed',
        last_error: error.message.slice(0, 2_000),
        updated_at: new Date(),
      })
  }
}
