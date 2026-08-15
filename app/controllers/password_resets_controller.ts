import { appUrl } from '#config/app'
import User from '#models/user'
import BrevoService from '#services/brevo_service'
import RateLimitService from '#services/rate_limit_service'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import { createHash, randomBytes } from 'node:crypto'

const digest = (token: string) => createHash('sha256').update(token).digest('hex')
const genericMessage =
  'Si un compte correspond à cette adresse, un lien de réinitialisation vient d’être envoyé.'

export default class PasswordResetsController {
  async requestForm({ inertia, response }: HttpContext) {
    response.header('X-Robots-Tag', 'noindex, nofollow, noarchive')
    return inertia.render('auth/forgot_password', {})
  }

  async requestLink({ request, response, session }: HttpContext) {
    const email = String(request.input('email', '')).trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      session.flash('success', genericMessage)
      return response.redirect('/mot-de-passe-oublie')
    }
    const limiter = new RateLimitService()
    const [ipLimit, emailLimit] = await Promise.all([
      limiter.hit('password-reset-ip', request.ip(), { limit: 10, windowSeconds: 3600 }),
      limiter.hit('password-reset-account', email, { limit: 3, windowSeconds: 3600 }),
    ])
    if (ipLimit.allowed && emailLimit.allowed) {
      const user = await User.findBy('email', email)
      if (user?.status === 'active') {
        const token = randomBytes(32).toString('base64url')
        await db.transaction(async (trx) => {
          await trx.from('password_reset_tokens').where('user_id', user.id).delete()
          await trx.table('password_reset_tokens').insert({
            id: crypto.randomUUID(),
            user_id: user.id,
            token_hash: digest(token),
            expires_at: new Date(Date.now() + 30 * 60_000),
            created_at: new Date(),
          })
        })
        try {
          await new BrevoService().sendEmail({
            to: user.email,
            subject: 'Réinitialiser votre mot de passe Nidilo',
            tags: ['nidilo', 'security', 'password-reset'],
            htmlContent: `<h1>Réinitialisation du mot de passe</h1><p>Ce lien à usage unique est valable 30 minutes.</p><p><a href="${new URL(`/reinitialiser-mot-de-passe/${token}`, appUrl)}">Choisir un nouveau mot de passe</a></p><p>Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail.</p>`,
          })
        } catch (error) {
          logger.warn(
            { err: error, event: 'password_reset_delivery_failed' },
            'Security email failed'
          )
        }
      }
    }
    session.flash('success', genericMessage)
    return response.redirect('/mot-de-passe-oublie')
  }

  async resetForm({ params, inertia, response }: HttpContext) {
    response.header('X-Robots-Tag', 'noindex, nofollow, noarchive')
    const valid = Boolean(await this.findToken(params.token))
    return inertia.render('auth/reset_password', { valid })
  }

  async reset({ request, params, response, session }: HttpContext) {
    const token = await this.findToken(params.token)
    if (!token) {
      session.flash('error', 'Ce lien est invalide ou a expiré.')
      return response.redirect(`/reinitialiser-mot-de-passe/${params.token}`)
    }
    const password = String(request.input('password', ''))
    const confirmation = String(request.input('passwordConfirmation', ''))
    if (password.length < 12 || password !== confirmation) {
      session.flash('error', 'Utilisez au moins 12 caractères et confirmez le même mot de passe.')
      return response.redirect().back()
    }
    await db.transaction(async (trx) => {
      const claimed = await trx
        .from('password_reset_tokens')
        .where({ id: token.id })
        .whereNull('used_at')
        .forUpdate()
        .first()
      if (!claimed) throw new Error('RESET_TOKEN_ALREADY_USED')
      await trx
        .from('users')
        .where('id', token.user_id)
        .update({
          password: await hash.make(password),
          security_version: db.raw('security_version + 1'),
          updated_at: new Date(),
        })
      await trx
        .from('password_reset_tokens')
        .where('user_id', token.user_id)
        .update({ used_at: new Date() })
      await trx.table('audit_logs').insert({
        actor_id: token.user_id,
        action: 'account.password_reset',
        subject_type: 'user',
        subject_id: token.user_id,
        metadata: JSON.stringify({ sessionsRevoked: true }),
        created_at: new Date(),
      })
    })
    session.flash(
      'success',
      'Mot de passe modifié. Toutes vos anciennes sessions ont été révoquées.'
    )
    return response.redirect('/login')
  }

  private findToken(token: string) {
    if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) return null
    return db
      .from('password_reset_tokens')
      .where('token_hash', digest(token))
      .whereNull('used_at')
      .where('expires_at', '>', new Date())
      .first()
  }
}
