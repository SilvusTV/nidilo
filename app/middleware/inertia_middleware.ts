import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import UserTransformer from '#transformers/user_transformer'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'
import db from '@adonisjs/lucid/services/db'
import { getMamContext } from '#services/access_service'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    /**
     * The share method is called everytime an Inertia page is rendered. In
     * certain cases, a page may get rendered before the session middleware
     * or the auth middleware are executed. For example: During a 404 request.
     *
     * In that case, we must always assume that HttpContext is not fully hydrated
     * with all the properties
     */
    const { auth } = ctx as Partial<HttpContext>

    /**
     * Data shared with all Inertia pages. Make sure you are using
     * transformers for rich data-types like Models.
     */
    const context = auth?.user ? await getMamContext(auth.user) : null
    const mamRecord = context
      ? await db
          .from('mams')
          .where('id', context.mamId)
          .select('name', 'theme_key as themeKey', 'logo_key as logoKey')
          .first()
      : null
    const mam = mamRecord
      ? {
          ...mamRecord,
          logoUrl: mamRecord.logoKey
            ? `/media/logo-mam?v=${encodeURIComponent(mamRecord.logoKey)}`
            : null,
        }
      : null
    const unread = auth?.user
      ? await db
          .from('notifications')
          .where({ user_id: auth.user.id })
          .whereNull('read_at')
          .count('* as total')
          .first()
      : null
    return {
      cspNonce: ctx.inertia.always(ctx.response.nonce),
      errors: ctx.inertia.always(this.getValidationErrors(ctx)),
      user: ctx.inertia.always(auth?.user ? UserTransformer.transform(auth.user) : undefined),
      mamBrand: ctx.inertia.always(mam),
      mamRole: ctx.inertia.always(context?.role),
      unreadNotifications: ctx.inertia.always(Number(unread?.total ?? 0)),
    }
  }

  /**
   * The flash bag is sent to every Inertia page as a top-level "flash" field
   * (a sibling of "props") and is read on the client using "usePage().flash".
   *
   * Just like the share method, the flash method may run before the session
   * middleware, so HttpContext must be treated as partially hydrated.
   */
  flash(ctx: HttpContext) {
    const { session } = ctx as Partial<HttpContext>

    /**
     * Fetching the first error from the flash messages
     */
    return {
      error: session?.flashMessages.get('error') as string | undefined,
      success: session?.flashMessages.get('success') as string | undefined,
    }
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)

    const output = await next()
    this.dispose(ctx)

    return output
  }
}

declare module '@adonisjs/inertia/types' {
  type MiddlewareSharedProps = InferSharedProps<InertiaMiddleware>
  export interface SharedProps extends MiddlewareSharedProps {}
}
