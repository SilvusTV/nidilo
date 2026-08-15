import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import app from '@adonisjs/core/services/app'
import { getSecurityState, isPrivileged } from '#services/account_security_service'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    ctx.response.header('X-Robots-Tag', 'noindex, nofollow, noarchive')
    await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })
    const user = ctx.auth.getUserOrFail()
    const security = await getSecurityState(user.id)
    const sessionVersion = ctx.session.get('securityVersion')
    if (!app.inTest && Number(sessionVersion) !== Number(security.security_version)) {
      await ctx.auth.use('web').logout()
      ctx.session.clear()
      ctx.session.flash('error', 'Votre session a expiré. Reconnectez-vous.')
      return ctx.response.redirect('/login')
    }
    if (
      !app.inTest &&
      !security.mfa_enabled &&
      (await isPrivileged(user)) &&
      !ctx.request.url().startsWith('/securite/mfa/configurer') &&
      ctx.request.url() !== '/logout'
    ) {
      return ctx.response.redirect('/securite/mfa/configurer')
    }
    return next()
  }
}
