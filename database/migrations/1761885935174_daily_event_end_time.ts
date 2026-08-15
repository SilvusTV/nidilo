import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('daily_events', (table) => {
      table.timestamp('ended_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.alterTable('daily_events', (table) => table.dropColumn('ended_at'))
  }
}
