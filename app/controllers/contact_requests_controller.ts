import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import { contactValidator } from '#validators/contact'
import BrevoService from '#services/brevo_service'
import RateLimitService from '#services/rate_limit_service'

const roleLabels = {
  mam: 'Responsable de MAM',
  assistant: 'Assistant(e) maternel(le)',
  parent: 'Parent',
  partner: 'Partenaire',
  other: 'Autre',
}

export default class ContactRequestsController {
  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(contactValidator)

    // Honeypot: les visiteurs humains ne voient jamais ce champ.
    if (payload.website) {
      session.flash('success', 'Merci, votre demande a bien été envoyée.')
      return response.redirect('/#contact')
    }

    const ipLimit = await new RateLimitService().hit('contact-ip', request.ip(), {
      limit: 8,
      windowSeconds: 60 * 60,
    })
    if (!ipLimit.allowed) {
      response.header('Retry-After', String(Math.max(ipLimit.retryAfter, 60)))
      session.flash('error', 'Plusieurs demandes ont déjà été reçues. Réessayez dans une heure.')
      return response.redirect('/#contact')
    }

    const recentRequests = await db
      .from('contact_requests')
      .where('email', payload.email)
      .where('created_at', '>=', new Date(Date.now() - 60 * 60 * 1000))
      .count('* as total')
      .first()
    if (Number(recentRequests?.total ?? 0) >= 3) {
      session.flash('error', 'Plusieurs demandes ont déjà été reçues. Réessayez dans une heure.')
      return response.redirect('/#contact')
    }

    await db.table('contact_requests').insert({
      id: crypto.randomUUID(),
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone || null,
      organization: payload.organization || null,
      role: payload.role,
      message: payload.message,
      status: 'new',
      consented_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    })

    try {
      const brevo = new BrevoService()
      if (!brevo.isConfigured) throw new Error('Brevo non configuré')
      await brevo.sendEmail({
        to: env.get('CONTACT_TO_ADDRESS', env.get('MAIL_FROM_ADDRESS')),
        replyTo: payload.email,
        subject: `Nouvelle demande Nidilo — ${payload.fullName}`,
        tags: ['nidilo', 'contact'],
        htmlContent: `<h1>Nouvelle demande Nidilo</h1><p><strong>Nom :</strong> ${escapeHtml(payload.fullName)}</p><p><strong>E-mail :</strong> ${escapeHtml(payload.email)}</p><p><strong>Téléphone :</strong> ${escapeHtml(payload.phone || 'Non renseigné')}</p><p><strong>Structure :</strong> ${escapeHtml(payload.organization || 'Non renseignée')}</p><p><strong>Profil :</strong> ${escapeHtml(roleLabels[payload.role])}</p><hr><p>${escapeHtml(payload.message).replace(/\n/g, '<br>')}</p>`,
      })
    } catch (error) {
      logger.warn({ err: error }, 'Contact request stored but notification email failed')
    }

    session.flash(
      'success',
      'Merci ! Votre demande a bien été envoyée. Nous revenons vers vous rapidement.'
    )
    return response.redirect('/#contact')
  }
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!
  )
