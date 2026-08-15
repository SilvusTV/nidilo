import vine from '@vinejs/vine'

export const contactValidator = vine.create({
  fullName: vine.string().trim().minLength(2).maxLength(120),
  email: vine.string().trim().toLowerCase().email().maxLength(254),
  phone: vine.string().trim().maxLength(30).optional(),
  organization: vine.string().trim().maxLength(160).optional(),
  role: vine.enum(['mam', 'assistant', 'parent', 'partner', 'other'] as const),
  message: vine.string().trim().minLength(10).maxLength(3_000),
  consent: vine.accepted(),
  website: vine.string().trim().maxLength(250).optional(),
})
