import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'
import db from '@adonisjs/lucid/services/db'

export default class PurgeExpiredPrivacyRecords extends Job<Record<string, never>> {
  static options: JobOptions = { queue: 'maintenance', maxRetries: 3 }

  async execute() {
    const retentionLimit = new Date()
    retentionLimit.setUTCFullYear(retentionLimit.getUTCFullYear() - 1)

    await db.from('notifications').where('created_at', '<', retentionLimit).delete()
    await db.from('audit_logs').where('created_at', '<', retentionLimit).delete()
    await db
      .from('invitations')
      .where('created_at', '<', retentionLimit)
      .where((query) => query.whereNotNull('accepted_at').orWhere('expires_at', '<', new Date()))
      .delete()
  }
}
