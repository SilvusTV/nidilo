import env from '#start/env'

export const features = {
  healthData: env.get('HEALTH_DATA_ENABLED', false),
  mfaRequiredForAdmins: env.get('MFA_REQUIRED_FOR_ADMINS', false),
}
