/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'contact.store': {
    methods: ["POST"]
    pattern: '/contact'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contact').contactValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/contact').contactValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contact_requests_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contact_requests_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'webhooks.brevo': {
    methods: ["POST"]
    pattern: '/webhooks/brevo'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/brevo_webhooks_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/brevo_webhooks_controller').default['handle']>>>
    }
  }
  'invitations.show': {
    methods: ["GET","HEAD"]
    pattern: '/invitations/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invitation_acceptances_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invitation_acceptances_controller').default['show']>>>
    }
  }
  'invitations.accept': {
    methods: ["POST"]
    pattern: '/invitations/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invitation_acceptances_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invitation_acceptances_controller').default['store']>>>
    }
  }
  'session.create': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'session.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'password.request': {
    methods: ["GET","HEAD"]
    pattern: '/mot-de-passe-oublie'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['requestForm']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['requestForm']>>>
    }
  }
  'password.email': {
    methods: ["POST"]
    pattern: '/mot-de-passe-oublie'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['requestLink']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['requestLink']>>>
    }
  }
  'password.reset': {
    methods: ["GET","HEAD"]
    pattern: '/reinitialiser-mot-de-passe/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['resetForm']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['resetForm']>>>
    }
  }
  'password.update': {
    methods: ["POST"]
    pattern: '/reinitialiser-mot-de-passe/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['reset']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['reset']>>>
    }
  }
  'mfa.challenge': {
    methods: ["GET","HEAD"]
    pattern: '/mfa'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mfa_controller').default['challenge']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mfa_controller').default['challenge']>>>
    }
  }
  'mfa.verify': {
    methods: ["POST"]
    pattern: '/mfa'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mfa_controller').default['verify']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mfa_controller').default['verify']>>>
    }
  }
  'dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
    }
  }
  'security.index': {
    methods: ["GET","HEAD"]
    pattern: '/parametres/securite'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/security_settings_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/security_settings_controller').default['index']>>>
    }
  }
  'security.sessions.revoke': {
    methods: ["POST"]
    pattern: '/parametres/securite/revoquer-sessions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/security_settings_controller').default['revokeSessions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/security_settings_controller').default['revokeSessions']>>>
    }
  }
  'mfa.setup': {
    methods: ["GET","HEAD"]
    pattern: '/securite/mfa/configurer'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mfa_controller').default['setup']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mfa_controller').default['setup']>>>
    }
  }
  'mfa.confirm': {
    methods: ["POST"]
    pattern: '/securite/mfa/configurer'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mfa_controller').default['confirm']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mfa_controller').default['confirm']>>>
    }
  }
  'super.mams.index': {
    methods: ["GET","HEAD"]
    pattern: '/super-admin/mams'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/super_admin_mams_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/super_admin_mams_controller').default['index']>>>
    }
  }
  'super.mams.store': {
    methods: ["POST"]
    pattern: '/super-admin/mams'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/super_admin_mams_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/super_admin_mams_controller').default['store']>>>
    }
  }
  'super.mams.update': {
    methods: ["PATCH"]
    pattern: '/super-admin/mams/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/super_admin_mams_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/super_admin_mams_controller').default['update']>>>
    }
  }
  'mam.logo': {
    methods: ["GET","HEAD"]
    pattern: '/media/logo-mam'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mam_media_controller').default['logo']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mam_media_controller').default['logo']>>>
    }
  }
  'staff.index': {
    methods: ["GET","HEAD"]
    pattern: '/personnel'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/staff_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/staff_controller').default['index']>>>
    }
  }
  'staff.invite': {
    methods: ["POST"]
    pattern: '/personnel/invitations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/staff_controller').default['invite']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/staff_controller').default['invite']>>>
    }
  }
  'staff.update': {
    methods: ["PATCH"]
    pattern: '/personnel/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/staff_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/staff_controller').default['update']>>>
    }
  }
  'quick.index': {
    methods: ["GET","HEAD"]
    pattern: '/saisie-rapide'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quick_entries_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quick_entries_controller').default['index']>>>
    }
  }
  'quick.store': {
    methods: ["POST"]
    pattern: '/saisie-rapide'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quick_entries_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quick_entries_controller').default['store']>>>
    }
  }
  'children.create': {
    methods: ["GET","HEAD"]
    pattern: '/enfants/nouveau'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/children_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/children_controller').default['create']>>>
    }
  }
  'children.store': {
    methods: ["POST"]
    pattern: '/enfants'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/children_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/children_controller').default['store']>>>
    }
  }
  'reports.show': {
    methods: ["GET","HEAD"]
    pattern: '/enfants/:id/fiche'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/daily_reports_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/daily_reports_controller').default['show']>>>
    }
  }
  'reports.published': {
    methods: ["GET","HEAD"]
    pattern: '/enfants/:id/fiche/:date'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; date: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/daily_reports_controller').default['showPublished']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/daily_reports_controller').default['showPublished']>>>
    }
  }
  'reports.calendar': {
    methods: ["GET","HEAD"]
    pattern: '/enfants/:id/calendrier'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_history_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_history_controller').default['index']>>>
    }
  }
  'reports.update': {
    methods: ["PUT"]
    pattern: '/enfants/:id/fiche'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/daily_reports_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/daily_reports_controller').default['update']>>>
    }
  }
  'children.index': {
    methods: ["GET","HEAD"]
    pattern: '/enfants'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/children_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/children_controller').default['index']>>>
    }
  }
  'children.profile': {
    methods: ["GET","HEAD"]
    pattern: '/enfants/:id/dossier'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/child_profiles_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/child_profiles_controller').default['show']>>>
    }
  }
  'children.profile.update': {
    methods: ["PUT"]
    pattern: '/enfants/:id/dossier'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/child_profiles_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/child_profiles_controller').default['update']>>>
    }
  }
  'children.health.store': {
    methods: ["POST"]
    pattern: '/enfants/:id/sante'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/child_profiles_controller').default['addHealthEntry']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/child_profiles_controller').default['addHealthEntry']>>>
    }
  }
  'children.contacts.store': {
    methods: ["POST"]
    pattern: '/enfants/:id/contacts'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/child_profiles_controller').default['addContact']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/child_profiles_controller').default['addContact']>>>
    }
  }
  'children.contacts.destroy': {
    methods: ["DELETE"]
    pattern: '/enfants/:id/contacts/:contactId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; contactId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/child_profiles_controller').default['deleteContact']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/child_profiles_controller').default['deleteContact']>>>
    }
  }
  'children.authorizations.update': {
    methods: ["PUT"]
    pattern: '/enfants/:id/autorisations/:kind'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; kind: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/child_profiles_controller').default['updateAuthorization']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/child_profiles_controller').default['updateAuthorization']>>>
    }
  }
  'children.archive': {
    methods: ["POST"]
    pattern: '/enfants/:id/archiver'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/children_controller').default['archive']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/children_controller').default['archive']>>>
    }
  }
  'children.restore': {
    methods: ["POST"]
    pattern: '/enfants/:id/restaurer'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/children_controller').default['restore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/children_controller').default['restore']>>>
    }
  }
  'guardians.index': {
    methods: ["GET","HEAD"]
    pattern: '/enfants/:id/responsables'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invitations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invitations_controller').default['index']>>>
    }
  }
  'invitations.store': {
    methods: ["POST"]
    pattern: '/enfants/:id/responsables/invitations'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invitations_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invitations_controller').default['store']>>>
    }
  }
  'notifications.index': {
    methods: ["GET","HEAD"]
    pattern: '/notifications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['index']>>>
    }
  }
  'notifications.read': {
    methods: ["PATCH"]
    pattern: '/notifications/:id/lire'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['read']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['read']>>>
    }
  }
  'notifications.preferences': {
    methods: ["GET","HEAD"]
    pattern: '/parametres/notifications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['preferences']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['preferences']>>>
    }
  }
  'notifications.preferences.update': {
    methods: ["PUT"]
    pattern: '/parametres/notifications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['updatePreferences']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['updatePreferences']>>>
    }
  }
  'mam.settings.edit': {
    methods: ["GET","HEAD"]
    pattern: '/parametres/mam'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mam_settings_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mam_settings_controller').default['edit']>>>
    }
  }
  'mam.settings.update': {
    methods: ["PUT"]
    pattern: '/parametres/mam'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mam_settings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mam_settings_controller').default['update']>>>
    }
  }
  'mam.logo.upload': {
    methods: ["POST"]
    pattern: '/parametres/mam/logo'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mam_settings_controller').default['uploadLogo']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mam_settings_controller').default['uploadLogo']>>>
    }
  }
  'session.destroy': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
    }
  }
}
