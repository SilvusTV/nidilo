// PostHog project tokens are public browser identifiers, not secret API keys.
// Keep a working project default when the server has not been configured yet.
export const DEFAULT_POSTHOG_PROJECT_KEY = 'phc_sWWpAfhVCaa8U6mNbnhpVuaHBNWVjehKcHcYkU884WXu'

export function resolvePosthogProjectKey(configuredKey?: string): string {
  return configuredKey?.trim() || DEFAULT_POSTHOG_PROJECT_KEY
}
