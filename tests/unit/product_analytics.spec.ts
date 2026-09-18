import { test } from '@japa/runner'
import type { HttpContext } from '@adonisjs/core/http'
import { flashProductAnalytics } from '#services/product_analytics_service'

test.group('Product analytics', () => {
  test('queues only an event name, random delivery id and allow-listed properties', ({
    assert,
  }) => {
    const messages = new Map<string, unknown>()
    const session = {
      flash(key: string, value: unknown) {
        messages.set(key, value)
      },
    } as unknown as HttpContext['session']

    flashProductAnalytics(session, 'daily_report_saved', {
      report_state: 'published',
      first_publication: true,
    })

    const event = messages.get('analyticsEvent') as {
      id: string
      event: string
      properties: Record<string, unknown>
    }
    assert.match(event.id, /^[0-9a-f-]{36}$/i)
    assert.equal(event.event, 'daily_report_saved')
    assert.deepEqual(event.properties, {
      report_state: 'published',
      first_publication: true,
    })
  })
})
