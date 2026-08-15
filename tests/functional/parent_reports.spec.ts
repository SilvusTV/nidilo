import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import { DateTime } from 'luxon'

async function parentFixture() {
  const mam = await db.from('mams').where('active', true).firstOrFail()
  const adminMembership = await db
    .from('memberships')
    .where({ mam_id: mam.id, role: 'admin', status: 'active' })
    .firstOrFail()
  const admin = await User.findOrFail(adminMembership.user_id)
  const parent = await User.create({
    fullName: 'Parent calendrier test',
    email: `parent-calendar-${crypto.randomUUID()}@example.test`,
    password: 'Parent-Calendar-2026!',
    globalRole: 'member',
    status: 'active',
  })
  const childId = crypto.randomUUID()
  await db.table('children').insert({
    id: childId,
    mam_id: mam.id,
    first_name: 'Calendria',
    last_name: 'Test',
    birth_date: '2024-02-10',
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
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
    child_id: childId,
    user_id: parent.id,
    relationship: 'parent',
    can_invite: true,
    created_at: new Date(),
    updated_at: new Date(),
  })
  return { mam, admin, parent, childId }
}

test.group('Parent report history', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('a parent calendar exposes only published reports for their child', async ({ client }) => {
    const { mam, admin, parent, childId } = await parentFixture()
    const publishedDate = '2026-07-14'
    const draftDate = '2026-07-15'
    for (const [date, status] of [
      [publishedDate, 'published'],
      [draftDate, 'draft'],
    ] as const)
      await db.table('daily_reports').insert({
        id: crypto.randomUUID(),
        mam_id: mam.id,
        child_id: childId,
        created_by: admin.id,
        report_date: date,
        status,
        naps: JSON.stringify([]),
        meals: JSON.stringify([]),
        diapers: JSON.stringify([]),
        activities: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date(),
      })
    const calendar = await client.get(`/enfants/${childId}/calendrier?mois=2026-07`).loginAs(parent)
    calendar.assertStatus(200)
    calendar.assertTextIncludes(`\"reportDate\":\"${publishedDate}\"`)
    const dashboard = await client.get('/dashboard').loginAs(parent)
    dashboard.assertTextIncludes(`\"latestReportDate\":\"${publishedDate}\"`)
    const published = await client.get(`/enfants/${childId}/fiche/${publishedDate}`).loginAs(parent)
    published.assertStatus(200)
    const draft = await client.get(`/enfants/${childId}/fiche/${draftDate}`).loginAs(parent)
    draft.assertStatus(404)
  })

  test('publishing a report notifies the parent and prepares their enabled email', async ({
    client,
    assert,
  }) => {
    const { mam, admin, parent, childId } = await parentFixture()
    await db.table('notification_preferences').insert({
      id: crypto.randomUUID(),
      mam_id: mam.id,
      user_id: parent.id,
      email_enabled: true,
      sms_enabled: false,
      quiet_hours_enabled: false,
      category_settings: JSON.stringify({ daily_report: true }),
      created_at: new Date(),
      updated_at: new Date(),
    })
    const response = await client
      .put(`/enfants/${childId}/fiche`)
      .loginAs(admin)
      .withCsrfToken()
      .json({
        mood: 'good',
        naps: [],
        meals: [],
        diapers: [],
        activities: [],
        noteHtml: '<p>Une belle journée</p>',
        status: 'published',
      })
    response.assertStatus(200)
    const today = DateTime.now().setZone(mam.timezone).toISODate()
    const notification = await db
      .from('notifications')
      .where({ user_id: parent.id, category: 'daily_report' })
      .firstOrFail()
    assert.equal(notification.action_url, `/enfants/${childId}/fiche/${today}`)
    const delivery = await db
      .from('notification_deliveries')
      .where({ notification_id: notification.id, channel: 'email' })
      .first()
    assert.exists(delivery)
  })
})
