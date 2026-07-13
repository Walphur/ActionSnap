import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/server";

export async function assertPhotoOwnedByPhotographer(
  _supabase: SupabaseClient,
  photoId: string,
  photographerId: string
): Promise<{ ok: true } | { ok: false; status: 403 | 404; error: string }> {
  const service = createServiceClient();
  const { data: photo } = await service
    .from("photos")
    .select("id, events!inner(photographer_id)")
    .eq("id", photoId)
    .maybeSingle();

  if (!photo) {
    return { ok: false, status: 404, error: "Foto no encontrada" };
  }

  const rawEvent = photo.events as
    | { photographer_id: string | null }
    | { photographer_id: string | null }[]
    | null;
  const event = Array.isArray(rawEvent) ? rawEvent[0] : rawEvent;
  if (!event?.photographer_id || event.photographer_id !== photographerId) {
    return { ok: false, status: 403, error: "No tenés permiso sobre esta foto" };
  }

  return { ok: true };
}

export async function assertEventOwnedByPhotographer(
  supabase: SupabaseClient,
  eventSlug: string,
  photographerId: string
): Promise<
  | { ok: true; eventId: string }
  | { ok: false; status: 403 | 404; error: string }
> {
  const { data: event } = await supabase
    .from("events")
    .select("id, photographer_id")
    .eq("slug", eventSlug.trim())
    .maybeSingle();

  if (!event) {
    return { ok: false, status: 404, error: "Evento no encontrado" };
  }

  if (!event.photographer_id || event.photographer_id !== photographerId) {
    return { ok: false, status: 403, error: "No tenés permiso sobre este evento" };
  }

  return { ok: true, eventId: event.id };
}
