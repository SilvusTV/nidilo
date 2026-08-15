import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'

test.group('Brevo webhooks', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('rejects an unauthenticated callback', async ({ client }) => {
    const response = await client.post('/webhooks/brevo').json({ event: 'delivered' })
    response.assertStatus(401)
  })

  test('records a delivered transactional message', async ({ client, assert }) => {
    const user = await db.from('users').firstOrFail()
    const mam = await db.from('mams').firstOrFail()
    const notificationId = crypto.randomUUID()
    const deliveryId = crypto.randomUUID()
    await db.table('notifications').insert({
      id: notificationId,
      mam_id: mam.id,
      user_id: user.id,
      category: 'system',
      type: 'test.brevo',
      title: 'Test Brevo',
      data: JSON.stringify({}),
      created_at: new Date(),
      updated_at: new Date(),
    })
    await db.table('notification_deliveries').insert({
      id: deliveryId,
      notification_id: notificationId,
      channel: 'email',
      destination: 'recipient@example.test',
      status: 'sent',
      attempts: 1,
      provider_message_id: '<message@brevo.test>',
      provider_status: 'accepted',
      created_at: new Date(),
      updated_at: new Date(),
    })

    const response = await client
      .post('/webhooks/brevo')
      .header('authorization', `Bearer ${env.get('BREVO_WEBHOOK_TOKEN')}`)
      .json({ 'event': 'delivered', 'message-id': '<message@brevo.test>' })

    response.assertStatus(204)
    const delivery = await db.from('notification_deliveries').where('id', deliveryId).firstOrFail()
    assert.equal(delivery.provider_status, 'delivered')
    assert.isNotNull(delivery.delivered_at)
  })
})
