import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

test.group('Child profile access', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('a parent can open only a linked child profile', async ({ client, assert }) => {
    const mam = await db.from('mams').firstOrFail()
    const children = await db
      .from('children')
      .where('mam_id', mam.id)
      .orderBy('first_name')
      .limit(2)
    assert.lengthOf(children, 2)
    const parent = await User.create({
      fullName: 'Parent isolation test',
      email: `parent-${crypto.randomUUID()}@example.test`,
      password: 'Parent-Test-2026!',
      globalRole: 'member',
      status: 'active',
    })
    await db.table('memberships').insert({
      id: crypto.randomUUID(),
      mam_id: mam.id,
      user_id: parent.id,
      role: 'parent',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    })
    await db.table('child_guardians').insert({
      id: crypto.randomUUID(),
      mam_id: mam.id,
      child_id: children[0].id,
      user_id: parent.id,
      relationship: 'parent',
      can_invite: true,
      created_at: new Date(),
      updated_at: new Date(),
    })

    const linked = await client.get(`/enfants/${children[0].id}/dossier`).loginAs(parent)
    linked.assertStatus(200)
    const unrelated = await client.get(`/enfants/${children[1].id}/dossier`).loginAs(parent)
    unrelated.assertStatus(404)
  })
})
