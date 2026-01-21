import { Client } from "minio"

type MinioConfig = {
  endPoint: string
  port: number
  useSSL: boolean
  accessKey: string
  secretKey: string
  bucket: string
}

const ITEMS_BUCKET = "items"

export const getMinioConfig = (): MinioConfig => {
  const endPoint = process.env.MINIO_ENDPOINT
  const accessKey = process.env.MINIO_ACCESS_KEY
  const secretKey = process.env.MINIO_SECRET_KEY

  if (!endPoint || !accessKey || !secretKey) {
    throw new Error("MINIO_CONFIG_MISSING")
  }

  return {
    endPoint,
    port: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : 9000,
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey,
    secretKey,
    bucket: process.env.MINIO_ITEMS_BUCKET ?? ITEMS_BUCKET,
  }
}

export const createMinioClient = () => {
  const config = getMinioConfig()

  return {
    client: new Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    }),
    bucket: config.bucket,
    config,
  }
}

export const ensureBucket = async (client: Client, bucket: string) => {
  const exists = await client.bucketExists(bucket)

  if (!exists) {
    await client.makeBucket(bucket)
  }
}

export const buildObjectUrl = (input: { bucket: string; key: string }) => {
  const config = getMinioConfig()
  const protocol = config.useSSL ? "https" : "http"
  const host = `${config.endPoint}:${config.port}`

  return `${protocol}://${host}/${input.bucket}/${input.key}`
}
