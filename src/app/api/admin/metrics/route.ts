import { NextResponse } from "next/server";
import { sumPlatformFees } from "@/lib/admin-profile-extras";
import { requireAdminProfile } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/format";
import { PLATFORM } from "@/lib/platform";
import { sumCommissionOwedCents } from "@/lib/platform-commission";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireAdminProfile();
    const supabase = createServiceClient();

    const [photographersRes, eventsRes, photosRes, salesRes, commissionOwedCents] =
      await Promise.all([
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
          .select("amount_cents, payment_provider")
          .eq("status", "paid"),
        sumCommissionOwedCents(supabase),
      ]);

    const totalSalesCents =
      salesRes.data?.reduce((sum, row) => sum + (row.amount_cents ?? 0), 0) ?? 0;
    const bankTransferSalesCount =
      salesRes.data?.filter((row) => row.payment_provider === "bank_transfer").length ?? 0;

    const platformRevenueCents = await sumPlatformFees(
      supabase,
      totalSalesCents,
      PLATFORM.commissionPercent
    );

    return NextResponse.json({
      photographers: photographersRes.count ?? 0,
      publishedEvents: eventsRes.count ?? 0,
      totalPhotos: photosRes.count ?? 0,
      totalSalesCents,
      platformRevenueCents,
      commissionOwedCents,
      bankTransferSalesCount,
      commissionPercent: PLATFORM.commissionPercent,
      labels: {
        totalSales: formatPrice(totalSalesCents),
        platformRevenue: formatPrice(platformRevenueCents),
        commissionOwed: formatPrice(commissionOwedCents),
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "No autorizado" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
