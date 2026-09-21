import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('media', (table) => {
      table.string('purpose', 32).notNullable().defaultTo('attachment')
      table.date('report_date').nullable()
      table.index(['child_id', 'purpose', 'report_date'])
    })
  }

  async down() {
    this.schema.alterTable('media', (table) => {
      table.dropIndex(['child_id', 'purpose', 'report_date'])
      table.dropColumns('purpose', 'report_date')
    })
  }
}
