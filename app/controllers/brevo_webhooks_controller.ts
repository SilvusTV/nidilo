import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'
import { timingSafeEqual } from 'node:crypto'

type BrevoEvent = {
  'event'?: string
  'msg_status'?: string
  'description'?: string
  'messageId'?: string | number
  'message-id'?: string
  'tag'?: string | string[]
  'tags'?: string[]
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default class BrevoWebhooksController {
  async handle({ request, response }: HttpContext) {
    const expectedToken = env.get('BREVO_WEBHOOK_TOKEN')
    const authorization = request.header('authorization')
    if (!expectedToken || !secureEqual(authorization ?? '', `Bearer ${expectedToken}`))
      return response.unauthorized()

    const body = request.body() as BrevoEvent | BrevoEvent[]
    const events = Array.isArray(body) ? body : [body]
    for (const event of events) await this.applyEvent(event)
    return response.noContent()
  }

  private async applyEvent(event: BrevoEvent) {
    const tags = [event.tag, ...(event.tags ?? [])].flat().filter((tag): tag is string => !!tag)
    const deliveryId = tags.find((tag) => uuidPattern.test(tag))
    const providerMessageId = String(event['message-id'] ?? event.messageId ?? '')
    if (!deliveryId && !providerMessageId) return

    const query = db.from('notification_deliveries')
    if (deliveryId) query.where('id', deliveryId)
    else query.where('provider_message_id', providerMessageId)

    const providerStatus = String(event.msg_status ?? event.event ?? 'unknown')
    const normalizedStatus = providerStatus.toLowerCase().replace(/[_\s-]/g, '')
    const update: Record<string, unknown> = {
      provider_status: providerStatus.slice(0, 64),
      updated_at: new Date(),
    }
    if (normalizedStatus === 'delivered') update.delivered_at = new Date()
    if (
      [
        'hardbounce',
        'softbounce',
        'blocked',
        'invalid',
        'error',
        'rejected',
        'blacklisted',
      ].includes(normalizedStatus)
    ) {
      update.status = 'failed'
      update.last_error = String(event.description ?? providerStatus).slice(0, 2_000)
    }
    await query.update(update)
  }
}

function secureEqual(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received)
  const expectedBuffer = Buffer.from(expected)
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  )
}
