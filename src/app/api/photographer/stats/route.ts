import { NextResponse } from "next/server";
import { assertEventOwnedByPhotographer } from "@/lib/photographer-ownership";
import {
  fetchPaidPurchasesForEvent,
  summarizePurchases,
} from "@/lib/photographer-sales";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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

    const service = createServiceClient();

    const { data: event } = await service
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

    const { count: photos } = await service
      .from("photos")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id);

    const { count: tagged } = await service
      .from("photos")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("ai_status", "manual");

    const { count: soldPhotos } = await service
      .from("photos")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("is_sold", true);

    const paidPurchases = await fetchPaidPurchasesForEvent(service, event.id);
    const totals = summarizePurchases(paidPurchases);

    return NextResponse.json({
      success: true,
      event: event.title,
      photos: photos ?? 0,
      tagged: tagged ?? 0,
      soldPhotos: soldPhotos ?? 0,
      salesCount: totals.salesCount,
      revenueCents: totals.sellerCents,
      grossRevenueCents: totals.grossCents,
      sellerRevenueCents: totals.sellerCents,
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
