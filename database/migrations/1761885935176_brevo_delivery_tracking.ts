import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('notification_deliveries', (table) => {
      table.string('provider_message_id', 255).nullable().index()
      table.string('provider_status', 64).nullable()
      table.timestamp('delivered_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.alterTable('notification_deliveries', (table) => {
      table.dropColumns('provider_message_id', 'provider_status', 'delivered_at')
    })
  }
}
