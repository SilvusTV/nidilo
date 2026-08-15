import db from '@adonisjs/lucid/services/db'
import type User from '#models/user'

export type MamContext = {
  mamId: string
  mamName: string
  role: 'admin' | 'assistant' | 'parent'
  assignmentMode: 'all' | 'assigned'
  timezone: string
}

export async function getMamContext(user: User): Promise<MamContext | null> {
  const row = await db
    .from('memberships')
    .join('mams', 'mams.id', 'memberships.mam_id')
    .where('memberships.user_id', user.id)
    .where('memberships.status', 'active')
    .where('mams.active', true)
    .select(
      'mams.id as mamId',
      'mams.name as mamName',
      'mams.assignment_mode as assignmentMode',
      'mams.timezone',
      'memberships.role'
    )
    .first()
  return row ?? null
}

export async function assertChildAccess(
  user: User,
  context: MamContext,
  childId: string,
  write = false
) {
  const child = await db
    .from('children')
    .where({ id: childId, mam_id: context.mamId, active: true })
    .first()
  if (!child) return null
  if (user.isSuperAdmin || context.role === 'admin') return child
  if (context.role === 'parent') {
    if (write) return null
    const link = await db
      .from('child_guardians')
      .where({ child_id: childId, user_id: user.id, mam_id: context.mamId })
      .first()
    return link ? child : null
  }
  if (context.assignmentMode === 'all') return child
  const assignment = await db
    .from('child_staff')
    .where({ child_id: childId, user_id: user.id, mam_id: context.mamId })
    .first()
  return assignment ? child : null
}
