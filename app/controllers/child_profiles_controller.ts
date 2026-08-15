import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { assertChildAccess, getMamContext, type MamContext } from '#services/access_service'
import NotificationService, { type NotificationCategory } from '#services/notification_service'
import { cleanRichText } from '#services/rich_text_service'

const dateOrNull = (value: unknown) =>
  /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? '')) ? String(value) : null
const textOrNull = (value: unknown, max: number) => {
  const text = String(value ?? '')
    .trim()
    .slice(0, max)
  return text || null
}
const hasRichText = (value: string) =>
  value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()

export default class ChildProfilesController {
  async show({ auth, params, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context) return response.forbidden()
    const child = await assertChildAccess(user, context, params.id)
    if (!child) return response.notFound()
    const [contacts, authorizations, healthEntries] = await Promise.all([
      db
        .from('child_contacts')
        .where({ mam_id: context.mamId, child_id: child.id })
        .orderBy('priority')
        .orderBy('full_name')
        .select(
          'id',
          'full_name as fullName',
          'relationship',
          'phone',
          'email',
          'emergency_contact as emergencyContact',
          'authorized_pickup as authorizedPickup',
          'notes_html as notesHtml'
        ),
      db
        .from('child_authorizations')
        .where({ mam_id: context.mamId, child_id: child.id })
        .select(
          'id',
          'kind',
          'status',
          'valid_from as validFrom',
          'valid_until as validUntil',
          'notes_html as notesHtml',
          'decided_at as decidedAt'
        ),
      db
        .from('health_entries')
        .join('users', 'users.id', 'health_entries.author_id')
        .where({ 'health_entries.mam_id': context.mamId, 'health_entries.child_id': child.id })
        .orderBy('health_entries.created_at', 'desc')
        .limit(50)
        .select(
          'health_entries.id',
          'health_entries.kind',
          'health_entries.content_html as contentHtml',
          'health_entries.created_at as createdAt',
          'users.full_name as authorName'
        ),
    ])
    return inertia.render('children/profile', {
      role: context.role,
      child: {
        id: child.id,
        firstName: child.first_name,
        lastName: child.last_name,
        birthDate: child.birth_date,
        careStartedAt: child.care_started_at,
        careEndedAt: child.care_ended_at,
        allergies: child.allergies,
        medicalNotesHtml: child.medical_notes_html,
        doctorName: child.doctor_name,
        doctorPhone: child.doctor_phone,
        emergencyInstructionsHtml: child.emergency_instructions_html,
        dietaryNotesHtml: child.dietary_notes_html,
        routinesHtml: child.routines_html,
      },
      contacts,
      authorizations,
      healthEntries,
      permissions: {
        canEditProfile: true,
        canManageContacts: context.role !== 'assistant',
        canManageAuthorizations: context.role !== 'assistant',
        canEditCareDates: context.role === 'admin',
      },
    })
  }

  async update({ auth, request, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context) return response.forbidden()
    const child = await assertChildAccess(user, context, params.id, context.role === 'assistant')
    if (!child) return response.notFound()
    const body = request.only([
      'allergies',
      'medicalNotesHtml',
      'doctorName',
      'doctorPhone',
      'emergencyInstructionsHtml',
      'dietaryNotesHtml',
      'routinesHtml',
      'careStartedAt',
      'careEndedAt',
    ])
    const payload: Record<string, unknown> = {
      allergies: textOrNull(body.allergies, 2_000),
      medical_notes_html: cleanRichText(body.medicalNotesHtml),
      doctor_name: textOrNull(body.doctorName, 160),
      doctor_phone: textOrNull(body.doctorPhone, 32),
      emergency_instructions_html: cleanRichText(body.emergencyInstructionsHtml),
      dietary_notes_html: cleanRichText(body.dietaryNotesHtml),
      routines_html: cleanRichText(body.routinesHtml),
      updated_at: new Date(),
    }
    if (context.role === 'admin') {
      payload.care_started_at = dateOrNull(body.careStartedAt)
      payload.care_ended_at = dateOrNull(body.careEndedAt)
    }
    await db.from('children').where({ id: child.id, mam_id: context.mamId }).update(payload)
    await this.audit(context.mamId, user.id, 'child.profile.updated', child.id)
    await this.notifyCounterpart(context, child.id, user.id, {
      category: 'health',
      type: 'child.profile.updated',
      title: `Le dossier de ${child.first_name} a été mis à jour`,
      body: 'Une information du dossier enfant a changé. Consultez l’espace sécurisé pour la vérifier.',
    })
    session.flash('success', 'Dossier enfant enregistré.')
    return response.redirect().back()
  }

  async addHealthEntry({ auth, request, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context) return response.forbidden()
    const child = await assertChildAccess(user, context, params.id, context.role === 'assistant')
    if (!child) return response.notFound()
    const kinds = new Set(['health', 'medication', 'allergy', 'instruction', 'other'])
    const kind = kinds.has(request.input('kind')) ? request.input('kind') : 'other'
    const contentHtml = cleanRichText(request.input('contentHtml'))
    if (!hasRichText(contentHtml)) {
      session.flash('error', 'La note de santé ne peut pas être vide.')
      return response.redirect().back()
    }
    const id = crypto.randomUUID()
    await db.table('health_entries').insert({
      id,
      mam_id: context.mamId,
      child_id: child.id,
      author_id: user.id,
      kind,
      content_html: contentHtml,
      created_at: new Date(),
      updated_at: new Date(),
    })
    await this.audit(context.mamId, user.id, 'child.health_entry.created', id)
    await this.notifyCounterpart(context, child.id, user.id, {
      category: 'health',
      type: 'child.health_entry.created',
      title: `Nouvelle information concernant ${child.first_name}`,
      body: 'Une information de santé ou une consigne a été ajoutée. Son contenu reste uniquement dans l’espace sécurisé.',
    })
    session.flash('success', 'Information ajoutée et personnes concernées notifiées.')
    return response.redirect().back()
  }

