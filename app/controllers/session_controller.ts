import User from '#models/user'
import RateLimitService from '#services/rate_limit_service'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { randomInt } from 'node:crypto'

const loginLimit = { limit: 8, windowSeconds: 15 * 60, blockSeconds: 15 * 60 }

export default class SessionController {
  async create({ inertia, response, session, request }: HttpContext) {
    response.header('X-Robots-Tag', 'noindex, nofollow, noarchive')
    const captcha = session.get('loginCaptcha') as
      { left: number; right: number; expiresAt: number } | undefined
    let activeCaptcha = captcha && captcha.expiresAt > Date.now() ? captcha : null
    if (captcha && !activeCaptcha) session.forget('loginCaptcha')
    const ipState = await new RateLimitService().check('login-ip', request.ip())
    if (!activeCaptcha && ipState.attempts >= 3) {
      this.issueCaptcha(session)
      activeCaptcha = session.get('loginCaptcha')
    }
    return inertia.render('auth/login', {
      captcha: activeCaptcha
        ? { question: `${activeCaptcha.left} + ${activeCaptcha.right}` }
        : null,
    })
  }

  async store(ctx: HttpContext) {
    const { request, response, session } = ctx
    const { email, password } = await request.validateUsing(loginValidator)
    const normalizedEmail = email.trim().toLowerCase()
    const limiter = new RateLimitService()
    const ipIdentity = request.ip()
    const [ipState, accountState] = await Promise.all([
      limiter.check('login-ip', ipIdentity),
      limiter.check('login-account', normalizedEmail),
    ])

    if (!ipState.allowed || !accountState.allowed) {
      response.header(
        'Retry-After',
        String(Math.max(ipState.retryAfter, accountState.retryAfter, 60))
      )
      session.flash('error', 'Trop de tentatives. Réessayez dans quelques minutes.')
      return response.redirect('/login')
    }

    const captcha = session.get('loginCaptcha') as
      { left: number; right: number; expiresAt: number } | undefined
    if (!captcha && Math.max(ipState.attempts, accountState.attempts) >= 3) {
      this.issueCaptcha(session)
      session.flash('error', 'Complétez le contrôle anti-robot pour continuer.')
      return response.redirect('/login')
    }
    if (captcha) {
      const answer = Number(request.input('captchaAnswer'))
      if (captcha.expiresAt <= Date.now() || answer !== captcha.left + captcha.right) {
        this.issueCaptcha(session)
        session.flash('error', 'Le contrôle anti-robot est incorrect ou a expiré.')
        return response.redirect('/login')
      }
    }

    let user: User
    try {
      user = await User.verifyCredentials(normalizedEmail, password)
    } catch {
      const [ipHit, accountHit] = await Promise.all([
        limiter.hit('login-ip', ipIdentity, loginLimit),
        limiter.hit('login-account', normalizedEmail, loginLimit),
      ])
      if (Math.max(ipHit.attempts, accountHit.attempts) >= 3) this.issueCaptcha(session)
      session.flash('error', 'Adresse e-mail ou mot de passe incorrect.')
      return response.redirect('/login')
    }

    if (user.status !== 'active') {
      session.flash('error', 'Ce compte ne permet pas la connexion.')
      return response.redirect('/login')
    }

    await Promise.all([
      limiter.clear('login-ip', ipIdentity),
      limiter.clear('login-account', normalizedEmail),
    ])
    session.forget('loginCaptcha')

    const security = await db
      .from('users')
      .where('id', user.id)
      .select('security_version', 'mfa_enabled')
      .firstOrFail()
    if (security.mfa_enabled) {
      session.put('mfaPendingUserId', user.id)
      session.put('mfaPendingAt', Date.now())
      return response.redirect('/mfa')
    }

    await this.completeLogin(ctx, user, Number(security.security_version))
  }

  async destroy({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()
    session.clear()
    response.redirect().toRoute('session.create')
  }

  private issueCaptcha(session: HttpContext['session']) {
    session.put('loginCaptcha', {
      left: randomInt(2, 10),
      right: randomInt(2, 10),
      expiresAt: Date.now() + 10 * 60_000,
    })
  }

  private async completeLogin(ctx: HttpContext, user: User, securityVersion: number) {
    await ctx.auth.use('web').login(user)
    ctx.session.regenerate()
    ctx.session.put('securityVersion', securityVersion)
    user.lastLoginAt = DateTime.now()
    await user.save()
    ctx.response.redirect('/dashboard')
  }
}
