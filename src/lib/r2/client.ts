import { S3Client } from "@aws-sdk/client-s3";

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketHd: string;
  bucketPreview: string;
  publicBaseUrl: string;
};

let cachedClient: S3Client | null = null;
let cachedConfig: R2Config | null = null;

export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketHd = process.env.R2_BUCKET_HD?.trim() || "hd-originals";
  const bucketPreview = process.env.R2_BUCKET_PREVIEW?.trim() || "public-previews";
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketHd,
    bucketPreview,
    publicBaseUrl,
  };
}

export function hasR2(): boolean {
  return getR2Config() !== null;
}

export function getR2Client(): S3Client {
  const config = getR2Config();
  if (!config) {
    throw new Error(
      "Cloudflare R2 no está configurado. Agregá R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY y R2_PUBLIC_BASE_URL."
    );
  }

  if (
    cachedClient &&
    cachedConfig &&
    cachedConfig.accountId === config.accountId &&
    cachedConfig.accessKeyId === config.accessKeyId
  ) {
    return cachedClient;
  }

  cachedConfig = config;
  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedClient;
}
