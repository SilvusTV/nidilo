const PRIVATE_PROPERTY =
  /(?:email|e-mail|name|nom|prenom|first_name|last_name|phone|telephone|address|adresse|password|mot_de_passe|token|captcha|child|enfant|note|comment|detail|content|message|allerg|health|sante|birth|naissance|user|workspace|mam|role)/i
const URL_PROPERTY = /(?:url|uri|href|referrer|pathname|path)$/i

export function sanitizeAnalyticsProperties(
  input: Record<string, unknown>,
  sanitizeUrl: (value: string) => string
): Record<string, unknown> {
  const properties = { ...input }

  for (const [key, value] of Object.entries(properties)) {
    // This is PostHog's public project key, not a user secret. The SDK requires
    // it for ingestion and drops the entire event if before_send removes it.
    if (key === 'token') continue
    if (PRIVATE_PROPERTY.test(key)) {
      delete properties[key]
    } else if (typeof value === 'string' && URL_PROPERTY.test(key)) {
      properties[key] = sanitizeUrl(value)
    }
  }

  return properties
}
