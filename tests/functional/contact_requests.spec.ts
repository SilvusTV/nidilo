import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'

test.group('Public contact requests', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('shares a CSRF token with the public contact form', async ({ client, assert }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    assert.include(response.text(), 'csrfToken')
  })

  test('stores a valid request without exposing a sequential identifier', async ({
    client,
    assert,
  }) => {
    const email = `contact-${crypto.randomUUID()}@example.test`
    const response = await client.post('/contact').withCsrfToken().form({
      fullName: 'Camille Martin',
      email,
      phone: '0600000000',
      organization: 'MAM Les Petits Pas',
      role: 'mam',
      message: 'Je souhaite découvrir Nidilo pour notre équipe.',
      consent: 'on',
      website: '',
    })

    response.assertStatus(200)
    const contact = await db.from('contact_requests').where('email', email).firstOrFail()
    assert.match(contact.id, /^[0-9a-f-]{36}$/i)
    assert.equal(contact.status, 'new')
  })

  test('silently rejects honeypot submissions', async ({ client, assert }) => {
    const email = `robot-${crypto.randomUUID()}@example.test`
    const response = await client.post('/contact').withCsrfToken().form({
      fullName: 'Automate',
      email,
      role: 'other',
      message: 'Ceci est une soumission automatisée volontairement assez longue.',
      consent: 'on',
      website: 'https://spam.example',
    })

    response.assertStatus(200)
    const result = await db.from('contact_requests').where('email', email).first()
    assert.isNull(result)
  })
})
