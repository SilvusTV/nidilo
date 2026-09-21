import posthog from 'posthog-js'
import { sanitizeAnalyticsProperties } from './analytics_properties'

export type AnalyticsConsent = {
  version: 1
  analytics: boolean
  replay: boolean
  decidedAt: string
  expiresAt: string
}

type SafeProperties = Record<string, string | number | boolean | null>

export type ConfirmedAnalyticsEvent = {
  id: string
  event: string
  properties: SafeProperties
}

export const CONSENT_STORAGE_KEY = 'nidilo:cookie-consent:v1'
export const CONSENT_DURATION_DAYS = 183
export const ANALYTICS_ENVIRONMENT = import.meta.env.PROD ? 'prod' : 'local'

const POSTHOG_KEY =
  import.meta.env.VITE_POSTHOG_KEY || 'phc_nysrbeRyCzcmRUEPUvcXydivetaWx5XNi4YpW4dDYCN5'
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com'
const POSTHOG_UI_HOST = import.meta.env.VITE_POSTHOG_UI_HOST || 'https://eu.posthog.com'

const UUID_SEGMENT = /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i
const TOKEN_SEGMENT = /^[A-Za-z0-9_-]{20,}$/
const DATE_SEGMENT = /^\d{4}-\d{2}-\d{2}$/
const NUMERIC_SEGMENT = /^\d+$/

let initialized = false
let lastPagePath: string | null = null

export function readAnalyticsConsent(now = new Date()): AnalyticsConsent | null {
  if (typeof window === 'undefined') return null

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? 'null')
    if (
      parsed?.version !== 1 ||
      typeof parsed.analytics !== 'boolean' ||
      typeof parsed.replay !== 'boolean' ||
      typeof parsed.decidedAt !== 'string' ||
      typeof parsed.expiresAt !== 'string' ||
      new Date(parsed.expiresAt).getTime() <= now.getTime()
    ) {
      if (parsed?.expiresAt && new Date(parsed.expiresAt).getTime() <= now.getTime()) {
        clearAnalyticsPersistence()
      }
      return null
    }

    return { ...parsed, replay: parsed.analytics && parsed.replay }
  } catch {
    return null
  }
}

export function createAnalyticsConsent(
  analytics: boolean,
  replay: boolean,
  now = new Date()
): AnalyticsConsent {
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + CONSENT_DURATION_DAYS)

  return {
    version: 1,
    analytics,
    replay: analytics && replay,
    decidedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
}

export function storeAnalyticsConsent(consent: AnalyticsConsent) {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent))
}

export function normalizeAnalyticsPath(input: string): string {
  let pathname = input
  try {
    pathname = new URL(input, window.location.origin).pathname
  } catch {
    pathname = input.split(/[?#]/, 1)[0]
  }

  const segments = pathname.split('/').filter(Boolean)
  const normalized = segments.map((segment, index) => {
    const decoded = safeDecode(segment)
    const previous = segments[index - 1]?.toLowerCase()

    if (DATE_SEGMENT.test(decoded)) return ':date'
    if (previous === 'invitations' || previous === 'reinitialiser-mot-de-passe') return ':token'
    if (
      UUID_SEGMENT.test(decoded) ||
      NUMERIC_SEGMENT.test(decoded) ||
      TOKEN_SEGMENT.test(decoded)
    ) {
      return ':id'
    }
    return decoded.toLowerCase()
  })

  return normalized.length ? `/${normalized.join('/')}` : '/'
}

export function analyticsArea(path: string): string {
  const normalized = normalizeAnalyticsPath(path)
  if (normalized === '/') return 'marketing'
  if (normalized.startsWith('/login') || normalized === '/mfa') return 'authentication'
  if (normalized.startsWith('/mot-de-passe') || normalized.startsWith('/reinitialiser')) {
    return 'account_recovery'
  }
  if (normalized.startsWith('/invitations')) return 'onboarding'
  if (normalized.startsWith('/saisie-rapide')) return 'quick_entry'
  if (normalized.startsWith('/enfants/:id/fiche')) return 'daily_reports'
  if (normalized.startsWith('/enfants/:id/calendrier')) return 'report_history'
  if (normalized.startsWith('/enfants/:id/dossier')) return 'child_profile'
  if (normalized.startsWith('/enfants/:id/responsables')) return 'guardians'
  if (normalized.startsWith('/enfants')) return 'children'
  if (normalized.startsWith('/personnel')) return 'staff'
  if (normalized.startsWith('/notifications')) return 'notifications'
  if (normalized.startsWith('/parametres/securite')) return 'account_security'
  if (normalized.startsWith('/parametres')) return 'settings'
  if (normalized.startsWith('/super-admin')) return 'super_admin'
  if (normalized === '/dashboard') return 'dashboard'
  if (['/mentions-legales', '/confidentialite', '/cgu', '/sous-traitants'].includes(normalized)) {
    return 'legal'
  }
  return 'other'
}

export function configureAnalytics(consent: AnalyticsConsent | null) {
  if (!consent?.analytics) {
    if (initialized) {
      posthog.stopSessionRecording()
      posthog.opt_out_capturing()
      posthog.reset(true)
      lastPagePath = null
    }
    return
  }

  if (!initialized) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      ui_host: POSTHOG_UI_HOST,
      defaults: '2026-05-30',
      persistence: 'localStorage+cookie',
      persistence_name: 'nidilo_analytics',
      cookie_expiration: CONSENT_DURATION_DAYS,
      cross_subdomain_cookie: false,
      secure_cookie: window.location.protocol === 'https:',
      respect_dnt: true,
      person_profiles: 'never',
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: false,
      rageclick: true,
      capture_dead_clicks: true,
      capture_heatmaps: true,
      capture_exceptions: true,
      capture_performance: { network_timing: true, web_vitals: true },
      enable_recording_console_log: false,
      disable_session_recording: !consent.replay,
      disable_surveys: true,
      disable_product_tours: true,
      mask_all_text: true,
      mask_all_element_attributes: true,
      mask_personal_data_properties: true,
      custom_personal_data_properties: ['email', 'telephone', 'phone', 'token', 'nom', 'prenom'],
      property_denylist: [
        '$ip',
        'email',
        'name',
        'full_name',
        'first_name',
        'last_name',
        'phone',
        'address',
        'user_id',
        'workspace_id',
        'mam_id',
      ],
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '*',
        maskAllElementAttributes: true,
        blockSelector: '[data-analytics-private="true"]',
        captureJsonLd: false,
        recordBody: false,
        recordHeaders: false,
        collectFonts: false,
      },
      get_current_url: (url) => safeAnalyticsUrl(url),
      before_send: (event) => sanitizeCapturedEvent(event),
      loaded: (instance) => {
        instance.opt_in_capturing()
        instance.register({ app: 'nidilo', environment: ANALYTICS_ENVIRONMENT })
      },
    })
    initialized = true
  } else {
    posthog.opt_in_capturing()
    posthog.set_config({ disable_session_recording: !consent.replay })
  }

  if (consent.replay) posthog.startSessionRecording()
  else posthog.stopSessionRecording()
}

