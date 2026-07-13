import { NextResponse } from "next/server";
import { formatPrice } from "@/lib/format";
import {
  fetchPaidPurchasesForPhotographer,
  resolveSellerAmountCents,
  summarizePurchases,
} from "@/lib/photographer-sales";
import { requirePhotographerProfile } from "@/lib/photographer-auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const photographer = await requirePhotographerProfile();
    const supabase = createServiceClient();

    const { count: eventsCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("photographer_id", photographer.id);

    const paid = await fetchPaidPurchasesForPhotographer(supabase, photographer.id);
    const totals = summarizePurchases(paid);

    const { data: eventIds } = await supabase
      .from("events")
      .select("id")
      .eq("photographer_id", photographer.id);

    const ids = (eventIds ?? []).map((e) => e.id);
    let photoCount = 0;
    let taggedPhotoCount = 0;
    if (ids.length > 0) {
      const { count } = await supabase
        .from("photos")
        .select("*", { count: "exact", head: true })
        .in("event_id", ids);
      photoCount = count ?? 0;

      const { data: eventPhotos } = await supabase
        .from("photos")
        .select("id")
        .in("event_id", ids);
      const photoIds = (eventPhotos ?? []).map((p) => p.id);
      if (photoIds.length > 0) {
        const { data: taggedRows } = await supabase
          .from("photo_numbers")
          .select("photo_id")
          .in("photo_id", photoIds);
        taggedPhotoCount = new Set((taggedRows ?? []).map((r) => r.photo_id)).size;
      }
    }

    return NextResponse.json({
      eventsCount: eventsCount ?? 0,
      photoCount,
      taggedPhotoCount,
      salesCount: totals.salesCount,
      totalRevenueCents: totals.grossCents,
      sellerTotalCents: totals.sellerCents,
      totalRevenueLabel: formatPrice(totals.grossCents),
      sellerTotalLabel: formatPrice(totals.sellerCents),
      recentSales: paid.slice(0, 8).map((p) => ({
        id: p.id,
        email: p.email ?? "",
        amountCents: p.amount_cents ?? 0,
        sellerAmountCents: resolveSellerAmountCents(p),
        createdAt: p.created_at,
      })),
      mpConnected: Boolean(photographer.mp_receiver_id),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 401 }
    );
  }
}
