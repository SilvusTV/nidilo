import User from '#models/user'
import { test } from '@japa/runner'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'
import { createHash, randomBytes } from 'node:crypto'

test.group('Account security flows', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('does not reveal whether a password reset account exists', async ({ client }) => {
    const response = await client
      .post('/mot-de-passe-oublie')
      .withCsrfToken()
      .form({
        email: `unknown-${crypto.randomUUID()}@example.test`,
      })
    response.assertStatus(200)
    response.assertTextIncludes('Si un compte correspond')
  })

  test('resets a password with a single-use token and increments the security version', async ({
    client,
    assert,
  }) => {
    const user = await User.create({
      fullName: 'Compte sécurisé',
      email: `security-${crypto.randomUUID()}@example.test`,
      password: 'Ancien-Mot-De-Passe-2026!',
      globalRole: 'member',
      status: 'active',
    })
    const token = randomBytes(32).toString('base64url')
    await db.table('password_reset_tokens').insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      token_hash: createHash('sha256').update(token).digest('hex'),
      expires_at: new Date(Date.now() + 30 * 60_000),
      created_at: new Date(),
    })
    const response = await client
      .post(`/reinitialiser-mot-de-passe/${token}`)
      .withCsrfToken()
      .form({
        password: 'Nouveau-Mot-De-Passe-2026!',
        passwordConfirmation: 'Nouveau-Mot-De-Passe-2026!',
      })
    response.assertStatus(200)
    const updated = await db.from('users').where('id', user.id).firstOrFail()
    assert.equal(updated.security_version, 2)
    assert.isTrue(await hash.verify(updated.password, 'Nouveau-Mot-De-Passe-2026!'))
    const reset = await db.from('password_reset_tokens').where('user_id', user.id).firstOrFail()
    assert.isNotNull(reset.used_at)
  })

  test('requires a captcha after repeated invalid passwords', async ({ client }) => {
    const email = `login-${crypto.randomUUID()}@example.test`
    await User.create({
      fullName: 'Connexion protégée',
      email,
      password: 'Mot-De-Passe-Valide-2026!',
      globalRole: 'member',
      status: 'active',
    })
    for (let attempt = 0; attempt < 3; attempt++) {
      await client.post('/login').withCsrfToken().form({ email, password: 'incorrect' })
    }
    const page = await client.get('/login')
    page.assertStatus(200)
    page.assertTextIncludes('Contrôle anti-robot')
  })
})
