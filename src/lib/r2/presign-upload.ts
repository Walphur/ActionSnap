import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, getR2Config } from "@/lib/r2/client";
import {
  buildR2PreviewPublicUrl,
  deleteR2Object,
  r2ObjectKey,
  toR2HdRef,
  uploadR2Object,
} from "@/lib/r2/photo-storage";
import { createWatermarkedPreview } from "@/lib/supabase/photo-storage";
import type { WatermarkOptions } from "@/lib/watermark-config";

const PRESIGN_EXPIRES_SEC = 15 * 60;
const MAX_HD_BYTES = 40 * 1024 * 1024;

export function r2DirectUploadEnabled(): boolean {
  return getR2Config() !== null;
}

/** URL firmada: el navegador sube el HD directo a R2 (sin pasar por Render). */
export async function createHdPresignedPut(params: {
  photographerId: string;
  eventId: string;
  photoId: string;
  contentType: string;
}): Promise<{
  uploadUrl: string;
  objectKey: string;
  expiresIn: number;
}> {
  const config = getR2Config();
  if (!config) {
    throw new Error("Cloudflare R2 no está configurado");
  }

  const objectKey = r2ObjectKey(params.photographerId, params.eventId, params.photoId, "jpg");
  const client = getR2Client();
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: config.bucketHd,
      Key: objectKey,
      ContentType: params.contentType,
    }),
    { expiresIn: PRESIGN_EXPIRES_SEC }
  );

  return { uploadUrl, objectKey, expiresIn: PRESIGN_EXPIRES_SEC };
}

export async function assertHdObjectExists(objectKey: string): Promise<{ size: number }> {
  const config = getR2Config();
  if (!config) {
    throw new Error("Cloudflare R2 no está configurado");
  }

  const client = getR2Client();
  const head = await client.send(
    new HeadObjectCommand({
      Bucket: config.bucketHd,
      Key: objectKey,
    })
  );

  const size = head.ContentLength ?? 0;
  if (size <= 0) {
    throw new Error("El archivo HD no está en R2 o quedó vacío");
  }
  if (size > MAX_HD_BYTES) {
    await deleteR2Object(config.bucketHd, objectKey);
    throw new Error(`HD supera ${MAX_HD_BYTES / (1024 * 1024)} MB`);
  }

  return { size };
}

/**
 * HD ya está en R2. Solo aplica marca de agua al preview chico que mandó el cliente
 * (así Render nunca carga la foto de cámara completa).
 */
export async function finalizeDirectR2Upload(params: {
  photographerId: string;
  eventId: string;
  photoId: string;
  objectKey: string;
  previewBuffer: Buffer;
  watermark: WatermarkOptions;
  width?: number | null;
  height?: number | null;
}) {
  const config = getR2Config();
  if (!config) {
    throw new Error("Cloudflare R2 no está configurado");
  }

  const expectedKey = r2ObjectKey(params.photographerId, params.eventId, params.photoId, "jpg");
  if (params.objectKey !== expectedKey) {
    throw new Error("objectKey inválido");
  }

  await assertHdObjectExists(params.objectKey);

  try {
    const previewBuffer = await createWatermarkedPreview(params.previewBuffer, params.watermark);
    await uploadR2Object({
      bucket: config.bucketPreview,
      key: params.objectKey,
      body: previewBuffer,
      contentType: "image/jpeg",
      cacheControl: "public, max-age=31536000, immutable",
    });
  } catch (error) {
    await deleteR2Object(config.bucketHd, params.objectKey);
    throw error;
  }

  return {
    storagePath: params.objectKey,
    previewUrl: buildR2PreviewPublicUrl(params.objectKey),
    originalPath: toR2HdRef(params.objectKey),
    width: params.width ?? null,
    height: params.height ?? null,
    storage: "r2" as const,
  };
}
