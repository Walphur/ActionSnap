import type { SupabaseClient } from "@supabase/supabase-js";
import type { Event } from "@/lib/types";

export type EventWithCover = Event & {
  displayCoverUrl: string | null;
  photoCount: number;
};

/** Portada: cover_url del evento, o si no hay, la primera foto subida. */
export async function attachEventCovers(
  supabase: SupabaseClient,
  events: Event[]
): Promise<EventWithCover[]> {
  if (events.length === 0) return [];

  const allIds = events.map((e) => e.id);
  const needThumb = events.filter((e) => !e.cover_url);
  const thumbByEventId = new Map<string, string>();
  const countByEventId = new Map<string, number>();

  if (allIds.length > 0) {
    const { data: photos } = await supabase
      .from("photos")
      .select("event_id, preview_url, created_at")
      .in("event_id", allIds)
      .order("created_at", { ascending: true });

    for (const p of photos ?? []) {
      countByEventId.set(p.event_id, (countByEventId.get(p.event_id) ?? 0) + 1);
      if (!thumbByEventId.has(p.event_id)) {
        thumbByEventId.set(p.event_id, p.preview_url);
      }
    }
  }

  return events.map((e) => ({
    ...e,
    displayCoverUrl: e.cover_url ?? thumbByEventId.get(e.id) ?? null,
    photoCount: countByEventId.get(e.id) ?? 0,
  }));
}

export async function getEventDisplayCover(
  supabase: SupabaseClient,
  event: Event
): Promise<string | null> {
  if (event.cover_url) return event.cover_url;

  const { data: photo } = await supabase
    .from("photos")
    .select("preview_url")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return photo?.preview_url ?? null;
}
