import { createServiceClient } from "@/lib/supabase/server";

export const HD_BUCKET = "hd-originals";

/**
 * Genera URL firmada para descarga HD post-compra.
 * Solo debe llamarse desde Route Handlers / Server Actions (service role).
 */
export async function createHdDownloadUrl(
  storagePath: string,
  expiresInSeconds = 3600
): Promise<string> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(HD_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "No se pudo firmar la URL de descarga");
  }

  return data.signedUrl;
}

/** Ruta sugerida al subir: {photographerId}/{eventId}/{photoId}.jpg */
export function hdStoragePath(
  photographerId: string,
  eventId: string,
  photoId: string,
  ext = "jpg"
) {
  return `${photographerId}/${eventId}/${photoId}.${ext}`;
}
