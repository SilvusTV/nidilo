import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('daily_events', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('request_id').notNullable().unique()
      table.uuid('mam_id').notNullable().references('id').inTable('mams').onDelete('CASCADE')
      table.uuid('child_id').notNullable().references('id').inTable('children').onDelete('CASCADE')
      table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('RESTRICT')
      table.enum('kind', ['meal', 'nap', 'diaper']).notNullable()
      table.timestamp('occurred_at', { useTz: true }).notNullable()
      table.string('comment', 500).nullable()
      table.timestamps(true, true)
      table.index(['mam_id', 'occurred_at'])
      table.index(['child_id', 'occurred_at'])
    })
  }

  async down() {
    this.schema.dropTable('daily_events')
  }
}
