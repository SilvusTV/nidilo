import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('notification_deliveries', (table) => {
      table.string('title', 255).nullable()
      table.text('body').nullable()
      table.string('action_url', 1024).nullable()
    })
  }

  async down() {
    this.schema.alterTable('notification_deliveries', (table) => {
      table.dropColumns('title', 'body', 'action_url')
    })
  }
}
