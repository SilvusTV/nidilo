import { Client } from 'minio'
import sharp from 'sharp'
import env from '#start/env'

const MAX_IMAGE_BYTES = 12 * 1024 * 1024

export class ImageStorageService {
  private client = new Client({
    endPoint: new URL(env.get('S3_ENDPOINT', 'http://localhost:9000')).hostname,
    port: Number(new URL(env.get('S3_ENDPOINT', 'http://localhost:9000')).port || 443),
    useSSL: new URL(env.get('S3_ENDPOINT', 'http://localhost:9000')).protocol === 'https:',
    accessKey: env.get('S3_ACCESS_KEY', ''),
    secretKey: env.get('S3_SECRET_KEY', ''),
    region: env.get('S3_REGION', 'eu-west-3'),
  })

  private async ensureBucket() {
    const bucket = env.get('S3_BUCKET', 'mam-media')
    if (!(await this.client.bucketExists(bucket)))
      await this.client.makeBucket(bucket, env.get('S3_REGION', 'eu-west-3'))
    return bucket
  }

  async store(input: Buffer, mamId: string, childId: string, originalName: string) {
    if (input.byteLength > MAX_IMAGE_BYTES)
      throw new Error('Image trop volumineuse (12 Mo maximum).')
    const image = sharp(input, { failOn: 'warning', limitInputPixels: 40_000_000 }).rotate()
    const metadata = await image.metadata()
    if (!metadata.format) throw new Error('Format d’image non reconnu.')
    const output = await image
      .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer()
    const key = `mams/${mamId}/children/${childId}/${crypto.randomUUID()}.webp`
    const bucket = await this.ensureBucket()
    await this.client.putObject(bucket, key, output, output.byteLength, {
      'Content-Type': 'image/webp',
      'Cache-Control': 'private, max-age=31536000, immutable',
      'X-Amz-Meta-Original-Name': encodeURIComponent(originalName.slice(0, 180)),
    })
    return { key, sizeBytes: output.byteLength, width: metadata.width, height: metadata.height }
  }

  async storeLogo(input: Buffer, mamId: string, originalName: string) {
    if (input.byteLength > 8 * 1024 * 1024) throw new Error('Logo trop volumineux (8 Mo maximum).')
    const output = await sharp(input, { failOn: 'warning', limitInputPixels: 20_000_000 })
      .rotate()
      .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88, effort: 4 })
      .toBuffer()
    const key = `mams/${mamId}/branding/${crypto.randomUUID()}.webp`
    const bucket = await this.ensureBucket()
    await this.client.putObject(bucket, key, output, output.byteLength, {
      'Content-Type': 'image/webp',
      'Cache-Control': 'private, max-age=3600',
      'X-Amz-Meta-Original-Name': encodeURIComponent(originalName.slice(0, 180)),
    })
    return { key, sizeBytes: output.byteLength }
  }

  async getObject(key: string) {
    return this.client.getObject(env.get('S3_BUCKET', 'mam-media'), key)
  }

  async deleteObject(key: string) {
    await this.client.removeObject(env.get('S3_BUCKET', 'mam-media'), key)
  }

  async deleteChildMedia(mamId: string, childId: string) {
    const bucket = env.get('S3_BUCKET', 'mam-media')
    const keys: string[] = []
    for await (const item of this.client.listObjectsV2(
      bucket,
      `mams/${mamId}/children/${childId}/`,
      true
    )) {
      if (item.name) keys.push(item.name)
      if (keys.length === 1_000) {
        await this.client.removeObjects(bucket, keys.splice(0))
      }
    }
    if (keys.length) await this.client.removeObjects(bucket, keys)
  }
}
