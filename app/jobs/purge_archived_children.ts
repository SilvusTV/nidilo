import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'
import db from '@adonisjs/lucid/services/db'
import { ImageStorageService } from '#services/image_storage_service'

export default class PurgeArchivedChildren extends Job<Record<string, never>> {
  static options: JobOptions = { queue: 'maintenance', maxRetries: 3 }

  async execute() {
    const children = await db
      .from('children')
      .whereNotNull('purge_at')
      .where('purge_at', '<=', new Date())
      .limit(50)
    const storage = new ImageStorageService()
    for (const child of children) {
      await storage.deleteChildMedia(child.mam_id, child.id)
      await db.table('audit_logs').insert({
        mam_id: child.mam_id,
        action: 'child.purged',
        subject_type: 'child',
        subject_id: child.id,
        metadata: JSON.stringify({ archivedAt: child.archived_at, purgeAt: child.purge_at }),
        created_at: new Date(),
      })
      await db.from('children').where('id', child.id).delete()
    }
  }
}
