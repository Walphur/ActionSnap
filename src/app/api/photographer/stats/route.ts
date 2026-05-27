import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("eventSlug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Falta eventSlug" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data: event } = await supabase
      .from("events")
      .select("id, title")
      .eq("slug", slug)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const { count: photos } = await supabase
      .from("photos")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id);

    const { count: tagged } = await supabase
      .from("photos")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("ai_status", "manual");

    const { data: paid } = await supabase
      .from("purchase_items")
      .select("photo_id, purchases!inner(status, amount_cents)")
      .eq("purchases.status", "paid");

    const eventPhotoIds = new Set<string>();
    const { data: eventPhotos } = await supabase
      .from("photos")
      .select("id")
      .eq("event_id", event.id);

    for (const p of eventPhotos ?? []) eventPhotoIds.add(p.id);

    let soldPhotos = 0;
    let revenue = 0;

    for (const row of paid ?? []) {
      const purchaseRow = row.purchases as
        | { status: string; amount_cents: number }
        | { status: string; amount_cents: number }[];
      const purchase = Array.isArray(purchaseRow) ? purchaseRow[0] : purchaseRow;

      if (!eventPhotoIds.has(row.photo_id)) continue;
      soldPhotos++;
      revenue += purchase?.amount_cents ?? 0;
    }

    return NextResponse.json({
      event: event.title,
      photos: photos ?? 0,
      tagged: tagged ?? 0,
      soldPhotos,
      revenueCents: revenue,
    });
  } catch (e) {
    return NextResponse.json({ error: "Error en stats" }, { status: 500 });
  }
}

