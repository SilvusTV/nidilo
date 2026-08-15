import { test } from '@japa/runner'
import BrevoService, { BrevoApiError, normalizePhoneNumber } from '#services/brevo_service'

const configuration = {
  apiKey: 'test-api-key',
  apiUrl: 'https://api.brevo.test/v3',
  emailSender: { email: 'notifications@nidilo.test', name: 'Nidilo' },
  smsSender: 'NIDILO',
}

test.group('Brevo service', () => {
  test('sends transactional email through the Brevo API', async ({ assert }) => {
    let capturedUrl = ''
    let capturedInit: RequestInit | undefined
    const fetcher = async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(url)
      capturedInit = init
      return Response.json({ messageId: '<message@brevo.test>' }, { status: 201 })
    }
    const service = new BrevoService(configuration, fetcher as typeof fetch)

    const result = await service.sendEmail({
      to: 'parent@example.test',
      subject: 'Votre fiche Nidilo',
      htmlContent: '<p>Votre fiche est prête.</p>',
      idempotencyKey: 'delivery-id',
      tags: ['nidilo'],
    })

    assert.equal(capturedUrl, 'https://api.brevo.test/v3/smtp/email')
    assert.equal((capturedInit?.headers as Record<string, string>)['api-key'], 'test-api-key')
    assert.equal(JSON.parse(String(capturedInit?.body)).headers['Idempotency-Key'], 'delivery-id')
    assert.equal(result.messageId, '<message@brevo.test>')
  })

  test('normalizes a French number and sends a transactional SMS', async ({ assert }) => {
    let payload: Record<string, unknown> = {}
    const fetcher = async (_url: string | URL | Request, init?: RequestInit) => {
      payload = JSON.parse(String(init?.body))
      return Response.json({ messageId: 12345 }, { status: 201 })
    }
    const service = new BrevoService(configuration, fetcher as typeof fetch)

    await service.sendSms({
      to: '06 12 34 56 78',
      content: 'Notification Nidilo',
      tag: 'delivery-id',
    })

    assert.equal(payload.recipient, '+33612345678')
    assert.equal(payload.sender, 'NIDILO')
    assert.equal(payload.type, 'transactional')
    assert.equal(normalizePhoneNumber('0033612345678'), '+33612345678')
  })

  test('exposes a bounded API error without leaking the key', async ({ assert }) => {
    const fetcher = async () => new Response('{"message":"invalid_parameter"}', { status: 400 })
    const service = new BrevoService(configuration, fetcher as typeof fetch)

    try {
      await service.sendSms({ to: '+33612345678', content: 'Notification Nidilo' })
      assert.fail('La requête aurait dû échouer')
    } catch (error) {
      assert.instanceOf(error, BrevoApiError)
      assert.equal((error as BrevoApiError).status, 400)
      assert.notInclude((error as Error).message, 'test-api-key')
    }
  })
})
