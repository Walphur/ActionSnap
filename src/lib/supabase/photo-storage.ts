import sharp from "sharp";
import { createServiceClient } from "@/lib/supabase/server";
import { applyWatermark } from "@/lib/watermark-image";
import type { WatermarkOptions } from "@/lib/watermark-config";
import { prepareHdOriginal, configureSharpForLowMemory } from "@/lib/compress-image";
import { fetchImageBuffer } from "@/lib/fetch-image";
import { HD_BUCKET, hdStoragePath } from "@/lib/supabase/signed-url";

export const PREVIEW_BUCKET = "public-previews";

const PREVIEW_MAX_WIDTH = 1200;
const PREVIEW_JPEG_QUALITY = 80;

export function isRemoteImageUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

/** Path interno en hd-originals de Supabase (sin bucket). Excluye claves R2. */
export function isHdStoragePath(url: string) {
  return Boolean(url) && !isRemoteImageUrl(url) && !url.startsWith("r2://");
}

export type UploadedPhotoAssets = {
  storagePath: string;
  previewUrl: string;
  originalPath: string;
  width: number | null;
  height: number | null;
};

/** Preview chico + marca de agua. No toca el HD de venta. */
export async function createWatermarkedPreview(
  sourceBuffer: Buffer,
  watermark: WatermarkOptions
): Promise<Buffer> {
  configureSharpForLowMemory();

  const resized = await sharp(sourceBuffer, {
    failOn: "none",
    sequentialRead: true,
    limitInputPixels: 100_000_000,
  })
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

  // HD primero (JPG = sin Sharp); después preview. No las dos pipes a la vez.
  const hd = await prepareHdOriginal(rawBuffer, mime);

  const { error: hdError } = await supabase.storage.from(HD_BUCKET).upload(storagePath, hd.buffer, {
    contentType: hd.contentType,
    upsert: false,
  });

  if (hdError) {
    if (hdError.message.includes("Bucket not found")) {
      throw new Error(
        "Falta el bucket 'hd-originals' en Supabase. En SQL Editor pegá el contenido de supabase/create-storage-buckets.sql."
      );
    }
    throw new Error(`HD: ${hdError.message}`);
  }

  try {
    const previewBuffer = await createWatermarkedPreview(rawBuffer, watermark);
    const { error: previewError } = await supabase.storage
      .from(PREVIEW_BUCKET)
      .upload(storagePath, previewBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (previewError) {
      if (previewError.message.includes("Bucket not found")) {
        throw new Error(
          "Falta el bucket 'public-previews' en Supabase. En SQL Editor pegá el contenido de supabase/create-storage-buckets.sql."
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
    width: hd.width,
    height: hd.height,
  };
}

/** URL accesible para IA/OCR (signed URL si está en bucket privado). */
export async function resolvePhotoAnalysisUrl(originalUrl: string): Promise<string> {
  const { resolveHdDownloadUrl } = await import("@/lib/photo-download");
  if (isHdStoragePath(originalUrl) || originalUrl.startsWith("r2://")) {
    return resolveHdDownloadUrl(originalUrl, null, 600);
  }
  return originalUrl;
}

/** Descarga imagen HD (path interno Supabase o URL remota legacy). No usar con r2:// — usá fetchHdImageBuffer. */
export async function fetchPhotoImageBuffer(originalUrl: string) {
  if (originalUrl.startsWith("r2://")) {
    throw new Error("Clave R2: usá fetchHdImageBuffer de @/lib/photo-download");
  }
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
