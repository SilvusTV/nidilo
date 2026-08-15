import { test } from '@japa/runner'
import { cleanRichText, normalizeItems } from '#controllers/daily_reports_controller'

test.group('Daily report input safety', () => {
  test('removes executable HTML while preserving simple rich text', ({ assert }) => {
    const result = cleanRichText(
      '<p>Bonjour <strong>Alba</strong></p><script>alert(1)</script><img src=x onerror=alert(1)>'
    )
    assert.include(result, '<strong>Alba</strong>')
    assert.notInclude(result, '<script>')
    assert.notInclude(result, 'onerror')
    assert.notInclude(result, '<img')
  })

  test('bounds and normalizes timeline entries', ({ assert }) => {
    const result = normalizeItems([{ time: '13:15:59', detail: `  ${'a'.repeat(600)}  ` }, null])
    assert.equal(result[0].time, '13:15')
    assert.lengthOf(result[0].detail, 500)
    assert.deepEqual(result[1], { time: '', detail: '' })
    assert.deepEqual(normalizeItems('invalid'), [])
  })
})
