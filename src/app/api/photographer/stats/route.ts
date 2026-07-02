import { NextResponse } from "next/server";
import { assertEventOwnedByPhotographer } from "@/lib/photographer-ownership";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("eventSlug")?.trim();
  if (!slug) {
    return NextResponse.json(
      { success: false, error: "Falta eventSlug", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autenticado", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const owned = await assertEventOwnedByPhotographer(supabase, slug, user.id);
    if (!owned.ok) {
      return NextResponse.json(
        { success: false, error: owned.error, code: "FORBIDDEN" },
        { status: owned.status }
      );
    }

    const { data: event } = await supabase
      .from("events")
      .select("id, title")
      .eq("id", owned.eventId)
      .single();

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Evento no encontrado", code: "NOT_FOUND" },
        { status: 404 }
      );
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

    const { count: soldPhotos } = await supabase
      .from("photos")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("is_sold", true);

    const { data: eventPhotoRows } = await supabase
      .from("photos")
      .select("id")
      .eq("event_id", event.id);

    const eventPhotoIds = (eventPhotoRows ?? []).map((p) => p.id);
    let revenueCents = 0;

    if (eventPhotoIds.length > 0) {
      const { data: items } = await supabase
        .from("purchase_items")
        .select("purchase_id")
        .in("photo_id", eventPhotoIds);

      const purchaseIds = [...new Set((items ?? []).map((i) => i.purchase_id))];

      if (purchaseIds.length > 0) {
        const { data: purchases } = await supabase
          .from("purchases")
          .select("id, amount_cents")
          .eq("status", "paid")
          .in("id", purchaseIds);

        revenueCents = (purchases ?? []).reduce(
          (sum, row) => sum + (row.amount_cents ?? 0),
          0
        );
      }
    }

    return NextResponse.json({
      success: true,
      event: event.title,
      photos: photos ?? 0,
      tagged: tagged ?? 0,
      soldPhotos: soldPhotos ?? 0,
      revenueCents,
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Error en stats",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
