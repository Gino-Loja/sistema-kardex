"use server";

import { Client } from "minio";

const getMinioConfig = () => {
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const bucket = process.env.MINIO_BUCKET ?? "kardex-items";

  if (!endpoint || !accessKey || !secretKey) {
    throw new Error("MINIO_CONFIG_MISSING");
  }

  return {
    endPoint: endpoint,
    port: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : 9000,
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey,
    secretKey,
    bucket,
  };
};

const createMinioClient = () => {
  const config = getMinioConfig();

  return {
    client: new Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    }),
    bucket: config.bucket,
  };
};

const ensureBucket = async (client: Client, bucket: string) => {
  const exists = await client.bucketExists(bucket);

  if (!exists) {
    await client.makeBucket(bucket);
  }
};

export const uploadObject = async (input: {
  file: File;
  key: string;
  contentType?: string | null;
  bucket?: string;
}) => {
  const { client, bucket: defaultBucket } = createMinioClient();
  const bucket = input.bucket ?? defaultBucket;

  await ensureBucket(client, bucket);

  const buffer = Buffer.from(await input.file.arrayBuffer());

  await client.putObject(bucket, input.key, buffer, buffer.length, {
    "Content-Type": input.contentType ?? input.file.type ?? "application/octet-stream",
  });

  return {
    bucket,
    key: input.key,
  };
};
