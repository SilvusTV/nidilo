import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auth/forgot_password': ExtractProps<(typeof import('../../inertia/pages/auth/forgot_password.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/mfa_challenge': ExtractProps<(typeof import('../../inertia/pages/auth/mfa_challenge.tsx'))['default']>
    'auth/mfa_setup': ExtractProps<(typeof import('../../inertia/pages/auth/mfa_setup.tsx'))['default']>
    'auth/reset_password': ExtractProps<(typeof import('../../inertia/pages/auth/reset_password.tsx'))['default']>
    'children/create': ExtractProps<(typeof import('../../inertia/pages/children/create.tsx'))['default']>
    'children/index': ExtractProps<(typeof import('../../inertia/pages/children/index.tsx'))['default']>
    'children/profile': ExtractProps<(typeof import('../../inertia/pages/children/profile.tsx'))['default']>
    'dashboard': ExtractProps<(typeof import('../../inertia/pages/dashboard.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'guardians/index': ExtractProps<(typeof import('../../inertia/pages/guardians/index.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'invitations/accept': ExtractProps<(typeof import('../../inertia/pages/invitations/accept.tsx'))['default']>
    'legal/index': ExtractProps<(typeof import('../../inertia/pages/legal/index.tsx'))['default']>
    'notifications/index': ExtractProps<(typeof import('../../inertia/pages/notifications/index.tsx'))['default']>
    'parents/calendar': ExtractProps<(typeof import('../../inertia/pages/parents/calendar.tsx'))['default']>
    'parents/dashboard': ExtractProps<(typeof import('../../inertia/pages/parents/dashboard.tsx'))['default']>
    'quick-entry/index': ExtractProps<(typeof import('../../inertia/pages/quick-entry/index.tsx'))['default']>
    'reports/edit': ExtractProps<(typeof import('../../inertia/pages/reports/edit.tsx'))['default']>
    'settings/mam': ExtractProps<(typeof import('../../inertia/pages/settings/mam.tsx'))['default']>
    'settings/notifications': ExtractProps<(typeof import('../../inertia/pages/settings/notifications.tsx'))['default']>
    'settings/security': ExtractProps<(typeof import('../../inertia/pages/settings/security.tsx'))['default']>
    'staff/index': ExtractProps<(typeof import('../../inertia/pages/staff/index.tsx'))['default']>
    'super-admin/mams': ExtractProps<(typeof import('../../inertia/pages/super-admin/mams.tsx'))['default']>
  }
}
