/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  contact: {
    store: typeof routes['contact.store']
  }
  webhooks: {
    brevo: typeof routes['webhooks.brevo']
  }
  invitations: {
    show: typeof routes['invitations.show']
    accept: typeof routes['invitations.accept']
    store: typeof routes['invitations.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  password: {
    request: typeof routes['password.request']
    email: typeof routes['password.email']
    reset: typeof routes['password.reset']
    update: typeof routes['password.update']
  }
  mfa: {
    challenge: typeof routes['mfa.challenge']
    verify: typeof routes['mfa.verify']
    setup: typeof routes['mfa.setup']
    confirm: typeof routes['mfa.confirm']
  }
  dashboard: typeof routes['dashboard']
  security: {
    index: typeof routes['security.index']
    sessions: {
      revoke: typeof routes['security.sessions.revoke']
    }
  }
  super: {
    mams: {
      index: typeof routes['super.mams.index']
      store: typeof routes['super.mams.store']
      update: typeof routes['super.mams.update']
    }
  }
  mam: {
    logo: typeof routes['mam.logo'] & {
      upload: typeof routes['mam.logo.upload']
    }
    settings: {
      edit: typeof routes['mam.settings.edit']
      update: typeof routes['mam.settings.update']
    }
  }
  staff: {
    index: typeof routes['staff.index']
    invite: typeof routes['staff.invite']
    update: typeof routes['staff.update']
  }
  quick: {
    index: typeof routes['quick.index']
    store: typeof routes['quick.store']
  }
  children: {
    create: typeof routes['children.create']
    store: typeof routes['children.store']
    index: typeof routes['children.index']
    profile: typeof routes['children.profile'] & {
      update: typeof routes['children.profile.update']
    }
    health: {
      store: typeof routes['children.health.store']
    }
    contacts: {
      store: typeof routes['children.contacts.store']
      destroy: typeof routes['children.contacts.destroy']
    }
    authorizations: {
      update: typeof routes['children.authorizations.update']
    }
    archive: typeof routes['children.archive']
    restore: typeof routes['children.restore']
  }
  reports: {
    show: typeof routes['reports.show']
    published: typeof routes['reports.published']
    calendar: typeof routes['reports.calendar']
    update: typeof routes['reports.update']
  }
  guardians: {
    index: typeof routes['guardians.index']
  }
  notifications: {
    index: typeof routes['notifications.index']
    read: typeof routes['notifications.read']
    preferences: typeof routes['notifications.preferences'] & {
      update: typeof routes['notifications.preferences.update']
    }
  }
}
