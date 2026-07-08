import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import https from "node:https";

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

function trimEnv(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

export function getR2Config(): R2Config | null {
  const accountId = trimEnv(process.env.R2_ACCOUNT_ID);
  const accessKeyId = trimEnv(process.env.R2_ACCESS_KEY_ID);
  const secretAccessKey = trimEnv(process.env.R2_SECRET_ACCESS_KEY);
  const bucketHd = trimEnv(process.env.R2_BUCKET_HD) || "hd-originals";
  const bucketPreview = trimEnv(process.env.R2_BUCKET_PREVIEW) || "public-previews";
  const publicBaseUrl = trimEnv(process.env.R2_PUBLIC_BASE_URL).replace(/\/$/, "");

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

/** Errores TLS típicos cuando el endpoint S3 de una cuenta R2 nueva aún no tiene certificado. */
export function isR2TlsHandshakeError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  const cause =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  const combined = `${msg} ${cause}`.toLowerCase();
  return (
    combined.includes("eproto") ||
    combined.includes("handshake failure") ||
    combined.includes("ssl alert number 40") ||
    combined.includes("ssl routines") ||
    combined.includes("cannot create ssl/tls secure channel")
  );
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
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // AWS SDK >=3.729 manda checksums que R2 no soporta bien
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    requestHandler: new NodeHttpHandler({
      httpsAgent: new https.Agent({
        minVersion: "TLSv1.2",
        maxVersion: "TLSv1.3",
        servername: `${config.accountId}.r2.cloudflarestorage.com`,
      }),
    }),
  });

  return cachedClient;
}
