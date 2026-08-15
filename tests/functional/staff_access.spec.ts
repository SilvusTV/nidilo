import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import { createHash, randomBytes } from 'node:crypto'

async function createAssistant(mamId: string) {
  const user = await User.create({
    fullName: 'AM gestion équipe test',
    email: `am-staff-${crypto.randomUUID()}@example.test`,
    password: 'Assistant-Test-2026!',
    globalRole: 'member',
    status: 'active',
  })
  const id = crypto.randomUUID()
  await db.table('memberships').insert({
    id,
    mam_id: mamId,
    user_id: user.id,
    role: 'assistant',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  })
  return { user, membershipId: id }
}

test.group('Staff administration', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('an admin can invite an AM and update a staff role', async ({ client, assert }) => {
    const admin = await User.findByOrFail('email', 'admin@nidilo.test')
    const mam = await db.from('mams').firstOrFail()
    const email = `new-am-${crypto.randomUUID()}@example.test`
    const invitationResponse = await client
      .post('/personnel/invitations')
      .loginAs(admin)
      .withCsrfToken()
      .json({ email, role: 'assistant' })
    invitationResponse.assertStatus(200)
    const invitation = await db
      .from('invitations')
      .where({ mam_id: mam.id, email, role: 'assistant' })
      .whereNull('child_id')
      .first()
    assert.exists(invitation)

    const assistant = await createAssistant(mam.id)
    const updateResponse = await client
      .patch(`/personnel/${assistant.membershipId}`)
      .loginAs(admin)
      .withCsrfToken()
      .json({ role: 'admin', status: 'active' })
    updateResponse.assertStatus(200)
    const membership = await db
      .from('memberships')
      .where('id', assistant.membershipId)
      .firstOrFail()
    assert.equal(membership.role, 'admin')
  })

  test('an AM cannot manage staff and an admin cannot demote themself', async ({ client }) => {
    const admin = await User.findByOrFail('email', 'admin@nidilo.test')
    const mam = await db.from('mams').firstOrFail()
    const assistant = await createAssistant(mam.id)
    const denied = await client.get('/personnel').loginAs(assistant.user)
    denied.assertStatus(403)
    const ownMembership = await db
      .from('memberships')
      .where({ mam_id: mam.id, user_id: admin.id })
      .firstOrFail()
    const selfDemotion = await client
      .patch(`/personnel/${ownMembership.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .json({ role: 'assistant', status: 'active' })
    selfDemotion.assertStatus(200)
    const unchanged = await db.from('memberships').where('id', ownMembership.id).firstOrFail()
    if (unchanged.role !== 'admin') throw new Error('The admin was able to demote themself')
  })

  test('a professional invitation creates an AM membership without a child link', async ({
    client,
    assert,
  }) => {
    const admin = await User.findByOrFail('email', 'admin@nidilo.test')
    const mam = await db.from('mams').firstOrFail()
    const token = randomBytes(32).toString('base64url')
    const email = `accepted-am-${crypto.randomUUID()}@example.test`
    await db.table('invitations').insert({
      id: crypto.randomUUID(),
      mam_id: mam.id,
      child_id: null,
      invited_by: admin.id,
      email,
      role: 'assistant',
      token_hash: createHash('sha256').update(token).digest('hex'),
      expires_at: new Date(Date.now() + 86_400_000),
      created_at: new Date(),
      updated_at: new Date(),
    })
    const invitationPage = await client.get(`/invitations/${token}`)
    invitationPage.assertStatus(200)
    const accepted = await client.post(`/invitations/${token}`).withCsrfToken().json({
      fullName: 'Nouvelle AM Test',
      password: 'Nouvelle-AM-Test-2026!',
    })
    accepted.assertStatus(200)
    const account = await User.findByOrFail('email', email)
    const membership = await db
      .from('memberships')
      .where({ mam_id: mam.id, user_id: account.id })
      .firstOrFail()
    assert.equal(membership.role, 'assistant')
    const guardian = await db.from('child_guardians').where('user_id', account.id).first()
    assert.isNull(guardian)
  })
})
