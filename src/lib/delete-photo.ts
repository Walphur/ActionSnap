import { getR2Config } from "@/lib/r2/client";
import {
  deleteR2Object,
  fromR2HdRef,
  isR2HdKey,
} from "@/lib/r2/photo-storage";
import { createServiceClient } from "@/lib/supabase/server";
import { HD_BUCKET } from "@/lib/supabase/signed-url";
import { PREVIEW_BUCKET } from "@/lib/supabase/photo-storage";

export type PhotoDeleteRow = {
  id: string;
  event_id: string;
  preview_url: string | null;
  original_url: string | null;
  cloudinary_public_id: string | null;
  is_sold: boolean | null;
  photographer_id?: string | null;
};

async function deleteStorageAssets(photo: PhotoDeleteRow) {
  const storagePath =
    photo.cloudinary_public_id?.trim() ||
    (photo.original_url && !photo.original_url.startsWith("http") && !isR2HdKey(photo.original_url)
      ? photo.original_url
      : null);

  if (photo.original_url && isR2HdKey(photo.original_url)) {
    const config = getR2Config();
    if (config) {
      const key = fromR2HdRef(photo.original_url);
      await Promise.allSettled([
        deleteR2Object(config.bucketHd, key),
        deleteR2Object(config.bucketPreview, key),
      ]);
    }
    return;
  }

  if (!storagePath) return;

  const service = createServiceClient();
  await Promise.allSettled([
    service.storage.from(HD_BUCKET).remove([storagePath]),
    service.storage.from(PREVIEW_BUCKET).remove([storagePath]),
  ]);
}

/**
 * Borra foto(s) del fotógrafo: storage + etiquetas + fila.
 * No borra fotos vendidas ni con ítems de compra.
 */
export async function deletePhotographerPhotos(params: {
  photographerId: string;
  photoIds: string[];
}): Promise<{ deleted: string[]; blocked: { id: string; reason: string }[] }> {
  const service = createServiceClient();
  const ids = [...new Set(params.photoIds.filter(Boolean))];
  if (ids.length === 0) {
    return { deleted: [], blocked: [] };
  }

  const { data: photos, error } = await service
    .from("photos")
    .select(
      "id, event_id, preview_url, original_url, cloudinary_public_id, is_sold, photographer_id, events!inner(photographer_id, cover_url)"
    )
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  const deleted: string[] = [];
  const blocked: { id: string; reason: string }[] = [];

  for (const raw of photos ?? []) {
    const row = raw as PhotoDeleteRow & {
      events:
        | { photographer_id: string | null; cover_url: string | null }
        | { photographer_id: string | null; cover_url: string | null }[]
        | null;
    };
    const event = Array.isArray(row.events) ? row.events[0] : row.events;
    const ownerId = row.photographer_id || event?.photographer_id;

    if (!ownerId || ownerId !== params.photographerId) {
      blocked.push({ id: row.id, reason: "No es tuya" });
      continue;
    }

    if (row.is_sold) {
      blocked.push({ id: row.id, reason: "Ya fue vendida" });
      continue;
    }

    const { count: purchaseCount } = await service
      .from("purchase_items")
      .select("id", { count: "exact", head: true })
      .eq("photo_id", row.id);

    if (purchaseCount && purchaseCount > 0) {
      blocked.push({ id: row.id, reason: "Está en una compra" });
      continue;
    }

    await deleteStorageAssets(row);
    await service.from("photo_numbers").delete().eq("photo_id", row.id);
    const { error: delError } = await service.from("photos").delete().eq("id", row.id);
    if (delError) {
      blocked.push({ id: row.id, reason: delError.message });
      continue;
    }

    if (event?.cover_url && row.preview_url && event.cover_url === row.preview_url) {
      await service.from("events").update({ cover_url: null }).eq("id", row.event_id);
    }

    deleted.push(row.id);
  }

  for (const id of ids) {
    if (!deleted.includes(id) && !blocked.some((b) => b.id === id)) {
      blocked.push({ id, reason: "No encontrada" });
    }
  }

  return { deleted, blocked };
}
