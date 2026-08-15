import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'
import db from '@adonisjs/lucid/services/db'

export default class PurgeSecurityArtifacts extends Job<Record<string, never>> {
  static options: JobOptions = { queue: 'maintenance', maxRetries: 3 }

  async execute() {
    const staleBuckets = new Date(Date.now() - 48 * 60 * 60_000)
    const expiredTokens = new Date(Date.now() - 24 * 60 * 60_000)
    await db.from('rate_limit_buckets').where('updated_at', '<', staleBuckets).delete()
    await db
      .from('password_reset_tokens')
      .where('expires_at', '<', expiredTokens)
      .orWhereNotNull('used_at')
      .delete()
  }
}
