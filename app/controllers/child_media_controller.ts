import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { readFile } from 'node:fs/promises'
import { assertChildAccess, getMamContext } from '#services/access_service'
import { ImageStorageService } from '#services/image_storage_service'

export default class ChildMediaController {
  async show({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context) return response.forbidden()
    const child = await assertChildAccess(user, context, params.id)
    if (!child) return response.notFound()
    const media = await db
      .from('media')
      .where({ id: params.mediaId, mam_id: context.mamId, child_id: child.id })
      .select('storage_key', 'purpose', 'report_date')
      .first()
    if (!media) return response.notFound()
    if (context.role === 'parent' && media.purpose === 'daily_report') {
      const report = await db
        .from('daily_reports')
        .where({
          mam_id: context.mamId,
          child_id: child.id,
          report_date: media.report_date,
          status: 'published',
        })
        .first()
      if (!report) return response.notFound()
    }
    response.header('Content-Type', 'image/webp')
    response.header('Cache-Control', 'private, max-age=3600')
    return response.stream(await new ImageStorageService().getObject(media.storage_key))
  }

  async profilePhoto({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context) return response.forbidden()
    const child = await assertChildAccess(user, context, params.id)
    if (!child?.photo_key) return response.notFound()
    response.header('Content-Type', 'image/webp')
    response.header('Cache-Control', 'private, max-age=3600')
    return response.stream(await new ImageStorageService().getObject(child.photo_key))
  }

  async uploadProfilePhoto({ auth, request, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role === 'parent') return response.forbidden()
    const child = await assertChildAccess(user, context, params.id, true)
    if (!child) return response.notFound()
    const photo = request.file('photo', {
      size: '12mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    })
    if (!photo?.isValid || !photo.tmpPath) {
      session.flash('error', photo?.errors[0]?.message ?? 'Choisissez une image valide.')
      return response.redirect().back()
    }
    const storage = new ImageStorageService()
    try {
      const stored = await storage.store(
        await readFile(photo.tmpPath),
        context.mamId,
        child.id,
        photo.clientName
      )
      await db.from('children').where({ id: child.id, mam_id: context.mamId }).update({
        photo_key: stored.key,
        updated_at: new Date(),
      })
      if (child.photo_key) await storage.deleteObject(child.photo_key).catch(() => undefined)
      await this.audit(context.mamId, user.id, 'child.profile_photo.updated', child.id)
      session.flash('success', 'Photo de profil enregistrée.')
    } catch (error) {
      session.flash(
        'error',
        error instanceof Error ? error.message : 'Envoi de la photo impossible.'
      )
    }
    return response.redirect().back()
  }

  async uploadReportPhoto({ auth, request, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role === 'parent') return response.forbidden()
    const child = await assertChildAccess(user, context, params.id, true)
    if (!child) return response.notFound()
    const photo = request.file('photo', {
      size: '12mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    })
    if (!photo?.isValid || !photo.tmpPath) {
      session.flash('error', photo?.errors[0]?.message ?? 'Choisissez une image valide.')
      return response.redirect().back()
    }
    const reportDate = DateTime.now().setZone(context.timezone).toISODate()!
    const currentCount = await db
      .from('media')
      .where({
        mam_id: context.mamId,
        child_id: child.id,
        purpose: 'daily_report',
        report_date: reportDate,
      })
      .count('* as total')
      .first()
    if (Number(currentCount?.total ?? 0) >= 6) {
      session.flash('error', 'Vous pouvez ajouter jusqu’à 6 photos par journée.')
      return response.redirect().back()
    }
    const storage = new ImageStorageService()
    try {
      const stored = await storage.store(
        await readFile(photo.tmpPath),
        context.mamId,
        child.id,
        photo.clientName
      )
      const id = crypto.randomUUID()
      await db.table('media').insert({
        id,
        mam_id: context.mamId,
        child_id: child.id,
        uploaded_by: user.id,
        storage_key: stored.key,
        original_name: photo.clientName.slice(0, 255),
        mime_type: 'image/webp',
        size_bytes: stored.sizeBytes,
        width: stored.width,
        height: stored.height,
        purpose: 'daily_report',
        report_date: reportDate,
        created_at: new Date(),
        updated_at: new Date(),
      })
      await this.audit(context.mamId, user.id, 'daily_report.photo.created', id)
      session.flash('success', 'Photo ajoutée au petit mot du jour.')
    } catch (error) {
      session.flash(
        'error',
        error instanceof Error ? error.message : 'Envoi de la photo impossible.'
      )
    }
    return response.redirect().back()
  }

  async destroy({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role === 'parent') return response.forbidden()
    const child = await assertChildAccess(user, context, params.id, true)
    if (!child) return response.notFound()
    const media = await db
      .from('media')
      .where({
        id: params.mediaId,
        mam_id: context.mamId,
        child_id: child.id,
      })
      .first()
    if (!media) return response.notFound()
    await db.from('media').where('id', media.id).delete()
    await new ImageStorageService().deleteObject(media.storage_key).catch(() => undefined)
    await this.audit(context.mamId, user.id, 'daily_report.photo.deleted', media.id)
    session.flash('success', 'Photo supprimée.')
    return response.redirect().back()
  }

  private async audit(mamId: string, actorId: string, action: string, subjectId: string) {
    await db.table('audit_logs').insert({
      mam_id: mamId,
      actor_id: actorId,
      action,
      subject_type: 'media',
      subject_id: subjectId,
      metadata: JSON.stringify({}),
      created_at: new Date(),
    })
  }
}
