import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'contact.store': { paramsTuple?: []; params?: {} }
    'webhooks.brevo': { paramsTuple?: []; params?: {} }
    'invitations.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'invitations.accept': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'password.request': { paramsTuple?: []; params?: {} }
    'password.email': { paramsTuple?: []; params?: {} }
    'password.reset': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'password.update': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'mfa.challenge': { paramsTuple?: []; params?: {} }
    'mfa.verify': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'security.index': { paramsTuple?: []; params?: {} }
    'security.sessions.revoke': { paramsTuple?: []; params?: {} }
    'mfa.setup': { paramsTuple?: []; params?: {} }
    'mfa.confirm': { paramsTuple?: []; params?: {} }
    'super.mams.index': { paramsTuple?: []; params?: {} }
    'super.mams.store': { paramsTuple?: []; params?: {} }
    'super.mams.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mam.logo': { paramsTuple?: []; params?: {} }
    'staff.index': { paramsTuple?: []; params?: {} }
    'staff.invite': { paramsTuple?: []; params?: {} }
    'staff.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quick.index': { paramsTuple?: []; params?: {} }
    'quick.store': { paramsTuple?: []; params?: {} }
    'children.create': { paramsTuple?: []; params?: {} }
    'children.store': { paramsTuple?: []; params?: {} }
    'reports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.published': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'date': ParamValue} }
    'reports.calendar': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'children.index': { paramsTuple?: []; params?: {} }
    'children.profile': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'children.profile.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'children.health.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'children.contacts.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'children.contacts.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'contactId': ParamValue} }
    'children.authorizations.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'kind': ParamValue} }
    'children.archive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'children.restore': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'guardians.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invitations.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'notifications.read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.preferences': { paramsTuple?: []; params?: {} }
    'notifications.preferences.update': { paramsTuple?: []; params?: {} }
    'mam.settings.edit': { paramsTuple?: []; params?: {} }
    'mam.settings.update': { paramsTuple?: []; params?: {} }
    'mam.logo.upload': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'invitations.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'session.create': { paramsTuple?: []; params?: {} }
    'password.request': { paramsTuple?: []; params?: {} }
    'password.reset': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'mfa.challenge': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'security.index': { paramsTuple?: []; params?: {} }
    'mfa.setup': { paramsTuple?: []; params?: {} }
    'super.mams.index': { paramsTuple?: []; params?: {} }
    'mam.logo': { paramsTuple?: []; params?: {} }
    'staff.index': { paramsTuple?: []; params?: {} }
    'quick.index': { paramsTuple?: []; params?: {} }
    'children.create': { paramsTuple?: []; params?: {} }
    'reports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.published': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'date': ParamValue} }
    'reports.calendar': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'children.index': { paramsTuple?: []; params?: {} }
    'children.profile': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'guardians.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'notifications.preferences': { paramsTuple?: []; params?: {} }
    'mam.settings.edit': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'invitations.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'session.create': { paramsTuple?: []; params?: {} }
    'password.request': { paramsTuple?: []; params?: {} }
    'password.reset': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'mfa.challenge': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'security.index': { paramsTuple?: []; params?: {} }
    'mfa.setup': { paramsTuple?: []; params?: {} }
    'super.mams.index': { paramsTuple?: []; params?: {} }
    'mam.logo': { paramsTuple?: []; params?: {} }
    'staff.index': { paramsTuple?: []; params?: {} }
    'quick.index': { paramsTuple?: []; params?: {} }
    'children.create': { paramsTuple?: []; params?: {} }
    'reports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.published': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'date': ParamValue} }
    'reports.calendar': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'children.index': { paramsTuple?: []; params?: {} }
    'children.profile': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'guardians.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'notifications.preferences': { paramsTuple?: []; params?: {} }
    'mam.settings.edit': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'contact.store': { paramsTuple?: []; params?: {} }
    'webhooks.brevo': { paramsTuple?: []; params?: {} }
    'invitations.accept': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'session.store': { paramsTuple?: []; params?: {} }
    'password.email': { paramsTuple?: []; params?: {} }
    'password.update': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'mfa.verify': { paramsTuple?: []; params?: {} }
    'security.sessions.revoke': { paramsTuple?: []; params?: {} }
    'mfa.confirm': { paramsTuple?: []; params?: {} }
    'super.mams.store': { paramsTuple?: []; params?: {} }
    'staff.invite': { paramsTuple?: []; params?: {} }
    'quick.store': { paramsTuple?: []; params?: {} }
    'children.store': { paramsTuple?: []; params?: {} }
    'children.health.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'children.contacts.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'children.archive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'children.restore': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invitations.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mam.logo.upload': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'super.mams.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'staff.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'reports.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'children.profile.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'children.authorizations.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'kind': ParamValue} }
    'notifications.preferences.update': { paramsTuple?: []; params?: {} }
    'mam.settings.update': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'children.contacts.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'contactId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}