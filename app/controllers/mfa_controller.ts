import { getSecurityState, isMfaRequired } from '#services/account_security_service'
import RateLimitService from '#services/rate_limit_service'
import {
  createRecoveryCodes,
  createTotpSecret,
  hashRecoveryCode,
  verifyTotp,
} from '#services/totp_service'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import encryption from '@adonisjs/core/services/encryption'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class MfaController {
  async challenge({ inertia, response, session }: HttpContext) {
    response.header('X-Robots-Tag', 'noindex, nofollow, noarchive')
    const pendingAt = Number(session.get('mfaPendingAt') ?? 0)
    if (!session.get('mfaPendingUserId') || Date.now() - pendingAt > 10 * 60_000) {
      session.forget('mfaPendingUserId')
      session.forget('mfaPendingAt')
      return response.redirect('/login')
    }
    return inertia.render('auth/mfa_challenge', {})
  }

  async verify(ctx: HttpContext) {
    const { request, response, session, auth } = ctx
    const userId = String(session.get('mfaPendingUserId') ?? '')
    const pendingAt = Number(session.get('mfaPendingAt') ?? 0)
    if (!userId || Date.now() - pendingAt > 10 * 60_000) return response.redirect('/login')
    const limiter = new RateLimitService()
    const state = await limiter.check('mfa-challenge', userId)
    if (!state.allowed) {
      response.header('Retry-After', String(Math.max(state.retryAfter, 60)))
      session.flash('error', 'Trop de tentatives. Réessayez dans quelques minutes.')
      return response.redirect('/mfa')
    }
    const security = await getSecurityState(userId)
    const secret = security.mfa_secret
      ? encryption.decrypt<string>(security.mfa_secret, 'nidilo-mfa')
      : null
    const code = String(request.input('code', '')).replace(/\s|-/g, '').toUpperCase()
    const recoveryCodes = Array.isArray(security.mfa_recovery_codes)
      ? security.mfa_recovery_codes
      : []
    const recoveryHash = hashRecoveryCode(code)
    const recoveryIndex = recoveryCodes.indexOf(recoveryHash)
    const valid = Boolean(secret && verifyTotp(secret, code)) || recoveryIndex >= 0
    if (!valid) {
      await limiter.hit('mfa-challenge', userId, {
        limit: 8,
        windowSeconds: 15 * 60,
        blockSeconds: 15 * 60,
      })
      session.flash('error', 'Code de sécurité incorrect.')
      return response.redirect('/mfa')
    }
    if (recoveryIndex >= 0) {
      recoveryCodes.splice(recoveryIndex, 1)
      await db
        .from('users')
        .where('id', userId)
        .update({ mfa_recovery_codes: JSON.stringify(recoveryCodes), updated_at: new Date() })
    }
    await limiter.clear('mfa-challenge', userId)
    const user = await User.findOrFail(userId)
    session.forget('mfaPendingUserId')
    session.forget('mfaPendingAt')
    const redirectTo = String(session.pull('mfaPendingRedirect') ?? '/dashboard')
    await auth.use('web').login(user)
    session.regenerate()
    session.put('securityVersion', Number(security.security_version))
    user.lastLoginAt = DateTime.now()
    await user.save()
    return response.redirect(
      redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/dashboard'
    )
  }

  async setup({ auth, inertia, response, session }: HttpContext) {
    response.header('X-Robots-Tag', 'noindex, nofollow, noarchive')
    const user = auth.getUserOrFail()
    const security = await getSecurityState(user.id)
    if (security.mfa_enabled) return response.redirect('/parametres/securite')
    let secret = session.get('mfaSetupSecret') as string | undefined
    if (!secret) {
      secret = createTotpSecret()
      session.put('mfaSetupSecret', secret)
    }
    const uri = `otpauth://totp/${encodeURIComponent(`Nidilo:${user.email}`)}?secret=${secret}&issuer=Nidilo&algorithm=SHA1&digits=6&period=30`
    return inertia.render('auth/mfa_setup', {
      secret,
      uri,
      required: await isMfaRequired(user),
    })
  }

  async confirm({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const secret = session.get('mfaSetupSecret') as string | undefined
    const code = String(request.input('code', ''))
    if (!secret || !verifyTotp(secret, code)) {
      session.flash('error', 'Le code est incorrect. Vérifiez l’heure du téléphone puis réessayez.')
      return response.redirect('/securite/mfa/configurer')
    }
    const recoveryCodes = createRecoveryCodes()
    await db
      .from('users')
      .where('id', user.id)
      .update({
        mfa_enabled: true,
        mfa_secret: encryption.encrypt(secret, { purpose: 'nidilo-mfa' }),
        mfa_recovery_codes: JSON.stringify(recoveryCodes.map(hashRecoveryCode)),
        mfa_confirmed_at: new Date(),
        security_version: db.raw('security_version + 1'),
        updated_at: new Date(),
      })
    await db.table('audit_logs').insert({
      actor_id: user.id,
      action: 'account.mfa_enabled',
      subject_type: 'user',
      subject_id: user.id,
      metadata: JSON.stringify({}),
      created_at: new Date(),
    })
    const state = await getSecurityState(user.id)
    session.put('securityVersion', Number(state.security_version))
    session.forget('mfaSetupSecret')
    session.put('newMfaRecoveryCodes', recoveryCodes)
    session.flash('success', 'Double authentification activée.')
    return response.redirect('/parametres/securite')
  }
}
