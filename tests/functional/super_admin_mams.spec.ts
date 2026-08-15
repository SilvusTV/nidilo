import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

test.group('Super admin MAM management', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('a super admin creates and suspends a MAM while a member is denied', async ({
    client,
    assert,
  }) => {
    const superAdmin = await User.findByOrFail('email', 'superadmin@nidilo.test')
    const member = await User.findByOrFail('email', 'admin@nidilo.test')
    const denied = await client.get('/super-admin/mams').loginAs(member)
    denied.assertStatus(403)
    const name = `MAM Super Test ${crypto.randomUUID().slice(0, 6)}`
    const adminEmail = `mam-admin-${crypto.randomUUID()}@example.test`
    const created = await client
      .post('/super-admin/mams')
      .loginAs(superAdmin)
      .withCsrfToken()
      .json({ name, adminEmail })
    created.assertStatus(200)
    const mam = await db.from('mams').where('name', name).firstOrFail()
    assert.match(mam.id, /^[0-9a-f-]{36}$/i)
    const invitation = await db
      .from('invitations')
      .where({ mam_id: mam.id, email: adminEmail, role: 'mam_admin' })
      .whereNull('child_id')
      .first()
    assert.exists(invitation)
    const suspended = await client
      .patch(`/super-admin/mams/${mam.id}`)
      .loginAs(superAdmin)
      .withCsrfToken()
      .json({ active: false })
    suspended.assertStatus(200)
    const updated = await db.from('mams').where('id', mam.id).firstOrFail()
    assert.isFalse(updated.active)
  })
})
