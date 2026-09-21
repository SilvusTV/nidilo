import { test } from '@japa/runner'
import {
  DEFAULT_POSTHOG_PROJECT_KEY,
  resolvePosthogProjectKey,
} from '#services/public_analytics_config'

test.group('Public analytics configuration', () => {
  test('uses the production project when no runtime key is configured', ({ assert }) => {
    assert.equal(resolvePosthogProjectKey(), DEFAULT_POSTHOG_PROJECT_KEY)
    assert.equal(resolvePosthogProjectKey('  '), DEFAULT_POSTHOG_PROJECT_KEY)
  })

  test('runtime configuration overrides the default without a client rebuild', ({ assert }) => {
    assert.equal(
      resolvePosthogProjectKey('  phc_another_public_project  '),
      'phc_another_public_project'
    )
  })
})
