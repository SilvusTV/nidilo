import sanitizeHtml from 'sanitize-html'

export const cleanRichText = (value: unknown, maxLength = 20_000) =>
  sanitizeHtml(String(value ?? '').slice(0, maxLength), {
    allowedTags: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'h2',
      'h3',
      'blockquote',
      'ul',
      'ol',
      'li',
      'a',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
