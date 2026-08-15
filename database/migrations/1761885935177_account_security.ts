import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.integer('security_version').notNullable().defaultTo(1)
      table.boolean('mfa_enabled').notNullable().defaultTo(false)
      table.text('mfa_secret').nullable()
      table.jsonb('mfa_recovery_codes').notNullable().defaultTo('[]')
      table.timestamp('mfa_confirmed_at').nullable()
    })

    this.schema.createTable('password_reset_tokens', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('token_hash', 64).notNullable().unique()
      table.timestamp('expires_at').notNullable()
      table.timestamp('used_at').nullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.index(['user_id', 'expires_at'])
    })

    this.schema.createTable('rate_limit_buckets', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('action', 64).notNullable()
      table.string('key_hash', 64).notNullable()
      table.integer('attempts').notNullable().defaultTo(0)
      table.timestamp('window_started_at').notNullable()
      table.timestamp('blocked_until').nullable()
      table.timestamp('updated_at').notNullable().defaultTo(this.now())
      table.unique(['action', 'key_hash'])
      table.index(['updated_at'])
    })
  }

  async down() {
    this.schema.dropTable('rate_limit_buckets')
    this.schema.dropTable('password_reset_tokens')
    this.schema.alterTable('users', (table) => {
      table.dropColumns(
        'security_version',
        'mfa_enabled',
        'mfa_secret',
        'mfa_recovery_codes',
        'mfa_confirmed_at'
      )
    })
  }
}
