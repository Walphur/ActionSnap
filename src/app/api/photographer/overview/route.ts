import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePhotographerProfile } from "@/lib/photographer-auth";
import { formatPrice } from "@/lib/format";

export async function GET() {
  try {
    const photographer = await requirePhotographerProfile();
    const supabase = await createClient();

    const { count: eventsCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("photographer_id", photographer.id);

    const { data: paid } = await supabase
      .from("purchases")
      .select("id, amount_cents, seller_amount_cents, email, created_at, status")
      .eq("photographer_id", photographer.id)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(8);

    let totalRevenue = 0;
    let sellerTotal = 0;
    for (const p of paid ?? []) {
      totalRevenue += p.amount_cents ?? 0;
      sellerTotal += p.seller_amount_cents ?? p.amount_cents ?? 0;
    }

    const { data: eventIds } = await supabase
      .from("events")
      .select("id")
      .eq("photographer_id", photographer.id);

    const ids = (eventIds ?? []).map((e) => e.id);
    let photoCount = 0;
    if (ids.length > 0) {
      const { count } = await supabase
        .from("photos")
        .select("*", { count: "exact", head: true })
        .in("event_id", ids);
      photoCount = count ?? 0;
    }

    return NextResponse.json({
      eventsCount: eventsCount ?? 0,
      photoCount,
      salesCount: paid?.length ?? 0,
      totalRevenueCents: totalRevenue,
      sellerTotalCents: sellerTotal,
      totalRevenueLabel: formatPrice(totalRevenue),
      sellerTotalLabel: formatPrice(sellerTotal),
      recentSales: (paid ?? []).map((p) => ({
        id: p.id,
        email: p.email,
        amountCents: p.amount_cents,
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
