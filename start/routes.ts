import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const SessionController = () => import('#controllers/session_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const DailyReportsController = () => import('#controllers/daily_reports_controller')
const NotificationsController = () => import('#controllers/notifications_controller')
const InvitationsController = () => import('#controllers/invitations_controller')
const ChildrenController = () => import('#controllers/children_controller')
const MamSettingsController = () => import('#controllers/mam_settings_controller')
const InvitationAcceptancesController = () =>
  import('#controllers/invitation_acceptances_controller')
const ChildProfilesController = () => import('#controllers/child_profiles_controller')
const QuickEntriesController = () => import('#controllers/quick_entries_controller')
const StaffController = () => import('#controllers/staff_controller')
const MamMediaController = () => import('#controllers/mam_media_controller')
const SuperAdminMamsController = () => import('#controllers/super_admin_mams_controller')
const ReportsHistoryController = () => import('#controllers/reports_history_controller')
const ContactRequestsController = () => import('#controllers/contact_requests_controller')
const BrevoWebhooksController = () => import('#controllers/brevo_webhooks_controller')
const PasswordResetsController = () => import('#controllers/password_resets_controller')
const MfaController = () => import('#controllers/mfa_controller')
const SecuritySettingsController = () => import('#controllers/security_settings_controller')
const LegalController = () => import('#controllers/legal_controller')

router.get('/', async ({ inertia }) => inertia.render('home', {})).as('home')
router
  .get('/:page', [LegalController, 'show'])
  .where('page', /^(mentions-legales|confidentialite|cgu|sous-traitants)$/)
  .as('legal.show')
router.post('/contact', [ContactRequestsController, 'store']).as('contact.store')
router.post('/webhooks/brevo', [BrevoWebhooksController, 'handle']).as('webhooks.brevo')
router.get('/invitations/:token', [InvitationAcceptancesController, 'show']).as('invitations.show')
router
  .post('/invitations/:token', [InvitationAcceptancesController, 'store'])
  .as('invitations.accept')

router
  .group(() => {
    router.get('/login', [SessionController, 'create']).as('session.create')
    router.post('/login', [SessionController, 'store']).as('session.store')
    router
      .get('/mot-de-passe-oublie', [PasswordResetsController, 'requestForm'])
      .as('password.request')
    router
      .post('/mot-de-passe-oublie', [PasswordResetsController, 'requestLink'])
      .as('password.email')
    router
      .get('/reinitialiser-mot-de-passe/:token', [PasswordResetsController, 'resetForm'])
      .as('password.reset')
    router
      .post('/reinitialiser-mot-de-passe/:token', [PasswordResetsController, 'reset'])
      .as('password.update')
  })
  .use(middleware.guest())

router.get('/mfa', [MfaController, 'challenge']).as('mfa.challenge')
router.post('/mfa', [MfaController, 'verify']).as('mfa.verify')

router
  .group(() => {
    router.get('/dashboard', [DashboardController, 'index']).as('dashboard')
    router.get('/parametres/securite', [SecuritySettingsController, 'index']).as('security.index')
    router
      .post('/parametres/securite/revoquer-sessions', [
        SecuritySettingsController,
        'revokeSessions',
      ])
      .as('security.sessions.revoke')
    router.get('/securite/mfa/configurer', [MfaController, 'setup']).as('mfa.setup')
    router.post('/securite/mfa/configurer', [MfaController, 'confirm']).as('mfa.confirm')
    router.get('/super-admin/mams', [SuperAdminMamsController, 'index']).as('super.mams.index')
    router.post('/super-admin/mams', [SuperAdminMamsController, 'store']).as('super.mams.store')
    router
      .patch('/super-admin/mams/:id', [SuperAdminMamsController, 'update'])
      .as('super.mams.update')
    router
      .post('/super-admin/invitations/:invitationId/resend', [
        SuperAdminMamsController,
        'resendInvitation',
      ])
      .as('super.mams.invitations.resend')
    router
      .delete('/super-admin/mams/:id', [SuperAdminMamsController, 'destroy'])
      .as('super.mams.destroy')
    router.get('/media/logo-mam', [MamMediaController, 'logo']).as('mam.logo')
    router.get('/personnel', [StaffController, 'index']).as('staff.index')
    router.post('/personnel/invitations', [StaffController, 'invite']).as('staff.invite')
    router.patch('/personnel/:id', [StaffController, 'update']).as('staff.update')
    router.get('/saisie-rapide', [QuickEntriesController, 'index']).as('quick.index')
    router.post('/saisie-rapide', [QuickEntriesController, 'store']).as('quick.store')
    router.get('/enfants/nouveau', [ChildrenController, 'create']).as('children.create')
    router.post('/enfants', [ChildrenController, 'store']).as('children.store')
    router.get('/enfants/:id/fiche', [DailyReportsController, 'show']).as('reports.show')
    router
      .get('/enfants/:id/fiche/:date', [DailyReportsController, 'showPublished'])
      .as('reports.published')
    router
      .get('/enfants/:id/calendrier', [ReportsHistoryController, 'index'])
      .as('reports.calendar')
    router.put('/enfants/:id/fiche', [DailyReportsController, 'update']).as('reports.update')
    router.get('/enfants', [ChildrenController, 'index']).as('children.index')
    router.get('/enfants/:id/dossier', [ChildProfilesController, 'show']).as('children.profile')
    router
      .put('/enfants/:id/dossier', [ChildProfilesController, 'update'])
      .as('children.profile.update')
    router
      .post('/enfants/:id/sante', [ChildProfilesController, 'addHealthEntry'])
      .as('children.health.store')
    router
      .post('/enfants/:id/contacts', [ChildProfilesController, 'addContact'])
      .as('children.contacts.store')
    router
      .delete('/enfants/:id/contacts/:contactId', [ChildProfilesController, 'deleteContact'])
      .as('children.contacts.destroy')
    router
      .put('/enfants/:id/autorisations/:kind', [ChildProfilesController, 'updateAuthorization'])
      .as('children.authorizations.update')
    router.post('/enfants/:id/archiver', [ChildrenController, 'archive']).as('children.archive')
    router.post('/enfants/:id/restaurer', [ChildrenController, 'restore']).as('children.restore')
    router.get('/enfants/:id/responsables', [InvitationsController, 'index']).as('guardians.index')
    router
      .post('/enfants/:id/responsables/invitations', [InvitationsController, 'store'])
      .as('invitations.store')
    router.get('/notifications', [NotificationsController, 'index']).as('notifications.index')
    router
      .patch('/notifications/:id/lire', [NotificationsController, 'read'])
      .as('notifications.read')
    router
      .get('/parametres/notifications', [NotificationsController, 'preferences'])
      .as('notifications.preferences')
    router
      .put('/parametres/notifications', [NotificationsController, 'updatePreferences'])
      .as('notifications.preferences.update')
    router.get('/parametres/mam', [MamSettingsController, 'edit']).as('mam.settings.edit')
    router.put('/parametres/mam', [MamSettingsController, 'update']).as('mam.settings.update')
    router.post('/parametres/mam/logo', [MamSettingsController, 'uploadLogo']).as('mam.logo.upload')
    router.post('/logout', [SessionController, 'destroy']).as('session.destroy')
  })
  .use(middleware.auth())
