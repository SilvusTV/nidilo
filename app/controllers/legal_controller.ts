import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'

const pageNames = new Set(['mentions-legales', 'confidentialite', 'cgu', 'sous-traitants'])

export default class LegalController {
  async show({ params, inertia, response }: HttpContext) {
    if (!pageNames.has(params.page)) return response.notFound()
    response.header('Cache-Control', 'public, max-age=300')
    const publisher = {
      name: env.get('LEGAL_PUBLISHER_NAME', ''),
      address: env.get('LEGAL_PUBLISHER_ADDRESS', ''),
      email: env.get('LEGAL_PUBLISHER_EMAIL', 'contact@nidilo.fr'),
      phone: env.get('LEGAL_PUBLISHER_PHONE', ''),
    }
    const host = {
      name: env.get('LEGAL_HOST_NAME', ''),
      address: env.get('LEGAL_HOST_ADDRESS', ''),
    }
    return inertia.render('legal/index', {
      page: params.page,
      publisher,
      host,
      identityComplete: Boolean(
        publisher.name && publisher.address && publisher.email && host.name && host.address
      ),
      updatedAt: '15 août 2026',
    })
  }
}
