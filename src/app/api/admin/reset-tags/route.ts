import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/** Borra todos los dorsales de una carrera para re-analizar desde cero */
export async function POST(request: Request) {
  const { eventSlug } = (await request.json()) as { eventSlug?: string };
  if (!eventSlug?.trim()) {
    return NextResponse.json({ error: "Falta eventSlug" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("slug", eventSlug.trim())
    .single();

  if (!event) {
    return NextResponse.json({ error: "Carrera no encontrada" }, { status: 404 });
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("id")
    .eq("event_id", event.id);

  const ids = (photos ?? []).map((p) => p.id);
  if (ids.length > 0) {
    await supabase.from("photo_numbers").delete().in("photo_id", ids);
    await supabase
      .from("photos")
      .update({ ai_status: "pending", bike_color: null, rider_color: null })
      .eq("event_id", event.id);
  }

  return NextResponse.json({ cleared: ids.length });
}
