import { NextResponse } from "next/server";
import { markPurchasePaid } from "@/lib/fulfill-purchase";
import { requirePhotographerProfile } from "@/lib/photographer-auth";
import { ensureBankTransferCommission } from "@/lib/platform-commission";
import { createServiceClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const { id: purchaseId } = await params;
    const photographer = await requirePhotographerProfile();
    const supabase = createServiceClient();

    const { data: purchase } = await supabase
      .from("purchases")
      .select(
        "id, status, email, payment_provider, photographer_id, amount_cents, platform_fee_cents, seller_amount_cents"
      )
      .eq("id", purchaseId)
      .maybeSingle();

    if (!purchase || purchase.photographer_id !== photographer.id) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
    }

    if (purchase.payment_provider !== "bank_transfer") {
      return NextResponse.json({ error: "No es una transferencia bancaria" }, { status: 422 });
    }

    if (purchase.status === "paid") {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    if (purchase.status !== "pending") {
      return NextResponse.json({ error: "La compra no esta pendiente" }, { status: 422 });
    }

    // Comisión Action Snap + deuda (la plata del 100% la tiene el fotógrafo).
    const commission = await ensureBankTransferCommission(supabase, purchase);

    const { data: items } = await supabase
      .from("purchase_items")
      .select("photo_id")
      .eq("purchase_id", purchaseId)
      .limit(1);

    let eventTitle: string | undefined;
    const photoId = items?.[0]?.photo_id;
    if (photoId) {
      const { data: photo } = await supabase
        .from("photos")
        .select("event_id")
        .eq("id", photoId)
        .maybeSingle();
      if (photo?.event_id) {
        const { data: event } = await supabase
          .from("events")
          .select("title")
          .eq("id", photo.event_id)
          .maybeSingle();
        eventTitle = event?.title ?? undefined;
      }
    }

    const paid = await markPurchasePaid(supabase, purchaseId, {
      email: purchase.email ?? undefined,
      eventTitle,
    });

    if (!paid) {
      return NextResponse.json({ error: "No se pudo confirmar el pago" }, { status: 409 });
    }

    return NextResponse.json({
      ok: true,
      platformFeeCents: commission.platformFeeCents,
      sellerAmountCents: commission.sellerAmountCents,
      commissionOwed: true,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 401 }
    );
  }
}
