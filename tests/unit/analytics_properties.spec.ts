import { test } from '@japa/runner'

test.group('Analytics event privacy', () => {
  test('retains PostHog ingestion token while removing private fields', async ({ assert }) => {
    const modulePath = '../../inertia/lib/analytics_properties.js'
    const { sanitizeAnalyticsProperties } = (await import(modulePath)) as {
      sanitizeAnalyticsProperties: (
        input: Record<string, unknown>,
        sanitizeUrl: (value: string) => string
      ) => Record<string, unknown>
    }
    const properties = sanitizeAnalyticsProperties(
      {
        token: 'phc_public_project_key',
        environment: 'prod',
        email: 'private@example.com',
        auth_token: 'private-secret',
        $current_url: 'https://nidilo.fr/?private=1',
      },
      (url) => new URL(url).origin + new URL(url).pathname
    )

    assert.deepEqual(properties, {
      token: 'phc_public_project_key',
      environment: 'prod',
      $current_url: 'https://nidilo.fr/',
    })
  })
})
