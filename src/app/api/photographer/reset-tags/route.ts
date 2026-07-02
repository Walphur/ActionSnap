import { NextResponse } from "next/server";
import { isAiTaggingEnabled } from "@/lib/detection-config";
import { assertEventOwnedByPhotographer } from "@/lib/photographer-ownership";
import { createClient } from "@/lib/supabase/server";

/** Borra todos los dorsales de un evento para re-analizar desde cero */
export async function POST(request: Request) {
  const { eventSlug } = (await request.json()) as { eventSlug?: string };
  if (!eventSlug?.trim()) {
    return NextResponse.json({ error: "Falta eventSlug" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const owned = await assertEventOwnedByPhotographer(
    supabase,
    eventSlug,
    user.id
  );
  if (!owned.ok) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("id")
    .eq("event_id", owned.eventId);

  const ids = (photos ?? []).map((p) => p.id);

  if (ids.length > 0) {
    await supabase.from("photo_numbers").delete().in("photo_id", ids);
    await supabase
      .from("photos")
      .update({
        ai_status: isAiTaggingEnabled() ? "pending" : "skipped",
        bike_color: null,
        rider_color: null,
      })
      .eq("event_id", owned.eventId);
  }

  return NextResponse.json({ cleared: ids.length });
}