  async addContact({ auth, request, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role === 'assistant') return response.forbidden()
    const child = await assertChildAccess(user, context, params.id)
    if (!child) return response.notFound()
    const fullName = textOrNull(request.input('fullName'), 160)
    const relationship = textOrNull(request.input('relationship'), 80)
    const email = textOrNull(request.input('email'), 254)
    if (!fullName || !relationship || (email && !/^\S+@\S+\.\S+$/.test(email))) {
      session.flash('error', 'Vérifiez le nom, le lien avec l’enfant et l’adresse e-mail.')
      return response.redirect().back()
    }
    const id = crypto.randomUUID()
    await db.table('child_contacts').insert({
      id,
      mam_id: context.mamId,
      child_id: child.id,
      full_name: fullName,
      relationship,
      phone: textOrNull(request.input('phone'), 32),
      email,
      emergency_contact: request.input('emergencyContact') === true,
      authorized_pickup: request.input('authorizedPickup') === true,
      priority: Math.min(999, Math.max(1, Number(request.input('priority', 100)) || 100)),
      notes_html: cleanRichText(request.input('notesHtml'), 5_000),
      created_at: new Date(),
      updated_at: new Date(),
    })
    await this.audit(context.mamId, user.id, 'child.contact.created', id)
    session.flash('success', 'Contact ajouté.')
    return response.redirect().back()
  }

  async deleteContact({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role === 'assistant') return response.forbidden()
    const child = await assertChildAccess(user, context, params.id)
    if (!child) return response.notFound()
    const deleted = await db
      .from('child_contacts')
      .where({ id: params.contactId, child_id: child.id, mam_id: context.mamId })
      .delete()
    if (!deleted) return response.notFound()
    await this.audit(context.mamId, user.id, 'child.contact.deleted', params.contactId)
    session.flash('success', 'Contact supprimé.')
    return response.redirect().back()
  }

  async updateAuthorization({ auth, request, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role === 'assistant') return response.forbidden()
    const child = await assertChildAccess(user, context, params.id)
    if (!child) return response.notFound()
    const kinds = new Set([
      'photo_internal',
      'photo_external',
      'outings',
      'transport',
      'emergency_care',
      'medication',
      'other',
    ])
    const statuses = new Set(['pending', 'granted', 'refused', 'revoked'])
    if (!kinds.has(params.kind) || !statuses.has(request.input('status')))
      return response.badRequest()
    const now = new Date()
    const payload = {
      mam_id: context.mamId,
      child_id: child.id,
      kind: params.kind,
      status: request.input('status'),
      valid_from: dateOrNull(request.input('validFrom')),
      valid_until: dateOrNull(request.input('validUntil')),
      notes_html: cleanRichText(request.input('notesHtml'), 5_000),
      decided_by: user.id,
      decided_at: request.input('status') === 'pending' ? null : now,
      updated_at: now,
    }
    const [authorization] = await db
      .table('child_authorizations')
      .insert({ id: crypto.randomUUID(), ...payload, created_at: now })
      .onConflict(['child_id', 'kind'])
      .merge(payload)
      .returning('id')
    await this.audit(context.mamId, user.id, 'child.authorization.updated', authorization.id)
    await this.notifyCounterpart(context, child.id, user.id, {
      category: 'establishment',
      type: 'child.authorization.updated',
      title: `Autorisation mise à jour pour ${child.first_name}`,
      body: 'Une autorisation parentale a changé. Consultez le dossier sécurisé pour voir son statut.',
    })
    session.flash('success', 'Autorisation enregistrée.')
    return response.redirect().back()
  }

  private async notifyCounterpart(
    context: MamContext,
    childId: string,
    actorId: string,
    input: { category: NotificationCategory; type: string; title: string; body: string }
  ) {
    let rows: Array<{ user_id: string }> = []
    if (context.role === 'parent') {
      const admins = await db
        .from('memberships')
        .where({ mam_id: context.mamId, role: 'admin', status: 'active' })
        .select('user_id')
      const assistants =
        context.assignmentMode === 'all'
          ? await db
              .from('memberships')
              .where({ mam_id: context.mamId, role: 'assistant', status: 'active' })
              .select('user_id')
          : await db
              .from('child_staff')
              .join('memberships', 'memberships.user_id', 'child_staff.user_id')
              .where({
                'child_staff.mam_id': context.mamId,
                'child_staff.child_id': childId,
                'memberships.mam_id': context.mamId,
                'memberships.role': 'assistant',
                'memberships.status': 'active',
              })
              .select('child_staff.user_id')
      rows = [...admins, ...assistants]
    } else {
      rows = await db
        .from('child_guardians')
        .where({ mam_id: context.mamId, child_id: childId })
        .select('user_id')
    }
    await new NotificationService().notifyUsers({
      mamId: context.mamId,
      recipientIds: rows.map((row) => row.user_id).filter((id) => id !== actorId),
      actorId,
      actionUrl: `/enfants/${childId}/dossier`,
      data: { childId },
      ...input,
    })
  }

  private async audit(mamId: string, actorId: string, action: string, subjectId: string) {
    await db.table('audit_logs').insert({
      mam_id: mamId,
      actor_id: actorId,
      action,
      subject_type: 'child',
      subject_id: subjectId,
      metadata: JSON.stringify({}),
      created_at: new Date(),
    })
  }
}
