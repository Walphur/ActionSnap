import sharp from "sharp";
import { createServiceClient } from "@/lib/supabase/server";
import { applyWatermark } from "@/lib/watermark-image";
import type { WatermarkOptions } from "@/lib/watermark-config";
import { compressImage } from "@/lib/compress-image";
import { fetchImageBuffer } from "@/lib/fetch-image";
import { createHdDownloadUrl, HD_BUCKET, hdStoragePath } from "@/lib/supabase/signed-url";

export const PREVIEW_BUCKET = "public-previews";

const PREVIEW_MAX_WIDTH = 1200;
const PREVIEW_JPEG_QUALITY = 82;

export function isRemoteImageUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

/** Path interno en hd-originals (sin bucket). */
export function isHdStoragePath(url: string) {
  return Boolean(url) && !isRemoteImageUrl(url);
}

export type UploadedPhotoAssets = {
  storagePath: string;
  previewUrl: string;
  originalPath: string;
  width: number | null;
  height: number | null;
};

/** Preview comprimido + marca de agua en memoria. */
export async function createWatermarkedPreview(
  hdBuffer: Buffer,
  watermark: WatermarkOptions
): Promise<Buffer> {
  const resized = await sharp(hdBuffer, { failOn: "none" })
    .rotate()
    .resize({
      width: PREVIEW_MAX_WIDTH,
      height: PREVIEW_MAX_WIDTH,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: PREVIEW_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  return applyWatermark(resized, watermark);
}

/**
 * Sube HD al bucket privado y preview al bucket público.
 * Path: {photographer_id}/{event_id}/{photo_id}.jpg
 */
export async function uploadPhotographerPhoto(params: {
  photographerId: string;
  eventId: string;
  photoId: string;
  rawBuffer: Buffer;
  mime: string;
  watermark: WatermarkOptions;
}): Promise<UploadedPhotoAssets> {
  const { photographerId, eventId, photoId, rawBuffer, mime, watermark } = params;
  const supabase = createServiceClient();
  const storagePath = hdStoragePath(photographerId, eventId, photoId, "jpg");

  const hdBuffer = await compressImage(rawBuffer, mime);
  const previewBuffer = await createWatermarkedPreview(hdBuffer, watermark);
  const meta = await sharp(hdBuffer).metadata();

  const { error: hdError } = await supabase.storage.from(HD_BUCKET).upload(storagePath, hdBuffer, {
    contentType: "image/jpeg",
    upsert: false,
  });

  if (hdError) {
    if (hdError.message.includes("Bucket not found")) {
      throw new Error(
        "Falta el bucket 'hd-originals' en Supabase. Ejecutá supabase/action-snap-full-setup.sql."
      );
    }
    throw new Error(`HD: ${hdError.message}`);
  }

  try {
    const { error: previewError } = await supabase.storage
      .from(PREVIEW_BUCKET)
      .upload(storagePath, previewBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (previewError) {
      if (previewError.message.includes("Bucket not found")) {
        throw new Error(
          "Falta el bucket 'public-previews' en Supabase. Ejecutá supabase/action-snap-full-setup.sql."
        );
      }
      throw new Error(`Preview: ${previewError.message}`);
    }
  } catch (error) {
    await supabase.storage.from(HD_BUCKET).remove([storagePath]);
    throw error;
  }

  const { data: pub } = supabase.storage.from(PREVIEW_BUCKET).getPublicUrl(storagePath);

  return {
    storagePath,
    previewUrl: pub.publicUrl,
    originalPath: storagePath,
    width: meta.width ?? null,
    height: meta.height ?? null,
  };
}

/** URL accesible para IA/OCR (signed URL si está en bucket privado). */
export async function resolvePhotoAnalysisUrl(originalUrl: string): Promise<string> {
  if (isHdStoragePath(originalUrl)) {
    return createHdDownloadUrl(originalUrl, 600);
  }
  return originalUrl;
}

/** Descarga imagen HD (path interno o URL remota legacy). */
export async function fetchPhotoImageBuffer(originalUrl: string) {
  if (isRemoteImageUrl(originalUrl)) {
    return fetchImageBuffer(originalUrl);
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.storage.from(HD_BUCKET).download(originalUrl);

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo descargar la foto HD");
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  return {
    buffer,
    mime: "image/jpeg",
    base64: buffer.toString("base64"),
  };
}
