import type { HttpContext } from '@adonisjs/core/http'

export type ProductAnalyticsEvent = {
  id: string
  event:
    | 'login_succeeded'
    | 'invitation_accepted'
    | 'child_created'
    | 'daily_report_saved'
    | 'quick_entry_recorded'
    | 'guardian_invited'
    | 'staff_invited'
    | 'notification_preference_updated'
    | 'mam_created'
  properties: Record<string, string | number | boolean | null>
}

export function flashProductAnalytics(
  session: HttpContext['session'],
  event: ProductAnalyticsEvent['event'],
  properties: ProductAnalyticsEvent['properties'] = {}
) {
  session.flash('analyticsEvent', {
    id: crypto.randomUUID(),
    event,
    properties,
  } satisfies ProductAnalyticsEvent)
}
