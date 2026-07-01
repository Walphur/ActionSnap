import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeSport } from "@/lib/platform";

const EVENTS_BASE_SELECT =
  "id, slug, title, event_date, is_published, price_per_photo_cents, cover_url, photographer_id";

function isMissingColumnError(message: string, column: string): boolean {
  const lower = message.toLowerCase();
  const col = column.toLowerCase();
  return (
    lower.includes(col) &&
    (lower.includes("schema cache") ||
      lower.includes("does not exist") ||
      lower.includes("could not find"))
  );
}

function stripMissingColumn(payload: Record<string, unknown>, errorMessage: string) {
  const next = { ...payload };
  for (const key of Object.keys(next)) {
    if (isMissingColumnError(errorMessage, key)) {
      delete next[key];
      return next;
    }
  }
  return null;
}

export type EventListRow = {
  id: string;
  slug: string;
  title: string;
  sport: string;
  event_date: string;
  is_published: boolean;
  price_per_photo_cents: number;
  cover_url: string | null;
  photographer_id?: string;
};

export async function listPhotographerEvents(
  supabase: SupabaseClient,
  photographerId: string
): Promise<{ events: EventListRow[]; error: string | null }> {
  let { data, error } = await supabase
    .from("events")
    .select(`${EVENTS_BASE_SELECT}, sport`)
    .eq("photographer_id", photographerId)
    .order("event_date", { ascending: false });

  if (error && isMissingColumnError(error.message, "sport")) {
    const fallback = await supabase
      .from("events")
      .select(EVENTS_BASE_SELECT)
      .eq("photographer_id", photographerId)
      .order("event_date", { ascending: false });

    data = fallback.data?.map((row) => ({
      ...row,
      sport: "motocross",
    })) as typeof data;
    error = fallback.error;
  }

  if (error) {
    return { events: [], error: error.message };
  }

  return {
    events: (data ?? []).map((row) => ({
      ...row,
      sport: normalizeSport((row as { sport?: string | null }).sport),
    })) as EventListRow[],
    error: null,
  };
}

export async function insertEventRow(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
): Promise<{ slug: string | null; error: string | null }> {
  let current = { ...payload };
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { data, error } = await supabase
      .from("events")
      .insert(current)
      .select("slug")
      .single();

    if (!error) {
      return { slug: data?.slug ?? null, error: null };
    }

    lastError = error.message;
    const next = stripMissingColumn(current, error.message);
    if (!next) break;
    current = next;
  }

  return { slug: null, error: lastError };
}

export async function updateEventRow(
  supabase: SupabaseClient,
  eventId: string,
  updates: Record<string, unknown>
): Promise<{ error: string | null }> {
  let current = { ...updates };
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { error } = await supabase.from("events").update(current).eq("id", eventId);
    if (!error) return { error: null };

    lastError = error.message;
    const next = stripMissingColumn(current, error.message);
    if (!next) break;
    current = next;
  }

  return { error: lastError };
}

export function schemaHint(errorMessage: string): string | undefined {
  if (
    isMissingColumnError(errorMessage, "sport") ||
    isMissingColumnError(errorMessage, "mp_seller_id") ||
    isMissingColumnError(errorMessage, "description")
  ) {
    return "Ejecutá supabase/sync-missing-columns.sql en el SQL Editor de Supabase.";
  }
  return undefined;
}
