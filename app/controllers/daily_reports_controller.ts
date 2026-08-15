import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { assertChildAccess, getMamContext } from '#services/access_service'
import NotificationService from '#services/notification_service'
import { cleanRichText } from '#services/rich_text_service'
import { DateTime } from 'luxon'
import { features } from '#config/features'

export { cleanRichText } from '#services/rich_text_service'

export const normalizeItems = (value: unknown) => {
  if (!Array.isArray(value)) return []
  return value.slice(0, 20).map((item) => ({
    time: typeof item?.time === 'string' ? item.time.slice(0, 5) : '',
    detail: typeof item?.detail === 'string' ? item.detail.trim().slice(0, 500) : '',
  }))
}

export default class DailyReportsController {
  async show({ auth, inertia, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context) return response.forbidden()
    const child = await assertChildAccess(user, context, params.id)
    if (!child) return response.notFound()
    const now = DateTime.now().setZone(context.timezone)
    const today = now.toISODate()!
    const reportQuery = db.from('daily_reports').where({ child_id: child.id, report_date: today })
    if (context.role === 'parent') reportQuery.where('status', 'published')
    const report = await reportQuery.first()
    const quickEvents =
      context.role === 'parent' && !report
        ? []
        : await db
            .from('daily_events')
            .join('users', 'users.id', 'daily_events.created_by')
            .where({ 'daily_events.mam_id': context.mamId, 'daily_events.child_id': child.id })
            .whereBetween('daily_events.occurred_at', [
              now.startOf('day').toJSDate(),
              now.endOf('day').toJSDate(),
            ])
            .orderBy('daily_events.occurred_at')
            .select(
              'daily_events.id',
              'daily_events.kind',
              'daily_events.comment',
              'daily_events.occurred_at as occurredAt',
              'daily_events.ended_at as endedAt',
              'users.full_name as authorName'
            )
    return inertia.render('reports/edit', {
      child: { id: child.id, firstName: child.first_name, lastName: child.last_name },
      role: context.role,
      reportDate: today,
      quickEvents,
      healthDataEnabled: features.healthData,
      report: report
        ? {
            mood: report.mood,
            naps: normalizeItems(report.naps),
            meals: normalizeItems(report.meals),
            diapers: normalizeItems(report.diapers),
            activities: normalizeItems(report.activities),
            ...(features.healthData ? { temperature: report.temperature } : {}),
            noteHtml: report.note_html,
            status: report.status,
          }
        : null,
    })
  }

  async showPublished({ auth, inertia, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role !== 'parent') return response.forbidden()
    const child = await assertChildAccess(user, context, params.id)
    if (!child) return response.notFound()
    const date = DateTime.fromISO(String(params.date), { zone: context.timezone })
    if (!date.isValid || date.toISODate() !== params.date) return response.notFound()
    const report = await db
      .from('daily_reports')
      .where({
        mam_id: context.mamId,
        child_id: child.id,
        report_date: params.date,
        status: 'published',
      })
      .first()
    if (!report) return response.notFound()
    const quickEvents = await db
      .from('daily_events')
      .join('users', 'users.id', 'daily_events.created_by')
      .where({ 'daily_events.mam_id': context.mamId, 'daily_events.child_id': child.id })
      .whereBetween('daily_events.occurred_at', [
        date.startOf('day').toJSDate(),
        date.endOf('day').toJSDate(),
      ])
      .orderBy('daily_events.occurred_at')
      .select(
        'daily_events.id',
        'daily_events.kind',
        'daily_events.comment',
        'daily_events.occurred_at as occurredAt',
        'daily_events.ended_at as endedAt',
        'users.full_name as authorName'
      )
    return inertia.render('reports/edit', {
      child: { id: child.id, firstName: child.first_name, lastName: child.last_name },
      role: 'parent',
      reportDate: params.date,
      quickEvents,
      healthDataEnabled: features.healthData,
      report: {
        mood: report.mood,
        naps: normalizeItems(report.naps),
        meals: normalizeItems(report.meals),
        diapers: normalizeItems(report.diapers),
        activities: normalizeItems(report.activities),
        ...(features.healthData ? { temperature: report.temperature } : {}),
        noteHtml: report.note_html,
        status: report.status,
      },
    })
  }

  async update({ auth, request, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role === 'parent') return response.forbidden()
    const child = await assertChildAccess(user, context, params.id, true)
    if (!child) return response.notFound()
    const today = DateTime.now().setZone(context.timezone).toISODate()!
    const previousReport = await db
      .from('daily_reports')
      .where({ child_id: child.id, report_date: today })
      .select('status')
      .first()
    const body = request.only([
      'mood',
      'naps',
      'meals',
      'diapers',
      'activities',
      'temperature',
      'noteHtml',
      'status',
    ])
    const allowedMoods = new Set(['great', 'good', 'mixed', 'difficult'])
    const parsedTemperature = Number(body.temperature)
    const payload = {
      mam_id: context.mamId,
      child_id: child.id,
      created_by: user.id,
      report_date: today,
      mood: allowedMoods.has(body.mood) ? body.mood : null,
      naps: JSON.stringify(normalizeItems(body.naps)),
      meals: JSON.stringify(normalizeItems(body.meals)),
      diapers: JSON.stringify(normalizeItems(body.diapers)),
      activities: JSON.stringify(normalizeItems(body.activities)),
      temperature:
        features.healthData &&
        Number.isFinite(parsedTemperature) &&
        parsedTemperature >= 34 &&
        parsedTemperature <= 43
          ? parsedTemperature
          : null,
      note_html: cleanRichText(body.noteHtml),
      status: body.status === 'published' ? 'published' : 'draft',
      published_at: body.status === 'published' ? new Date() : null,
      updated_at: new Date(),
    }
    await db
      .table('daily_reports')
      .insert({ id: crypto.randomUUID(), ...payload, created_at: new Date() })
      .onConflict(['child_id', 'report_date'])
      .merge(payload)
    if (body.status === 'published' && previousReport?.status !== 'published') {
      const guardianRows = await db
        .from('child_guardians')
        .where('child_id', child.id)
        .select('user_id')
      await new NotificationService().notifyUsers({
        mamId: context.mamId,
        recipientIds: guardianRows.map((row) => row.user_id),
        actorId: user.id,
        category: 'daily_report',
        type: 'daily_report.published',
        title: `La journée de ${child.first_name} est disponible`,
        body: 'La fiche quotidienne vient d’être publiée par la MAM.',
        actionUrl: `/enfants/${child.id}/fiche/${today}`,
        data: { childId: child.id, reportDate: today },
      })
    }
    session.flash(
      'success',
      body.status === 'published' ? 'Fiche publiée aux responsables.' : 'Brouillon enregistré.'
    )
    return response.redirect().back()
  }
}
