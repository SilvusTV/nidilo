import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('mams', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()
      table.string('email', 254).nullable()
      table.string('phone', 32).nullable()
      table.text('address').nullable()
      table.text('description').nullable()
      table.string('timezone').notNullable().defaultTo('Europe/Paris')
      table.enum('assignment_mode', ['all', 'assigned']).notNullable().defaultTo('all')
      table.jsonb('settings').notNullable().defaultTo('{}')
      table.boolean('active').notNullable().defaultTo(true)
      table.timestamps(true, true)
    })

    this.schema.createTable('memberships', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('mam_id').notNullable().references('id').inTable('mams').onDelete('CASCADE')
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.enum('role', ['admin', 'assistant', 'parent']).notNullable()
      table.enum('status', ['active', 'invited', 'suspended']).notNullable().defaultTo('active')
      table.timestamps(true, true)
      table.unique(['mam_id', 'user_id'])
      table.index(['mam_id', 'role'])
    })

    this.schema.createTable('children', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('mam_id').notNullable().references('id').inTable('mams').onDelete('RESTRICT')
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.date('birth_date').notNullable()
      table.string('photo_key').nullable()
      table.text('allergies').nullable()
      table.text('medical_notes_html').nullable()
      table.boolean('active').notNullable().defaultTo(true)
      table.timestamps(true, true)
      table.index(['mam_id', 'active'])
    })

    this.schema.createTable('child_staff', (table) => {
      table.uuid('mam_id').notNullable().references('id').inTable('mams').onDelete('CASCADE')
      table.uuid('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE')
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.primary(['child_id', 'user_id'])
      table.index(['mam_id', 'user_id'])
    })

    this.schema.createTable('child_guardians', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('mam_id').notNullable().references('id').inTable('mams').onDelete('CASCADE')
      table.uuid('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE')
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table
        .enum('relationship', ['parent', 'grandparent', 'nanny', 'guardian', 'other'])
        .notNullable()
      table.boolean('can_invite').notNullable().defaultTo(false)
      table.timestamps(true, true)
      table.unique(['child_id', 'user_id'])
      table.index(['mam_id', 'user_id'])
    })

    this.schema.createTable('daily_reports', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('mam_id').notNullable().references('id').inTable('mams').onDelete('CASCADE')
      table.uuid('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE')
      table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('RESTRICT')
      table.date('report_date').notNullable()
      table.enum('status', ['draft', 'published']).notNullable().defaultTo('draft')
      table.enum('mood', ['great', 'good', 'mixed', 'difficult']).nullable()
      table.jsonb('naps').notNullable().defaultTo('[]')
      table.jsonb('meals').notNullable().defaultTo('[]')
      table.jsonb('diapers').notNullable().defaultTo('[]')
      table.jsonb('activities').notNullable().defaultTo('[]')
      table.decimal('temperature', 4, 1).nullable()
      table.text('note_html').nullable()
      table.timestamp('published_at').nullable()
      table.timestamps(true, true)
      table.unique(['child_id', 'report_date'])
      table.index(['mam_id', 'report_date'])
    })

    this.schema.createTable('health_entries', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('mam_id').notNullable().references('id').inTable('mams').onDelete('CASCADE')
      table.uuid('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE')
      table.uuid('author_id').notNullable().references('id').inTable('users').onDelete('RESTRICT')
      table.enum('kind', ['health', 'medication', 'allergy', 'instruction', 'other']).notNullable()
      table.text('content_html').notNullable()
      table.timestamps(true, true)
      table.index(['child_id', 'created_at'])
    })

    this.schema.createTable('messages', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('mam_id').notNullable().references('id').inTable('mams').onDelete('CASCADE')
      table.uuid('child_id').nullable().references('id').inTable('children').onDelete('CASCADE')
      table.uuid('author_id').notNullable().references('id').inTable('users').onDelete('RESTRICT')
      table.text('content_html').notNullable()
      table.timestamps(true, true)
      table.index(['mam_id', 'child_id', 'created_at'])
    })

    this.schema.createTable('notifications', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('type').notNullable()
      table.string('title').notNullable()
      table.text('body').nullable()
      table.jsonb('data').notNullable().defaultTo('{}')
      table.timestamp('read_at').nullable()
      table.timestamps(true, true)
      table.index(['user_id', 'read_at', 'created_at'])
    })

    this.schema.createTable('invitations', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('mam_id').nullable().references('id').inTable('mams').onDelete('CASCADE')
      table.uuid('child_id').nullable().references('id').inTable('children').onDelete('CASCADE')
      table.uuid('invited_by').notNullable().references('id').inTable('users').onDelete('RESTRICT')
      table.string('email', 254).notNullable()
      table.enum('role', ['mam_admin', 'admin', 'assistant', 'parent']).notNullable()
      table.string('relationship').nullable()
      table.string('token_hash', 128).notNullable().unique()
      table.timestamp('expires_at').notNullable()
      table.timestamp('accepted_at').nullable()
      table.timestamps(true, true)
      table.index(['email', 'expires_at'])
    })

    this.schema.createTable('media', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('mam_id').notNullable().references('id').inTable('mams').onDelete('CASCADE')
      table.uuid('child_id').nullable().references('id').inTable('children').onDelete('CASCADE')
      table.uuid('uploaded_by').notNullable().references('id').inTable('users').onDelete('RESTRICT')
      table.string('storage_key', 1024).notNullable().unique()
      table.string('original_name').notNullable()
      table.string('mime_type').notNullable().defaultTo('image/webp')
      table.integer('size_bytes').notNullable()
      table.integer('width').nullable()
      table.integer('height').nullable()
      table.timestamps(true, true)
      table.index(['mam_id', 'child_id'])
    })

    this.schema.createTable('audit_logs', (table) => {
      table.bigIncrements('id')
      table.uuid('mam_id').nullable().references('id').inTable('mams').onDelete('SET NULL')
      table.uuid('actor_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.string('action').notNullable()
      table.string('subject_type').notNullable()
      table.uuid('subject_id').nullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')
      table.string('ip_hash').nullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.index(['mam_id', 'created_at'])
    })
  }

  async down() {
    for (const table of [
      'audit_logs',
      'media',
      'invitations',
      'notifications',
      'messages',
      'health_entries',
      'daily_reports',
      'child_guardians',
      'child_staff',
      'children',
      'memberships',
      'mams',
    ])
      this.schema.dropTable(table)
  }
}
