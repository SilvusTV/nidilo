import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getMamContext } from '#services/access_service'
import { ImageStorageService } from '#services/image_storage_service'

export default class MamMediaController {
  async logo({ auth, response }: HttpContext) {
    const context = await getMamContext(auth.getUserOrFail())
    if (!context) return response.forbidden()
    const mam = await db.from('mams').where('id', context.mamId).select('logo_key').first()
    if (!mam?.logo_key) return response.notFound()
    response.header('Content-Type', 'image/webp')
    response.header('Cache-Control', 'private, max-age=3600')
    return response.stream(await new ImageStorageService().getObject(mam.logo_key))
  }
}
