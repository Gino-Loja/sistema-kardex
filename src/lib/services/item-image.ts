import { createMinioClient, ensureBucket, buildObjectUrl } from "@/lib/storage/minio"

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

const sanitizeFileName = (name: string) =>
  name.trim().replace(/[^a-zA-Z0-9._-]/g, "-")

const getObjectKeyFromUrl = (url: string, bucket: string) => {
  const cleanUrl = url.split("?")[0] ?? url
  const marker = `/${bucket}/`
  const index = cleanUrl.indexOf(marker)

  if (index === -1) {
    return null
  }

  return cleanUrl.slice(index + marker.length)
}

const getPresignedObjectUrl = (
  client: ReturnType<typeof createMinioClient>["client"],
  bucket: string,
  key: string,
) => client.presignedGetObject(bucket, key, 10 * 60)

export const validateItemImage = (file: File) => {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("ITEM_IMAGE_TYPE_INVALID")
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("ITEM_IMAGE_TOO_LARGE")
  }
}

export const uploadItemImage = async (input: { itemId: string; file: File }) => {
  validateItemImage(input.file)

  const { client, bucket } = createMinioClient()
  await ensureBucket(client, bucket)

  const safeName = sanitizeFileName(input.file.name || "item-image")
  const key = `${input.itemId}/${Date.now()}-${safeName}`
  const buffer = Buffer.from(await input.file.arrayBuffer())

  await client.putObject(bucket, key, buffer, buffer.length, {
    "Content-Type": input.file.type || "application/octet-stream",
  })

  return {
    bucket,
    key,
    url: buildObjectUrl({ bucket, key }),
  }
}

export const resolveItemImageUrl = async (imageUrl?: string | null) => {
  if (!imageUrl) {
    return null
  }

  let client: ReturnType<typeof createMinioClient>["client"]
  let bucket: string

  try {
    const minio = createMinioClient()
    client = minio.client
    bucket = minio.bucket
  } catch {
    return imageUrl
  }

  const key = getObjectKeyFromUrl(imageUrl, bucket)

  if (!key) {
    return imageUrl
  }

  try {
    return await getPresignedObjectUrl(client, bucket, key)
  } catch {
    return imageUrl
  }
}

export const deleteItemImageByUrl = async (imageUrl: string) => {
  const { client, bucket } = createMinioClient()
  const key = getObjectKeyFromUrl(imageUrl, bucket)

  if (!key) {
    return
  }

  await client.removeObject(bucket, key)
}
