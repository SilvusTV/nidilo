import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

test.group('Children administration', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('an admin creates a child without storing pilot medical data', async ({
    client,
    assert,
  }) => {
    const admin = await User.findByOrFail('email', 'admin@nidilo.test')
    const mam = await db
      .from('memberships')
      .where({ user_id: admin.id, role: 'admin' })
      .firstOrFail()
    const firstName = `Lou${crypto.randomUUID().slice(0, 6)}`

    const response = await client.post('/enfants').loginAs(admin).withCsrfToken().json({
      firstName,
      lastName: 'Test',
      birthDate: '2024-03-12',
      careStartedAt: '2026-01-05',
      allergies: 'Aucune connue',
    })
    response.assertStatus(200)
    const child = await db
      .from('children')
      .where({ mam_id: mam.mam_id, first_name: firstName })
      .first()
    assert.exists(child)
    assert.match(child.id, /^[0-9a-f-]{36}$/i)
    assert.isNull(child.allergies)
  })

  test('an assistant cannot create a child', async ({ client }) => {
    const mam = await db.from('mams').firstOrFail()
    const assistant = await User.create({
      fullName: 'Assistant creation test',
      email: `assistant-create-${crypto.randomUUID()}@example.test`,
      password: 'Assistant-Test-2026!',
      globalRole: 'member',
      status: 'active',
    })
    await db.table('memberships').insert({
      id: crypto.randomUUID(),
      mam_id: mam.id,
      user_id: assistant.id,
      role: 'assistant',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    })
    const response = await client.post('/enfants').loginAs(assistant).withCsrfToken().json({
      firstName: 'Interdit',
      lastName: 'Test',
      birthDate: '2024-01-01',
    })
    response.assertStatus(403)
  })
})
