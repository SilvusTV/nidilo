import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { assertChildAccess, getMamContext } from '#services/access_service'

const kinds = new Set(['meal', 'nap', 'diaper'])

export default class QuickEntriesController {
  async index({ auth, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role === 'parent') return response.forbidden()
    let childrenQuery = db
      .from('children')
      .where({ 'children.mam_id': context.mamId, 'children.active': true })
      .orderBy('children.first_name')
      .select('children.id', 'children.first_name as firstName', 'children.last_name as lastName')
    if (context.role === 'assistant' && context.assignmentMode === 'assigned')
      childrenQuery = childrenQuery
        .join('child_staff', 'child_staff.child_id', 'children.id')
        .where({ 'child_staff.mam_id': context.mamId, 'child_staff.user_id': user.id })
    const now = DateTime.now().setZone(context.timezone)
    let recentQuery = db
      .from('daily_events')
      .join('children', 'children.id', 'daily_events.child_id')
      .join('users', 'users.id', 'daily_events.created_by')
      .where('daily_events.mam_id', context.mamId)
      .whereBetween('daily_events.occurred_at', [
        now.startOf('day').toJSDate(),
        now.endOf('day').toJSDate(),
      ])
      .orderBy('daily_events.occurred_at', 'desc')
      .limit(30)
      .select(
        'daily_events.id',
        'daily_events.kind',
        'daily_events.comment',
        'daily_events.occurred_at as occurredAt',
        'daily_events.ended_at as endedAt',
        'children.first_name as childFirstName',
        'users.full_name as authorName'
      )
    if (context.role === 'assistant' && context.assignmentMode === 'assigned')
      recentQuery = recentQuery
        .join('child_staff', 'child_staff.child_id', 'children.id')
        .where({ 'child_staff.mam_id': context.mamId, 'child_staff.user_id': user.id })
    const [wards, recent] = await Promise.all([childrenQuery, recentQuery])
    return inertia.render('quick-entry/index', {
      wards,
      recent,
      currentTime: now.toFormat('HH:mm'),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role === 'parent') return response.forbidden()
    const child = await assertChildAccess(user, context, request.input('childId'), true)
    if (!child) return response.notFound()
    const kind = String(request.input('kind', ''))
    const time = String(request.input('time', ''))
    const requestId = String(request.input('requestId', ''))
    const endTime = String(request.input('endTime', ''))
    if (
      !kinds.has(kind) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)
    )
      return response.badRequest()
    const now = DateTime.now().setZone(context.timezone)
    const [hour, minute] = time.split(':').map(Number)
    const occurredAt = now.set({ hour, minute, second: 0, millisecond: 0 })
    let endedAt: Date | null = null
    if (kind === 'nap') {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) return response.badRequest()
      const [endHour, endMinute] = endTime.split(':').map(Number)
      const parsedEnd = now.set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 })
      if (parsedEnd <= occurredAt || parsedEnd > now.plus({ minutes: 15 }))
        return response.badRequest()
      endedAt = parsedEnd.toJSDate()
    }
    const comment = String(request.input('comment', '')).trim().slice(0, 500) || null
    const id = crypto.randomUUID()
    const inserted = await db
      .table('daily_events')
      .insert({
        id,
        request_id: requestId,
        mam_id: context.mamId,
        child_id: child.id,
        created_by: user.id,
        kind,
        occurred_at: occurredAt.toJSDate(),
        ended_at: endedAt,
        comment,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .onConflict('request_id')
      .ignore()
      .returning('id')
    if (inserted.length)
      await db.table('audit_logs').insert({
        mam_id: context.mamId,
        actor_id: user.id,
        action: `daily_event.${kind}.created`,
        subject_type: 'daily_event',
        subject_id: id,
        metadata: JSON.stringify({ childId: child.id }),
        created_at: new Date(),
      })
    const confirmations: Record<string, string> = {
      meal: 'Repas enregistré',
      nap: 'Sieste enregistrée',
      diaper: 'Change enregistré',
    }
    session.flash('success', `${confirmations[kind]} pour ${child.first_name} à ${time}.`)
    return response.redirect().back()
  }
}
