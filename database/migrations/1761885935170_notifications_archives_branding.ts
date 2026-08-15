import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.string('phone', 32).nullable()
      table.timestamp('phone_verified_at').nullable()
    })
    this.schema.alterTable('mams', (table) => {
      table.string('theme_key', 32).notNullable().defaultTo('sage')
      table.integer('child_retention_days').notNullable().defaultTo(365)
      table.string('logo_key', 1024).nullable()
    })
    this.schema.alterTable('children', (table) => {
      table.timestamp('archived_at').nullable()
      table.timestamp('purge_at').nullable()
      table.uuid('archived_by').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.index(['mam_id', 'archived_at', 'purge_at'])
    })
    this.schema.alterTable('child_guardians', (table) => {
      table.boolean('can_invite').notNullable().defaultTo(true).alter()
    })
    this.schema.createTable('notification_preferences', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('mam_id').notNullable().references('id').inTable('mams').onDelete('CASCADE')
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.boolean('email_enabled').notNullable().defaultTo(false)
      table.boolean('sms_enabled').notNullable().defaultTo(false)
      table.boolean('quiet_hours_enabled').notNullable().defaultTo(false)
      table.time('quiet_hours_start').nullable()
      table.time('quiet_hours_end').nullable()
      table.jsonb('category_settings').notNullable().defaultTo('{}')
      table.timestamps(true, true)
      table.unique(['mam_id', 'user_id'])
    })
    this.schema.alterTable('notifications', (table) => {
      table.uuid('mam_id').nullable().references('id').inTable('mams').onDelete('CASCADE')
      table.uuid('actor_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.string('category', 64).notNullable().defaultTo('general')
      table.string('action_url', 1024).nullable()
    })
    this.schema.createTable('notification_deliveries', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('notification_id')
        .notNullable()
        .references('id')
        .inTable('notifications')
        .onDelete('CASCADE')
      table.enum('channel', ['email', 'sms']).notNullable()
      table.string('destination').notNullable()
      table
        .enum('status', ['queued', 'sent', 'failed', 'skipped'])
        .notNullable()
        .defaultTo('queued')
      table.integer('attempts').notNullable().defaultTo(0)
      table.text('last_error').nullable()
      table.timestamp('sent_at').nullable()
      table.timestamps(true, true)
      table.unique(['notification_id', 'channel'])
      table.index(['status', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable('notification_deliveries')
    this.schema.alterTable('notifications', (table) =>
      table.dropColumns('mam_id', 'actor_id', 'category', 'action_url')
    )
    this.schema.dropTable('notification_preferences')
    this.schema.alterTable('children', (table) =>
      table.dropColumns('archived_at', 'purge_at', 'archived_by')
    )
    this.schema.alterTable('mams', (table) =>
      table.dropColumns('theme_key', 'child_retention_days', 'logo_key')
    )
    this.schema.alterTable('users', (table) => table.dropColumns('phone', 'phone_verified_at'))
  }
}
