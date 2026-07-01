import { NextResponse } from "next/server";
import { requireAdminProfile } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/format";
import { PLATFORM } from "@/lib/platform";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireAdminProfile();
    const supabase = createServiceClient();

    const [
      photographersRes,
      eventsRes,
      photosRes,
      salesRes,
      feeRes,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "photographer"),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
      supabase.from("photos").select("id", { count: "exact", head: true }),
      supabase
        .from("purchases")
        .select("amount_cents")
        .eq("status", "paid"),
      supabase
        .from("purchases")
        .select("platform_fee_cents")
        .eq("status", "paid"),
    ]);

    const totalSalesCents =
      salesRes.data?.reduce((sum, row) => sum + (row.amount_cents ?? 0), 0) ?? 0;

    const platformRevenueCents =
      feeRes.data?.reduce((sum, row) => sum + (row.platform_fee_cents ?? 0), 0) ??
      Math.round(totalSalesCents * (PLATFORM.commissionPercent / 100));

    return NextResponse.json({
      photographers: photographersRes.count ?? 0,
      publishedEvents: eventsRes.count ?? 0,
      totalPhotos: photosRes.count ?? 0,
      totalSalesCents,
      platformRevenueCents,
      commissionPercent: PLATFORM.commissionPercent,
      labels: {
        totalSales: formatPrice(totalSalesCents),
        platformRevenue: formatPrice(platformRevenueCents),
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "No autorizado" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
