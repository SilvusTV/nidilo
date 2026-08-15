import env from '#start/env'

export const features = {
  healthData: env.get('HEALTH_DATA_ENABLED', false),
}