export function capturePageView(url: string) {
  if (!canCapture()) return
  const path = normalizeAnalyticsPath(url)
  if (lastPagePath === path) return
  lastPagePath = path

  captureAnalytics('$pageview', {
    $current_url: safeAnalyticsUrl(url),
    $pathname: path,
    page_area: analyticsArea(path),
  })
}

export function captureAnalytics(event: string, properties: SafeProperties = {}) {
  if (!canCapture()) return false
  posthog.capture(event, { ...properties, environment: ANALYTICS_ENVIRONMENT, app: 'nidilo' })
  return true
}

export function setAnalyticsContext(actorCategory?: string | null) {
  if (!canCapture()) return
  if (actorCategory) posthog.register({ actor_category: actorCategory })
  else posthog.unregister('actor_category')
}

export function captureConfirmedAnalyticsEvent(event?: ConfirmedAnalyticsEvent | null) {
  if (!event || typeof window === 'undefined') return false
  const storageKey = 'nidilo:captured-product-events'
  const captured = readCapturedEventIds(storageKey)
  if (captured.includes(event.id)) return true
  if (!captureAnalytics(event.event, event.properties)) return false

  window.sessionStorage.setItem(storageKey, JSON.stringify([...captured, event.id].slice(-50)))
  return true
}

export function installInteractionTracking() {
  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target.closest('a,button') : null
    if (!target) return

    const href = target instanceof HTMLAnchorElement ? target.href : null
    const targetPath = href ? normalizeAnalyticsPath(href) : null
    captureAnalytics('ui_interaction', {
      interaction_type: target instanceof HTMLAnchorElement ? 'navigation' : 'button',
      target_path: targetPath,
      feature: targetPath ? analyticsArea(targetPath) : analyticsArea(window.location.pathname),
    })
  }

  const onSubmit = (event: SubmitEvent) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null
    if (!form) return
    const path = normalizeAnalyticsPath(form.action || window.location.pathname)
    captureAnalytics('form_submitted', {
      form_path: path,
      form_method: (form.method || 'get').toUpperCase(),
      feature: analyticsArea(path),
    })
  }

  document.addEventListener('click', onClick, { capture: true })
  document.addEventListener('submit', onSubmit, { capture: true })
  return () => {
    document.removeEventListener('click', onClick, { capture: true })
    document.removeEventListener('submit', onSubmit, { capture: true })
  }
}

function canCapture() {
  return initialized && !posthog.has_opted_out_capturing()
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function safeAnalyticsUrl(value: string): string {
  try {
    const url = new URL(value, window.location.origin)
    return `${url.origin}${normalizeAnalyticsPath(url.pathname)}`
  } catch {
    return normalizeAnalyticsPath(value)
  }
}

function sanitizeCapturedEvent(event: any) {
  if (!event) return null
  return {
    ...event,
    properties: sanitizeAnalyticsProperties(event.properties ?? {}, safeAnalyticsUrl),
  }
}

function clearAnalyticsPersistence() {
  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index)
    if (key?.includes('nidilo_analytics')) window.localStorage.removeItem(key)
  }

  for (const entry of document.cookie.split(';')) {
    const name = entry.split('=', 1)[0]?.trim()
    if (name?.includes('nidilo_analytics')) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
    }
  }
}

function readCapturedEventIds(storageKey: string): string[] {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(storageKey) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : []
  } catch {
    return []
  }
}
