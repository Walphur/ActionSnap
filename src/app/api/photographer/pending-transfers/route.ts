import { NextResponse } from "next/server";
import { formatPrice } from "@/lib/format";
import { shortTransferReference } from "@/lib/payment-methods";
import { requirePhotographerProfile } from "@/lib/photographer-auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const photographer = await requirePhotographerProfile();
    const supabase = createServiceClient();

    const { data: purchases } = await supabase
      .from("purchases")
      .select("id, email, amount_cents, created_at, transfer_reference, status, payment_provider")
      .eq("photographer_id", photographer.id)
      .eq("status", "pending")
      .eq("payment_provider", "bank_transfer")
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({
      transfers: (purchases ?? []).map((p) => ({
        id: p.id,
        email: p.email ?? "",
        amountCents: p.amount_cents ?? 0,
        amountLabel: formatPrice(p.amount_cents ?? 0),
        createdAt: p.created_at,
        reference: p.transfer_reference?.trim() || shortTransferReference(p.id),
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 401 }
    );
  }
}
