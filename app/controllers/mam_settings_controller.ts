import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getMamContext } from '#services/access_service'
import { ImageStorageService } from '#services/image_storage_service'
import { readFile } from 'node:fs/promises'

const themes = new Set(['sage', 'rose', 'blue', 'yellow', 'gray'])

export default class MamSettingsController {
  async edit({ auth, inertia, response }: HttpContext) {
    const context = await getMamContext(auth.getUserOrFail())
    if (!context || context.role !== 'admin') return response.forbidden()
    const mam = await db
      .from('mams')
      .where('id', context.mamId)
      .select(
        'name',
        'theme_key as themeKey',
        'child_retention_days as childRetentionDays',
        'logo_key as logoKey'
      )
      .firstOrFail()
    return inertia.render('settings/mam', {
      mam: {
        ...mam,
        logoUrl: mam.logoKey ? `/media/logo-mam?v=${encodeURIComponent(mam.logoKey)}` : null,
      },
    })
  }

  async update({ auth, request, response, session }: HttpContext) {
    const context = await getMamContext(auth.getUserOrFail())
    if (!context || context.role !== 'admin') return response.forbidden()
    const body = request.only(['name', 'themeKey', 'childRetentionDays'])
    const name = String(body.name ?? '')
      .trim()
      .slice(0, 150)
    const retention = Math.min(1_095, Math.max(30, Number(body.childRetentionDays) || 365))
    if (!name) {
      session.flash('error', 'Le nom de la MAM est obligatoire.')
      return response.redirect().back()
    }
    await db
      .from('mams')
      .where('id', context.mamId)
      .update({
        name,
        theme_key: themes.has(body.themeKey) ? body.themeKey : 'sage',
        child_retention_days: retention,
        updated_at: new Date(),
      })
    session.flash('success', 'Personnalisation de la MAM enregistrée.')
    return response.redirect().back()
  }

  async uploadLogo({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role !== 'admin') return response.forbidden()
    const logo = request.file('logo', {
      size: '8mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    })
    if (!logo?.isValid || !logo.tmpPath) {
      session.flash('error', logo?.errors[0]?.message ?? 'Choisissez une image valide.')
      return response.redirect().back()
    }
    const mam = await db.from('mams').where('id', context.mamId).select('logo_key').firstOrFail()
    const storage = new ImageStorageService()
    try {
      const stored = await storage.storeLogo(
        await readFile(logo.tmpPath),
        context.mamId,
        logo.clientName
      )
      await db.from('mams').where('id', context.mamId).update({
        logo_key: stored.key,
        updated_at: new Date(),
      })
      if (mam.logo_key) await storage.deleteObject(mam.logo_key).catch(() => undefined)
    } catch (error) {
      session.flash('error', error instanceof Error ? error.message : 'Envoi du logo impossible.')
      return response.redirect().back()
    }
    await db.table('audit_logs').insert({
      mam_id: context.mamId,
      actor_id: user.id,
      action: 'mam.logo.updated',
      subject_type: 'mam',
      subject_id: context.mamId,
      metadata: JSON.stringify({}),
      created_at: new Date(),
    })
    session.flash('success', 'Logo de la MAM enregistré dans MiniO.')
    return response.redirect().back()
  }
}
