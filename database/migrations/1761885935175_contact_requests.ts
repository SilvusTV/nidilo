import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contact_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('full_name', 120).notNullable()
      table.string('email', 254).notNullable()
      table.string('phone', 30).nullable()
      table.string('organization', 160).nullable()
      table.enum('role', ['mam', 'assistant', 'parent', 'partner', 'other']).notNullable()
      table.text('message').notNullable()
      table.enum('status', ['new', 'processed', 'archived']).notNullable().defaultTo('new')
      table.timestamp('consented_at', { useTz: true }).notNullable()
      table.timestamps(true, true)
      table.index(['email', 'created_at'])
      table.index(['status', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
