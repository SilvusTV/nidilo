import { getSecurityState, isMfaRequired } from '#services/account_security_service'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class SecuritySettingsController {
  async index({ auth, inertia, response, session }: HttpContext) {
    response.header('X-Robots-Tag', 'noindex, nofollow, noarchive')
    const user = auth.getUserOrFail()
    const security = await getSecurityState(user.id)
    const recoveryCodes = session.pull('newMfaRecoveryCodes') as string[] | undefined
    return inertia.render('settings/security', {
      mfaEnabled: Boolean(security.mfa_enabled),
      mfaRequired: await isMfaRequired(user),
      recoveryCodes: recoveryCodes ?? null,
    })
  }

  async revokeSessions({ auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    await db
      .from('users')
      .where('id', user.id)
      .update({ security_version: db.raw('security_version + 1'), updated_at: new Date() })
    await db.table('audit_logs').insert({
      actor_id: user.id,
      action: 'account.sessions_revoked',
      subject_type: 'user',
      subject_id: user.id,
      metadata: JSON.stringify({}),
      created_at: new Date(),
    })
    await auth.use('web').logout()
    session.clear()
    session.flash('success', 'Toutes vos sessions ont été révoquées. Reconnectez-vous.')
    return response.redirect('/login')
  }
}
