/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'contact.store': {
    methods: ["POST"],
    pattern: '/contact',
    tokens: [{"old":"/contact","type":0,"val":"contact","end":""}],
    types: placeholder as Registry['contact.store']['types'],
  },
  'webhooks.brevo': {
    methods: ["POST"],
    pattern: '/webhooks/brevo',
    tokens: [{"old":"/webhooks/brevo","type":0,"val":"webhooks","end":""},{"old":"/webhooks/brevo","type":0,"val":"brevo","end":""}],
    types: placeholder as Registry['webhooks.brevo']['types'],
  },
  'invitations.show': {
    methods: ["GET","HEAD"],
    pattern: '/invitations/:token',
    tokens: [{"old":"/invitations/:token","type":0,"val":"invitations","end":""},{"old":"/invitations/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['invitations.show']['types'],
  },
  'invitations.accept': {
    methods: ["POST"],
    pattern: '/invitations/:token',
    tokens: [{"old":"/invitations/:token","type":0,"val":"invitations","end":""},{"old":"/invitations/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['invitations.accept']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'password.request': {
    methods: ["GET","HEAD"],
    pattern: '/mot-de-passe-oublie',
    tokens: [{"old":"/mot-de-passe-oublie","type":0,"val":"mot-de-passe-oublie","end":""}],
    types: placeholder as Registry['password.request']['types'],
  },
  'password.email': {
    methods: ["POST"],
    pattern: '/mot-de-passe-oublie',
    tokens: [{"old":"/mot-de-passe-oublie","type":0,"val":"mot-de-passe-oublie","end":""}],
    types: placeholder as Registry['password.email']['types'],
  },
  'password.reset': {
    methods: ["GET","HEAD"],
    pattern: '/reinitialiser-mot-de-passe/:token',
    tokens: [{"old":"/reinitialiser-mot-de-passe/:token","type":0,"val":"reinitialiser-mot-de-passe","end":""},{"old":"/reinitialiser-mot-de-passe/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['password.reset']['types'],
  },
  'password.update': {
    methods: ["POST"],
    pattern: '/reinitialiser-mot-de-passe/:token',
    tokens: [{"old":"/reinitialiser-mot-de-passe/:token","type":0,"val":"reinitialiser-mot-de-passe","end":""},{"old":"/reinitialiser-mot-de-passe/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['password.update']['types'],
  },
  'mfa.challenge': {
    methods: ["GET","HEAD"],
    pattern: '/mfa',
    tokens: [{"old":"/mfa","type":0,"val":"mfa","end":""}],
    types: placeholder as Registry['mfa.challenge']['types'],
  },
  'mfa.verify': {
    methods: ["POST"],
    pattern: '/mfa',
    tokens: [{"old":"/mfa","type":0,"val":"mfa","end":""}],
    types: placeholder as Registry['mfa.verify']['types'],
  },
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [{"old":"/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard']['types'],
  },
  'security.index': {
    methods: ["GET","HEAD"],
    pattern: '/parametres/securite',
    tokens: [{"old":"/parametres/securite","type":0,"val":"parametres","end":""},{"old":"/parametres/securite","type":0,"val":"securite","end":""}],
    types: placeholder as Registry['security.index']['types'],
  },
  'security.sessions.revoke': {
    methods: ["POST"],
    pattern: '/parametres/securite/revoquer-sessions',
    tokens: [{"old":"/parametres/securite/revoquer-sessions","type":0,"val":"parametres","end":""},{"old":"/parametres/securite/revoquer-sessions","type":0,"val":"securite","end":""},{"old":"/parametres/securite/revoquer-sessions","type":0,"val":"revoquer-sessions","end":""}],
    types: placeholder as Registry['security.sessions.revoke']['types'],
  },
  'mfa.setup': {
    methods: ["GET","HEAD"],
    pattern: '/securite/mfa/configurer',
    tokens: [{"old":"/securite/mfa/configurer","type":0,"val":"securite","end":""},{"old":"/securite/mfa/configurer","type":0,"val":"mfa","end":""},{"old":"/securite/mfa/configurer","type":0,"val":"configurer","end":""}],
    types: placeholder as Registry['mfa.setup']['types'],
  },
  'mfa.confirm': {
    methods: ["POST"],
    pattern: '/securite/mfa/configurer',
    tokens: [{"old":"/securite/mfa/configurer","type":0,"val":"securite","end":""},{"old":"/securite/mfa/configurer","type":0,"val":"mfa","end":""},{"old":"/securite/mfa/configurer","type":0,"val":"configurer","end":""}],
    types: placeholder as Registry['mfa.confirm']['types'],
  },
  'super.mams.index': {
    methods: ["GET","HEAD"],
    pattern: '/super-admin/mams',
    tokens: [{"old":"/super-admin/mams","type":0,"val":"super-admin","end":""},{"old":"/super-admin/mams","type":0,"val":"mams","end":""}],
    types: placeholder as Registry['super.mams.index']['types'],
  },
  'super.mams.store': {
    methods: ["POST"],
    pattern: '/super-admin/mams',
    tokens: [{"old":"/super-admin/mams","type":0,"val":"super-admin","end":""},{"old":"/super-admin/mams","type":0,"val":"mams","end":""}],
    types: placeholder as Registry['super.mams.store']['types'],
  },
  'super.mams.update': {
    methods: ["PATCH"],
    pattern: '/super-admin/mams/:id',
    tokens: [{"old":"/super-admin/mams/:id","type":0,"val":"super-admin","end":""},{"old":"/super-admin/mams/:id","type":0,"val":"mams","end":""},{"old":"/super-admin/mams/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['super.mams.update']['types'],
  },
  'mam.logo': {
    methods: ["GET","HEAD"],
    pattern: '/media/logo-mam',
    tokens: [{"old":"/media/logo-mam","type":0,"val":"media","end":""},{"old":"/media/logo-mam","type":0,"val":"logo-mam","end":""}],
    types: placeholder as Registry['mam.logo']['types'],
  },
  'staff.index': {
    methods: ["GET","HEAD"],
    pattern: '/personnel',
    tokens: [{"old":"/personnel","type":0,"val":"personnel","end":""}],
    types: placeholder as Registry['staff.index']['types'],
  },
  'staff.invite': {
    methods: ["POST"],
    pattern: '/personnel/invitations',
    tokens: [{"old":"/personnel/invitations","type":0,"val":"personnel","end":""},{"old":"/personnel/invitations","type":0,"val":"invitations","end":""}],
    types: placeholder as Registry['staff.invite']['types'],
  },
  'staff.update': {
    methods: ["PATCH"],
    pattern: '/personnel/:id',
    tokens: [{"old":"/personnel/:id","type":0,"val":"personnel","end":""},{"old":"/personnel/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['staff.update']['types'],
  },
  'quick.index': {
    methods: ["GET","HEAD"],
    pattern: '/saisie-rapide',
    tokens: [{"old":"/saisie-rapide","type":0,"val":"saisie-rapide","end":""}],
    types: placeholder as Registry['quick.index']['types'],
  },
  'quick.store': {
    methods: ["POST"],
    pattern: '/saisie-rapide',
    tokens: [{"old":"/saisie-rapide","type":0,"val":"saisie-rapide","end":""}],
    types: placeholder as Registry['quick.store']['types'],
  },
  'children.create': {
    methods: ["GET","HEAD"],
    pattern: '/enfants/nouveau',
    tokens: [{"old":"/enfants/nouveau","type":0,"val":"enfants","end":""},{"old":"/enfants/nouveau","type":0,"val":"nouveau","end":""}],
    types: placeholder as Registry['children.create']['types'],
  },
  'children.store': {
    methods: ["POST"],
    pattern: '/enfants',
    tokens: [{"old":"/enfants","type":0,"val":"enfants","end":""}],
    types: placeholder as Registry['children.store']['types'],
  },
  'reports.show': {
    methods: ["GET","HEAD"],
    pattern: '/enfants/:id/fiche',
    tokens: [{"old":"/enfants/:id/fiche","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/fiche","type":1,"val":"id","end":""},{"old":"/enfants/:id/fiche","type":0,"val":"fiche","end":""}],
    types: placeholder as Registry['reports.show']['types'],
  },
  'reports.published': {
    methods: ["GET","HEAD"],
    pattern: '/enfants/:id/fiche/:date',
    tokens: [{"old":"/enfants/:id/fiche/:date","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/fiche/:date","type":1,"val":"id","end":""},{"old":"/enfants/:id/fiche/:date","type":0,"val":"fiche","end":""},{"old":"/enfants/:id/fiche/:date","type":1,"val":"date","end":""}],
    types: placeholder as Registry['reports.published']['types'],
  },
  'reports.calendar': {
    methods: ["GET","HEAD"],
    pattern: '/enfants/:id/calendrier',
    tokens: [{"old":"/enfants/:id/calendrier","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/calendrier","type":1,"val":"id","end":""},{"old":"/enfants/:id/calendrier","type":0,"val":"calendrier","end":""}],
    types: placeholder as Registry['reports.calendar']['types'],
  },
  'reports.update': {
    methods: ["PUT"],
    pattern: '/enfants/:id/fiche',
    tokens: [{"old":"/enfants/:id/fiche","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/fiche","type":1,"val":"id","end":""},{"old":"/enfants/:id/fiche","type":0,"val":"fiche","end":""}],
    types: placeholder as Registry['reports.update']['types'],
  },
  'children.index': {
    methods: ["GET","HEAD"],
    pattern: '/enfants',
    tokens: [{"old":"/enfants","type":0,"val":"enfants","end":""}],
    types: placeholder as Registry['children.index']['types'],
  },
  'children.profile': {
    methods: ["GET","HEAD"],
    pattern: '/enfants/:id/dossier',
    tokens: [{"old":"/enfants/:id/dossier","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/dossier","type":1,"val":"id","end":""},{"old":"/enfants/:id/dossier","type":0,"val":"dossier","end":""}],
    types: placeholder as Registry['children.profile']['types'],
  },
  'children.profile.update': {
    methods: ["PUT"],
    pattern: '/enfants/:id/dossier',
    tokens: [{"old":"/enfants/:id/dossier","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/dossier","type":1,"val":"id","end":""},{"old":"/enfants/:id/dossier","type":0,"val":"dossier","end":""}],
    types: placeholder as Registry['children.profile.update']['types'],
  },
  'children.health.store': {
    methods: ["POST"],
    pattern: '/enfants/:id/sante',
    tokens: [{"old":"/enfants/:id/sante","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/sante","type":1,"val":"id","end":""},{"old":"/enfants/:id/sante","type":0,"val":"sante","end":""}],
    types: placeholder as Registry['children.health.store']['types'],
  },
  'children.contacts.store': {
    methods: ["POST"],
    pattern: '/enfants/:id/contacts',
    tokens: [{"old":"/enfants/:id/contacts","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/contacts","type":1,"val":"id","end":""},{"old":"/enfants/:id/contacts","type":0,"val":"contacts","end":""}],
    types: placeholder as Registry['children.contacts.store']['types'],
  },
  'children.contacts.destroy': {
    methods: ["DELETE"],
    pattern: '/enfants/:id/contacts/:contactId',
    tokens: [{"old":"/enfants/:id/contacts/:contactId","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/contacts/:contactId","type":1,"val":"id","end":""},{"old":"/enfants/:id/contacts/:contactId","type":0,"val":"contacts","end":""},{"old":"/enfants/:id/contacts/:contactId","type":1,"val":"contactId","end":""}],
    types: placeholder as Registry['children.contacts.destroy']['types'],
  },
  'children.authorizations.update': {
    methods: ["PUT"],
    pattern: '/enfants/:id/autorisations/:kind',
    tokens: [{"old":"/enfants/:id/autorisations/:kind","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/autorisations/:kind","type":1,"val":"id","end":""},{"old":"/enfants/:id/autorisations/:kind","type":0,"val":"autorisations","end":""},{"old":"/enfants/:id/autorisations/:kind","type":1,"val":"kind","end":""}],
    types: placeholder as Registry['children.authorizations.update']['types'],
  },
  'children.archive': {
    methods: ["POST"],
    pattern: '/enfants/:id/archiver',
    tokens: [{"old":"/enfants/:id/archiver","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/archiver","type":1,"val":"id","end":""},{"old":"/enfants/:id/archiver","type":0,"val":"archiver","end":""}],
    types: placeholder as Registry['children.archive']['types'],
  },
  'children.restore': {
    methods: ["POST"],
    pattern: '/enfants/:id/restaurer',
    tokens: [{"old":"/enfants/:id/restaurer","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/restaurer","type":1,"val":"id","end":""},{"old":"/enfants/:id/restaurer","type":0,"val":"restaurer","end":""}],
    types: placeholder as Registry['children.restore']['types'],
  },
  'guardians.index': {
    methods: ["GET","HEAD"],
    pattern: '/enfants/:id/responsables',
    tokens: [{"old":"/enfants/:id/responsables","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/responsables","type":1,"val":"id","end":""},{"old":"/enfants/:id/responsables","type":0,"val":"responsables","end":""}],
    types: placeholder as Registry['guardians.index']['types'],
  },
  'invitations.store': {
    methods: ["POST"],
    pattern: '/enfants/:id/responsables/invitations',
    tokens: [{"old":"/enfants/:id/responsables/invitations","type":0,"val":"enfants","end":""},{"old":"/enfants/:id/responsables/invitations","type":1,"val":"id","end":""},{"old":"/enfants/:id/responsables/invitations","type":0,"val":"responsables","end":""},{"old":"/enfants/:id/responsables/invitations","type":0,"val":"invitations","end":""}],
    types: placeholder as Registry['invitations.store']['types'],
  },
  'notifications.index': {
    methods: ["GET","HEAD"],
    pattern: '/notifications',
    tokens: [{"old":"/notifications","type":0,"val":"notifications","end":""}],
    types: placeholder as Registry['notifications.index']['types'],
  },
  'notifications.read': {
    methods: ["PATCH"],
    pattern: '/notifications/:id/lire',
    tokens: [{"old":"/notifications/:id/lire","type":0,"val":"notifications","end":""},{"old":"/notifications/:id/lire","type":1,"val":"id","end":""},{"old":"/notifications/:id/lire","type":0,"val":"lire","end":""}],
    types: placeholder as Registry['notifications.read']['types'],
  },
  'notifications.preferences': {
    methods: ["GET","HEAD"],
    pattern: '/parametres/notifications',
    tokens: [{"old":"/parametres/notifications","type":0,"val":"parametres","end":""},{"old":"/parametres/notifications","type":0,"val":"notifications","end":""}],
    types: placeholder as Registry['notifications.preferences']['types'],
  },
  'notifications.preferences.update': {
    methods: ["PUT"],
    pattern: '/parametres/notifications',
    tokens: [{"old":"/parametres/notifications","type":0,"val":"parametres","end":""},{"old":"/parametres/notifications","type":0,"val":"notifications","end":""}],
    types: placeholder as Registry['notifications.preferences.update']['types'],
  },
  'mam.settings.edit': {
    methods: ["GET","HEAD"],
    pattern: '/parametres/mam',
    tokens: [{"old":"/parametres/mam","type":0,"val":"parametres","end":""},{"old":"/parametres/mam","type":0,"val":"mam","end":""}],
    types: placeholder as Registry['mam.settings.edit']['types'],
  },
  'mam.settings.update': {
    methods: ["PUT"],
    pattern: '/parametres/mam',
    tokens: [{"old":"/parametres/mam","type":0,"val":"parametres","end":""},{"old":"/parametres/mam","type":0,"val":"mam","end":""}],
    types: placeholder as Registry['mam.settings.update']['types'],
  },
  'mam.logo.upload': {
    methods: ["POST"],
    pattern: '/parametres/mam/logo',
    tokens: [{"old":"/parametres/mam/logo","type":0,"val":"parametres","end":""},{"old":"/parametres/mam/logo","type":0,"val":"mam","end":""},{"old":"/parametres/mam/logo","type":0,"val":"logo","end":""}],
    types: placeholder as Registry['mam.logo.upload']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
