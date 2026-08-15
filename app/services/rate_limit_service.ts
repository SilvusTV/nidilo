import env from '#start/env'
import db from '@adonisjs/lucid/services/db'
import { createHmac } from 'node:crypto'

type Limit = { limit: number; windowSeconds: number; blockSeconds?: number }

export type RateLimitResult = {
  allowed: boolean
  attempts: number
  retryAfter: number
}

export default class RateLimitService {
  private digest(action: string, identity: string) {
    return createHmac('sha256', env.get('APP_KEY').release())
      .update(`${action}:${identity.trim().toLowerCase()}`)
      .digest('hex')
  }

  async check(action: string, identity: string): Promise<RateLimitResult> {
    const bucket = await db
      .from('rate_limit_buckets')
      .where({ action, key_hash: this.digest(action, identity) })
      .first()
    const blockedUntil = bucket?.blocked_until ? new Date(bucket.blocked_until).getTime() : 0
    return {
      allowed: blockedUntil <= Date.now(),
      attempts: Number(bucket?.attempts ?? 0),
      retryAfter: Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000)),
    }
  }

  async hit(action: string, identity: string, config: Limit): Promise<RateLimitResult> {
    const now = new Date()
    const windowStart = new Date(Date.now() - config.windowSeconds * 1000)
    const blockSeconds = config.blockSeconds ?? config.windowSeconds
    const keyHash = this.digest(action, identity)
    const result = await db.rawQuery(
      `INSERT INTO rate_limit_buckets
        (id, action, key_hash, attempts, window_started_at, blocked_until, updated_at)
       VALUES (gen_random_uuid(), ?, ?, 1, ?, NULL, ?)
       ON CONFLICT (action, key_hash) DO UPDATE SET
         attempts = CASE
           WHEN rate_limit_buckets.window_started_at < ? THEN 1
           ELSE rate_limit_buckets.attempts + 1
         END,
         window_started_at = CASE
           WHEN rate_limit_buckets.window_started_at < ? THEN ?
           ELSE rate_limit_buckets.window_started_at
         END,
         blocked_until = CASE
           WHEN (CASE WHEN rate_limit_buckets.window_started_at < ? THEN 1 ELSE rate_limit_buckets.attempts + 1 END) > ?
             THEN ?
           ELSE rate_limit_buckets.blocked_until
         END,
         updated_at = ?
       RETURNING attempts, blocked_until`,
      [
        action,
        keyHash,
        now,
        now,
        windowStart,
        windowStart,
        now,
        windowStart,
        config.limit,
        new Date(Date.now() + blockSeconds * 1000),
        now,
      ]
    )
    const bucket = result.rows[0]
    const blockedUntil = bucket?.blocked_until ? new Date(bucket.blocked_until).getTime() : 0
    return {
      allowed: Number(bucket.attempts) <= config.limit,
      attempts: Number(bucket.attempts),
      retryAfter: Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000)),
    }
  }

  async clear(action: string, identity: string) {
    await db
      .from('rate_limit_buckets')
      .where({ action, key_hash: this.digest(action, identity) })
      .delete()
  }
}
