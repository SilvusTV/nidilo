import vine from '@vinejs/vine'

const email = () => vine.string().email().maxLength(254)

/**
 * Validator to use when logging in an existing user
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})
