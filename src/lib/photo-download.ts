import { signedDownloadUrl } from "@/lib/cloudinary";
import { hasR2 } from "@/lib/r2/client";
import {
  createR2SignedDownloadUrl,
  downloadR2HdObject,
  isR2HdKey,
} from "@/lib/r2/photo-storage";
import { hasCloudinary } from "@/lib/storage";
import {
  fetchPhotoImageBuffer as fetchSupabaseOrRemotePhotoBuffer,
  isHdStoragePath,
  isRemoteImageUrl,
} from "@/lib/supabase/photo-storage";
import { createHdDownloadUrl } from "@/lib/supabase/signed-url";

/**
 * Genera URL de descarga HD según el backend de la foto:
 * - r2://hd/...  → Cloudflare R2 (firmada)
 * - path interno → Supabase hd-originals (firmada)
 * - cloudinary   → signed URL Cloudinary (legacy)
 * - https://...  → URL remota tal cual
 */
export async function resolveHdDownloadUrl(
  originalUrl: string,
  cloudinaryPublicId?: string | null,
  expiresInSeconds = 3600
): Promise<string> {
  if (isR2HdKey(originalUrl)) {
    if (!hasR2()) {
      throw new Error("La foto está en R2 pero R2 no está configurado en el servidor");
    }
    return createR2SignedDownloadUrl(originalUrl, expiresInSeconds);
  }

  if (isHdStoragePath(originalUrl)) {
    return createHdDownloadUrl(originalUrl, expiresInSeconds);
  }

  if (hasCloudinary() && cloudinaryPublicId) {
    return signedDownloadUrl(cloudinaryPublicId, expiresInSeconds);
  }

  if (isRemoteImageUrl(originalUrl)) {
    return originalUrl;
  }

  throw new Error("No se pudo resolver la URL de descarga HD");
}

/** Descarga el buffer HD desde R2, Supabase o URL remota. */
export async function fetchHdImageBuffer(originalUrl: string) {
  if (isR2HdKey(originalUrl)) {
    return downloadR2HdObject(originalUrl);
  }
  return fetchSupabaseOrRemotePhotoBuffer(originalUrl);
}
