import type User from '#models/user'
import db from '@adonisjs/lucid/services/db'

export async function isPrivileged(user: User) {
  if (user.globalRole === 'super_admin') return true
  const membership = await db
    .from('memberships')
    .where({ user_id: user.id, role: 'admin', status: 'active' })
    .first()
  return Boolean(membership)
}

export async function getSecurityState(userId: string) {
  return db
    .from('users')
    .where('id', userId)
    .select(
      'security_version',
      'mfa_enabled',
      'mfa_secret',
      'mfa_recovery_codes',
      'mfa_confirmed_at'
    )
    .firstOrFail()
}
