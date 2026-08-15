import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('children', (table) => {
      table.date('care_started_at').nullable()
      table.date('care_ended_at').nullable()
      table.string('doctor_name', 160).nullable()
      table.string('doctor_phone', 32).nullable()
      table.text('emergency_instructions_html').nullable()
      table.text('dietary_notes_html').nullable()
      table.text('routines_html').nullable()
    })
    this.schema.createTable('child_contacts', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('mam_id').notNullable().references('id').inTable('mams').onDelete('CASCADE')
      table.uuid('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE')
      table.string('full_name', 160).notNullable()
      table.string('relationship', 80).notNullable()
      table.string('phone', 32).nullable()
      table.string('email', 254).nullable()
      table.boolean('emergency_contact').notNullable().defaultTo(false)
      table.boolean('authorized_pickup').notNullable().defaultTo(false)
      table.integer('priority').notNullable().defaultTo(100)
      table.text('notes_html').nullable()
      table.timestamps(true, true)
      table.index(['mam_id', 'child_id', 'priority'])
    })
    this.schema.createTable('child_authorizations', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('mam_id').notNullable().references('id').inTable('mams').onDelete('CASCADE')
      table.uuid('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE')
      table.uuid('decided_by').nullable().references('id').inTable('users').onDelete('SET NULL')
      table
        .enum('kind', [
          'photo_internal',
          'photo_external',
          'outings',
          'transport',
          'emergency_care',
          'medication',
          'other',
        ])
        .notNullable()
      table.enum('status', ['pending', 'granted', 'refused', 'revoked']).notNullable()
      table.date('valid_from').nullable()
      table.date('valid_until').nullable()
      table.text('notes_html').nullable()
      table.timestamp('decided_at').nullable()
      table.timestamps(true, true)
      table.unique(['child_id', 'kind'])
      table.index(['mam_id', 'child_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable('child_authorizations')
    this.schema.dropTable('child_contacts')
    this.schema.alterTable('children', (table) =>
      table.dropColumns(
        'care_started_at',
        'care_ended_at',
        'doctor_name',
        'doctor_phone',
        'emergency_instructions_html',
        'dietary_notes_html',
        'routines_html'
      )
    )
  }
}
