import { NextResponse } from "next/server";
import {
  getMercadoPagoPayment,
  isMercadoPagoPaid,
} from "@/lib/mercadopago";
import { markPurchasePaid } from "@/lib/fulfill-purchase";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const paymentId =
      body?.data?.id ??
      body?.id ??
      new URL(request.url).searchParams.get("data.id");

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const payment = await getMercadoPagoPayment(paymentId);
    if (!isMercadoPagoPaid(payment.status)) {
      return NextResponse.json({ ok: true, status: payment.status });
    }

    const purchaseId = payment.external_reference;
    if (!purchaseId) {
      return NextResponse.json({ error: "Sin referencia" }, { status: 400 });
    }

    const supabase = createServiceClient();
    await markPurchasePaid(supabase, purchaseId, {
      email: payment.payer?.email,
      mpPaymentId: String(payment.id),
    });

    // Marketplace info (si viene en la respuesta del pago).
    // Notar: en MVP también guardamos fee/seller_amount en checkout, así que esto es para trazabilidad.
    const mpAny = payment as unknown as {
      marketplace?: string;
      marketplace_fee?: number;
      transaction_amount?: number;
    };

    const marketplaceId = mpAny.marketplace;
    const marketplaceFeeCents =
      typeof mpAny.marketplace_fee === "number"
        ? Math.round(mpAny.marketplace_fee * 100)
        : undefined;
    const totalCents =
      typeof mpAny.transaction_amount === "number"
        ? Math.round(mpAny.transaction_amount * 100)
        : undefined;

    const updates: Record<string, unknown> = {};
    if (marketplaceId) updates.mp_marketplace_id = String(marketplaceId);
    if (marketplaceFeeCents !== undefined) {
      updates.mp_marketplace_fee_cents = marketplaceFeeCents;
      updates.platform_fee_cents = marketplaceFeeCents;
      if (totalCents !== undefined) {
        updates.seller_amount_cents = Math.max(0, totalCents - marketplaceFeeCents);
      }
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from("purchases").update(updates).eq("id", purchaseId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

/** IPN legacy de Mercado Pago */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const topic = url.searchParams.get("topic");
  const id = url.searchParams.get("id");

  if (topic === "payment" && id) {
    return POST(
      new Request(request.url, {
        method: "POST",
        body: JSON.stringify({ data: { id } }),
      })
    );
  }

  return NextResponse.json({ ok: true });
}
