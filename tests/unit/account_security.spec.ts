import {
  createRecoveryCodes,
  createTotpCode,
  createTotpSecret,
  hashRecoveryCode,
  verifyTotp,
} from '#services/totp_service'
import { test } from '@japa/runner'

test.group('Account security', () => {
  test('generates and verifies a time based one-time password', ({ assert }) => {
    const secret = createTotpSecret()
    const now = Date.UTC(2026, 7, 15, 12, 0, 0)
    assert.isTrue(verifyTotp(secret, createTotpCode(secret, now), now))
    assert.isFalse(verifyTotp(secret, '000000', now))
  })

  test('creates unique recovery codes stored as irreversible hashes', ({ assert }) => {
    const codes = createRecoveryCodes()
    assert.lengthOf(codes, 8)
    assert.equal(new Set(codes).size, 8)
    assert.match(hashRecoveryCode(codes[0]), /^[a-f0-9]{64}$/)
    assert.notEqual(hashRecoveryCode(codes[0]), codes[0])
  })
})
