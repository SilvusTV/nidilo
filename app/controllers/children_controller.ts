import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { getMamContext } from '#services/access_service'
import NotificationService from '#services/notification_service'

export default class ChildrenController {
  async create({ auth, inertia, response }: HttpContext) {
    const context = await getMamContext(auth.getUserOrFail())
    if (!context || context.role !== 'admin') return response.forbidden()
    return inertia.render('children/create', {})
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role !== 'admin') return response.forbidden()
    const firstName = String(request.input('firstName', '')).trim().slice(0, 100)
    const lastName = String(request.input('lastName', '')).trim().slice(0, 100)
    const birthDate = String(request.input('birthDate', ''))
    const careStartedAt = String(request.input('careStartedAt', ''))
    const parsedBirthDate = DateTime.fromISO(birthDate, { zone: context.timezone })
    const parsedCareStart = DateTime.fromISO(careStartedAt, { zone: context.timezone })
    if (
      firstName.length < 2 ||
      lastName.length < 2 ||
      !parsedBirthDate.isValid ||
      parsedBirthDate > DateTime.now().setZone(context.timezone)
    ) {
      session.flash('error', 'Vérifiez le prénom, le nom et la date de naissance.')
      return response.redirect().back()
    }
    const duplicate = await db
      .from('children')
      .where({ mam_id: context.mamId, birth_date: birthDate })
      .whereRaw('lower(first_name) = lower(?)', [firstName])
      .whereRaw('lower(last_name) = lower(?)', [lastName])
      .first()
    if (duplicate) {
      session.flash('error', 'Un dossier correspondant existe déjà dans cette MAM.')
      return response.redirect().back()
    }
    const id = crypto.randomUUID()
    await db.transaction(async (trx) => {
      await trx.table('children').insert({
        id,
        mam_id: context.mamId,
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        care_started_at: parsedCareStart.isValid ? careStartedAt : null,
        allergies: String(request.input('allergies', '')).trim().slice(0, 2_000) || null,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      await trx.table('audit_logs').insert({
        mam_id: context.mamId,
        actor_id: user.id,
        action: 'child.created',
        subject_type: 'child',
        subject_id: id,
        metadata: JSON.stringify({}),
        created_at: new Date(),
      })
    })
    session.flash('success', `Dossier de ${firstName} créé. Invitez maintenant ses parents.`)
    return response.redirect(`/enfants/${id}/responsables`)
  }

  async index({ auth, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context) return response.forbidden()
    const query = db
      .from('children')
      .where('children.mam_id', context.mamId)
      .orderBy('children.first_name')
      .select(
        'children.id',
        'children.first_name as firstName',
        'children.last_name as lastName',
        'children.active',
        'children.archived_at as archivedAt',
        'children.purge_at as purgeAt'
      )
    if (context.role === 'parent') {
      query
        .join('child_guardians', 'child_guardians.child_id', 'children.id')
        .where('child_guardians.user_id', user.id)
        .where('children.active', true)
    } else if (context.role === 'assistant') {
      query.where('children.active', true)
      if (context.assignmentMode === 'assigned')
        query
          .join('child_staff', 'child_staff.child_id', 'children.id')
          .where('child_staff.user_id', user.id)
    }
    const records = await query
    return inertia.render('children/index', { records, role: context.role })
  }

  async archive({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role !== 'admin') return response.forbidden()
    const mam = await db.from('mams').where('id', context.mamId).first()
    const child = await db
      .from('children')
      .where({ id: params.id, mam_id: context.mamId, active: true })
      .first()
    if (!child) return response.notFound()
    const archivedAt = DateTime.now().setZone(mam.timezone || 'Europe/Paris')
    const purgeAt = archivedAt.plus({ days: mam.child_retention_days ?? 365 })
    await db.from('children').where('id', child.id).update({
      active: false,
      archived_at: archivedAt.toJSDate(),
      purge_at: purgeAt.toJSDate(),
      archived_by: user.id,
      updated_at: new Date(),
    })
    const guardianRows = await db
      .from('child_guardians')
      .where('child_id', child.id)
      .select('user_id')
    await new NotificationService().notifyUsers({
      mamId: context.mamId,
      recipientIds: guardianRows.map((row) => row.user_id),
      actorId: user.id,
      category: 'establishment',
      type: 'child.archived',
      title: `Dossier de ${child.first_name} archivé`,
      body: `Le dossier restera consultable par l’administration jusqu’au ${purgeAt.setLocale('fr').toLocaleString(DateTime.DATE_MED)}.`,
      data: { childId: child.id, purgeAt: purgeAt.toISO() },
    })
    session.flash(
      'success',
      `Dossier archivé jusqu’au ${purgeAt.setLocale('fr').toLocaleString(DateTime.DATE_MED)}.`
    )
    return response.redirect().back()
  }

  async restore({ auth, params, response, session }: HttpContext) {
    const context = await getMamContext(auth.getUserOrFail())
    if (!context || context.role !== 'admin') return response.forbidden()
    const updated = await db
      .from('children')
      .where({ id: params.id, mam_id: context.mamId, active: false })
      .update({
        active: true,
        archived_at: null,
        purge_at: null,
        archived_by: null,
        updated_at: new Date(),
      })
    if (!updated) return response.notFound()
    session.flash('success', 'Le dossier est de nouveau actif.')
    return response.redirect().back()
  }
}
