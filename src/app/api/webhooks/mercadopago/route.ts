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
