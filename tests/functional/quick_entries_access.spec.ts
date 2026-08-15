import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import { DateTime } from 'luxon'

async function member(role: 'assistant' | 'parent', mamId: string) {
  const user = await User.create({
    fullName: `${role} quick entry test`,
    email: `${role}-${crypto.randomUUID()}@example.test`,
    password: 'Quick-Test-2026!',
    globalRole: 'member',
    status: 'active',
  })
  await db.table('memberships').insert({
    id: crypto.randomUUID(),
    mam_id: mamId,
    user_id: user.id,
    role,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  })
  return user
}

test.group('Quick entries access', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('an assigned assistant can add an event only to an assigned child', async ({
    client,
    assert,
  }) => {
    const mam = await db.from('mams').firstOrFail()
    const children = await db
      .from('children')
      .where('mam_id', mam.id)
      .orderBy('first_name')
      .limit(2)
    assert.lengthOf(children, 2)
    await db.from('mams').where('id', mam.id).update({ assignment_mode: 'assigned' })
    const assistant = await member('assistant', mam.id)
    await db.table('child_staff').insert({
      mam_id: mam.id,
      child_id: children[0].id,
      user_id: assistant.id,
    })
    await db.table('daily_events').insert({
      id: crypto.randomUUID(),
      request_id: crypto.randomUUID(),
      mam_id: mam.id,
      child_id: children[1].id,
      created_by: assistant.id,
      kind: 'meal',
      occurred_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    })
    const page = await client.get('/saisie-rapide').loginAs(assistant)
    page.assertStatus(200)
    page.assertTextIncludes(children[0].first_name)
    assert.notInclude(page.text(), children[1].first_name)

    const requestId = crypto.randomUUID()
    const allowed = await client.post('/saisie-rapide').loginAs(assistant).withCsrfToken().json({
      childId: children[0].id,
      kind: 'diaper',
      time: '10:15',
      comment: 'Couche mouillée',
      requestId,
    })
    allowed.assertStatus(200)

    const repeated = await client.post('/saisie-rapide').loginAs(assistant).withCsrfToken().json({
      childId: children[0].id,
      kind: 'diaper',
      time: '10:15',
      comment: 'Couche mouillée',
      requestId,
    })
    repeated.assertStatus(200)
    const rows = await db.from('daily_events').where('request_id', requestId)
    assert.lengthOf(rows, 1)

    const forbidden = await client.post('/saisie-rapide').loginAs(assistant).withCsrfToken().json({
      childId: children[1].id,
      kind: 'meal',
      time: '11:30',
      requestId: crypto.randomUUID(),
    })
    forbidden.assertStatus(404)
  })

  test('a parent cannot open or write to quick entries', async ({ client }) => {
    const mam = await db.from('mams').firstOrFail()
    const child = await db.from('children').where('mam_id', mam.id).firstOrFail()
    const parent = await member('parent', mam.id)
    await db.table('child_guardians').insert({
      id: crypto.randomUUID(),
      mam_id: mam.id,
      child_id: child.id,
      user_id: parent.id,
      relationship: 'parent',
      can_invite: true,
      created_at: new Date(),
      updated_at: new Date(),
    })

    const page = await client.get('/saisie-rapide').loginAs(parent)
    page.assertStatus(403)
    const write = await client.post('/saisie-rapide').loginAs(parent).withCsrfToken().json({
      childId: child.id,
      kind: 'nap',
      time: '13:00',
      requestId: crypto.randomUUID(),
    })
    write.assertStatus(403)
  })

  test('a completed nap stores its start and end times', async ({ client, assert }) => {
    const admin = await User.findByOrFail('email', 'admin@nidilo.test')
    const mam = await db.from('mams').firstOrFail()
    const child = await db.from('children').where('mam_id', mam.id).firstOrFail()
    const now = DateTime.now().setZone(mam.timezone)
    const start = now.minus({ minutes: 35 }).toFormat('HH:mm')
    const end = now.toFormat('HH:mm')
    const requestId = crypto.randomUUID()
    const response = await client.post('/saisie-rapide').loginAs(admin).withCsrfToken().json({
      childId: child.id,
      kind: 'nap',
      time: start,
      endTime: end,
      requestId,
    })
    response.assertStatus(200)
    const event = await db.from('daily_events').where('request_id', requestId).firstOrFail()
    assert.exists(event.ended_at)
    assert.isAbove(new Date(event.ended_at).getTime(), new Date(event.occurred_at).getTime())
  })
})
