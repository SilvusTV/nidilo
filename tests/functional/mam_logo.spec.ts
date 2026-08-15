import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import sharp from 'sharp'
import { ImageStorageService } from '#services/image_storage_service'

test.group('MAM logo', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('an admin stores a converted logo in the MAM MiniO compartment', async ({
    client,
    assert,
  }) => {
    const admin = await User.create({
      fullName: 'Admin logo test',
      email: `admin-logo-${crypto.randomUUID()}@example.test`,
      password: 'Admin-Logo-Test-2026!',
      globalRole: 'member',
      status: 'active',
    })
    const mamId = crypto.randomUUID()
    await db.table('mams').insert({
      id: mamId,
      name: 'MAM logo test',
      slug: `mam-logo-${crypto.randomUUID()}`,
      timezone: 'Europe/Paris',
      assignment_mode: 'all',
      settings: JSON.stringify({}),
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })
    await db.table('memberships').insert({
      id: crypto.randomUUID(),
      mam_id: mamId,
      user_id: admin.id,
      role: 'admin',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    })
    const source = await sharp({
      create: { width: 80, height: 80, channels: 4, background: '#789780' },
    })
      .png()
      .toBuffer()
    const response = await client
      .post('/parametres/mam/logo')
      .loginAs(admin)
      .withCsrfToken()
      .file('logo', source, { filename: 'logo-test.png', contentType: 'image/png' })
    response.assertStatus(200)
    const updated = await db.from('mams').where('id', mamId).select('logo_key').firstOrFail()
    assert.match(updated.logo_key, new RegExp(`^mams/${mamId}/branding/[0-9a-f-]+\\.webp$`))
    const storage = new ImageStorageService()
    const chunks: Buffer[] = []
    const object = await storage.getObject(updated.logo_key)
    for await (const chunk of object) chunks.push(Buffer.from(chunk))
    const metadata = await sharp(Buffer.concat(chunks)).metadata()
    assert.equal(metadata.format, 'webp')
    await storage.deleteObject(updated.logo_key)
  })
})
