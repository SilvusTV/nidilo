import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

const decodeBase32 = (value: string) => {
  let bits = ''
  for (const character of value.replace(/=+$/g, '').toUpperCase()) {
    const index = alphabet.indexOf(character)
    if (index < 0) throw new Error('Invalid Base32 secret')
    bits += index.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let index = 0; index + 8 <= bits.length; index += 8)
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2))
  return Buffer.from(bytes)
}

const encodeBase32 = (buffer: Buffer) => {
  let bits = [...buffer].map((byte) => byte.toString(2).padStart(8, '0')).join('')
  let output = ''
  while (bits.length) {
    output += alphabet[Number.parseInt(bits.slice(0, 5).padEnd(5, '0'), 2)]
    bits = bits.slice(5)
  }
  return output
}

export const createTotpSecret = () => encodeBase32(randomBytes(20))

export const createRecoveryCodes = () =>
  Array.from({ length: 8 }, () => randomBytes(5).toString('hex').toUpperCase())

export const hashRecoveryCode = (code: string) =>
  createHash('sha256').update(code.replace(/\s|-/g, '').toUpperCase()).digest('hex')

export const createTotpCode = (secret: string, timestamp = Date.now()) => {
  const counter = Math.floor(timestamp / 30_000)
  const data = Buffer.alloc(8)
  data.writeBigUInt64BE(BigInt(counter))
  const digest = createHmac('sha1', decodeBase32(secret)).update(data).digest()
  const offset = digest[digest.length - 1] & 0xf
  const number = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000
  return number.toString().padStart(6, '0')
}

export const verifyTotp = (secret: string, input: string, now = Date.now()) => {
  const normalized = input.replace(/\s/g, '')
  if (!/^\d{6}$/.test(normalized)) return false
  return [-1, 0, 1].some((offset) => {
    const expected = Buffer.from(createTotpCode(secret, now + offset * 30_000))
    const received = Buffer.from(normalized)
    return expected.length === received.length && timingSafeEqual(expected, received)
  })
}
