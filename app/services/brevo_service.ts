import env from '#start/env'

type Fetcher = typeof globalThis.fetch

type BrevoConfiguration = {
  apiKey?: string
  apiUrl: string
  emailSender: { email: string; name: string }
  smsSender: string
}

type EmailInput = {
  to: string
  subject: string
  htmlContent: string
  replyTo?: string
  idempotencyKey?: string
  tags?: string[]
}

type SmsInput = {
  to: string
  content: string
  tag?: string
}

export class BrevoApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'BrevoApiError'
  }
}

export default class BrevoService {
  constructor(
    private configuration: BrevoConfiguration = {
      apiKey: env.get('BREVO_API_KEY'),
      apiUrl: env.get('BREVO_API_URL', 'https://api.brevo.com/v3'),
      emailSender: {
        email: env.get('MAIL_FROM_ADDRESS'),
        name: env.get('MAIL_FROM_NAME'),
      },
      smsSender: env.get('BREVO_SMS_SENDER', 'NIDILO'),
    },
    private fetcher: Fetcher = fetch
  ) {}

  get isConfigured() {
    return Boolean(this.configuration.apiKey)
  }

  async sendEmail(input: EmailInput) {
    return this.request<{ messageId: string }>('/smtp/email', {
      sender: this.configuration.emailSender,
      to: [{ email: input.to }],
      subject: input.subject,
      htmlContent: input.htmlContent,
      ...(input.replyTo ? { replyTo: { email: input.replyTo } } : {}),
      ...(input.tags?.length ? { tags: input.tags } : {}),
      ...(input.idempotencyKey ? { headers: { 'Idempotency-Key': input.idempotencyKey } } : {}),
    })
  }

  async sendSms(input: SmsInput) {
    return this.request<{ messageId: number }>('/transactionalSMS/send', {
      sender: this.configuration.smsSender,
      recipient: normalizePhoneNumber(input.to),
      content: input.content.slice(0, 160),
      type: 'transactional',
      unicodeEnabled: false,
      ...(input.tag ? { tag: input.tag } : {}),
    })
  }

  private async request<T>(path: string, body: Record<string, unknown>): Promise<T> {
    if (!this.configuration.apiKey) throw new Error('Brevo API non configurée')

    const response = await this.fetcher(`${this.configuration.apiUrl.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': this.configuration.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      const details = await response.text()
      throw new BrevoApiError(
        response.status,
        `Brevo a répondu ${response.status}${details ? ` : ${details.slice(0, 500)}` : ''}`
      )
    }

    return (await response.json()) as T
  }
}

export function normalizePhoneNumber(value: string) {
  let phone = value.trim().replace(/[\s.()-]/g, '')
  if (phone.startsWith('00')) phone = `+${phone.slice(2)}`
  if (/^0\d{9}$/.test(phone)) phone = `+33${phone.slice(1)}`
  if (!/^\+[1-9]\d{5,14}$/.test(phone)) throw new Error('Numéro de téléphone invalide')
  return phone
}
