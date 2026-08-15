import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'
import db from '@adonisjs/lucid/services/db'

export default class PurgeExpiredContactRequests extends Job<Record<string, never>> {
  static options: JobOptions = { queue: 'maintenance', maxRetries: 3 }

  async execute() {
    const retentionLimit = new Date()
    retentionLimit.setUTCFullYear(retentionLimit.getUTCFullYear() - 1)

    await db.from('contact_requests').where('created_at', '<', retentionLimit).delete()
  }
}
