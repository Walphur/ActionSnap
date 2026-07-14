import { NextResponse } from "next/server";
import { requireAdminProfile } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

/** Marca como liquidadas las comisiones por transferencia pendiente de un fotógrafo. */
export async function POST(_request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id: photographerId } = await params;
    const supabase = createServiceClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", photographerId)
      .maybeSingle();

    if (!profile || profile.role !== "photographer") {
      return NextResponse.json({ error: "Fotógrafo no encontrado" }, { status: 404 });
    }

    const { data: owed, error: selectError } = await supabase
      .from("purchases")
      .select("id, platform_fee_cents")
      .eq("photographer_id", photographerId)
      .eq("status", "paid")
      .eq("payment_provider", "bank_transfer")
      .eq("platform_fee_settled", false);

    if (selectError) {
      return NextResponse.json(
        {
          error: selectError.message,
          hint: "Ejecutá supabase/fix-bank-transfer-commission.sql en Supabase.",
        },
        { status: 400 }
      );
    }

    const ids = (owed ?? []).map((row) => row.id);
    if (ids.length === 0) {
      return NextResponse.json({ ok: true, settledCount: 0, settledCents: 0 });
    }

    const settledCents = (owed ?? []).reduce(
      (sum, row) => sum + (row.platform_fee_cents ?? 0),
      0
    );

    const { error: updateError } = await supabase
      .from("purchases")
      .update({ platform_fee_settled: true })
      .in("id", ids);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      settledCount: ids.length,
      settledCents,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "No autorizado" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
