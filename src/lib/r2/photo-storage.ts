import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { prepareHdOriginal } from "@/lib/compress-image";
import { getR2Client, getR2Config } from "@/lib/r2/client";
import {
  createWatermarkedPreview,
  type UploadedPhotoAssets,
} from "@/lib/supabase/photo-storage";
import type { WatermarkOptions } from "@/lib/watermark-config";

/** Prefijo guardado en photos.original_url para identificar HD en R2. */
export const R2_HD_PREFIX = "r2://hd/";

export function isR2HdKey(value: string | null | undefined): boolean {
  return Boolean(value?.startsWith(R2_HD_PREFIX));
}

export function toR2HdRef(objectKey: string): string {
  return `${R2_HD_PREFIX}${objectKey.replace(/^\//, "")}`;
}

export function fromR2HdRef(ref: string): string {
  if (!isR2HdKey(ref)) {
    throw new Error("No es una clave HD de R2");
  }
  return ref.slice(R2_HD_PREFIX.length);
}

export function r2ObjectKey(
  photographerId: string,
  eventId: string,
  photoId: string,
  ext = "jpg"
) {
  return `${photographerId}/${eventId}/${photoId}.${ext}`;
}

export function buildR2PreviewPublicUrl(objectKey: string): string {
  const config = getR2Config();
  if (!config) {
    throw new Error("R2_PUBLIC_BASE_URL no está configurada");
  }
  return `${config.publicBaseUrl}/${objectKey.replace(/^\//, "")}`;
}

async function bodyToBuffer(body: unknown): Promise<Buffer> {
  if (!body) {
    throw new Error("Objeto R2 vacío");
  }

  if (Buffer.isBuffer(body)) return body;
  if (body instanceof Uint8Array) return Buffer.from(body);

  if (typeof (body as { transformToByteArray?: () => Promise<Uint8Array> }).transformToByteArray === "function") {
    const bytes = await (body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray();
    return Buffer.from(bytes);
  }

  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function uploadR2Object(params: {
  bucket: string;
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}) {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl,
    })
  );
}

export async function deleteR2Object(bucket: string, key: string) {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export async function createR2SignedDownloadUrl(
  hdRef: string,
  expiresInSeconds = 3600
): Promise<string> {
  const config = getR2Config();
  if (!config) {
    throw new Error("Cloudflare R2 no está configurado");
  }

  const key = fromR2HdRef(hdRef);
  const client = getR2Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucketHd,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${key.split("/").pop() ?? "foto.jpg"}"`,
      ResponseContentType: "image/jpeg",
    }),
    { expiresIn: expiresInSeconds }
  );
}

export async function downloadR2HdObject(hdRef: string): Promise<{
  buffer: Buffer;
  mime: string;
  base64: string;
}> {
  const config = getR2Config();
  if (!config) {
    throw new Error("Cloudflare R2 no está configurado");
  }

  const key = fromR2HdRef(hdRef);
  const client = getR2Client();
  const result = await client.send(
    new GetObjectCommand({
      Bucket: config.bucketHd,
      Key: key,
    })
  );

  const buffer = await bodyToBuffer(result.Body);
  return {
    buffer,
    mime: result.ContentType || "image/jpeg",
    base64: buffer.toString("base64"),
  };
}

/**
 * Sube HD privado + preview público a R2.
 * Path: {photographer_id}/{event_id}/{photo_id}.jpg
 * Guarda original_url como r2://hd/{path}
 */
export async function uploadPhotographerPhotoToR2(params: {
  photographerId: string;
  eventId: string;
  photoId: string;
  rawBuffer: Buffer;
  mime: string;
  watermark: WatermarkOptions;
}): Promise<UploadedPhotoAssets & { storage: "r2" }> {
  const config = getR2Config();
  if (!config) {
    throw new Error(
      "Cloudflare R2 no está configurado. Agregá las variables R2_* en Render/.env.local."
    );
  }

  const { photographerId, eventId, photoId, rawBuffer, mime, watermark } = params;
  const objectKey = r2ObjectKey(photographerId, eventId, photoId, "jpg");

  const hdBuffer = await prepareHdOriginal(rawBuffer, mime);
  const previewBuffer = await createWatermarkedPreview(hdBuffer, watermark);
  const meta = await sharp(hdBuffer).metadata();

  await uploadR2Object({
    bucket: config.bucketHd,
    key: objectKey,
    body: hdBuffer,
    contentType: "image/jpeg",
    cacheControl: "private, max-age=31536000",
  });

  try {
    await uploadR2Object({
      bucket: config.bucketPreview,
      key: objectKey,
      body: previewBuffer,
      contentType: "image/jpeg",
      cacheControl: "public, max-age=31536000, immutable",
    });
  } catch (error) {
    await deleteR2Object(config.bucketHd, objectKey);
    throw error;
  }

  return {
    storagePath: objectKey,
    previewUrl: buildR2PreviewPublicUrl(objectKey),
    originalPath: toR2HdRef(objectKey),
    width: meta.width ?? null,
    height: meta.height ?? null,
    storage: "r2",
  };
}
