import { NextResponse } from "next/server";
import {
  getMercadoPagoPayment,
  isMercadoPagoPaid,
} from "@/lib/mercadopago";
import { markPurchasePaid } from "@/lib/fulfill-purchase";
import {
  isMercadoPagoWebhookVerificationRequired,
  verifyMercadoPagoWebhookSignature,
} from "@/lib/mp-webhook-verify";
import { createServiceClient } from "@/lib/supabase/server";
import { logError } from "@/lib/safe-logger";

async function handleMercadoPagoPayment(paymentId: string | number) {
  const payment = await getMercadoPagoPayment(paymentId);

  if (!isMercadoPagoPaid(payment.status)) {
    return NextResponse.json({ ok: true, status: payment.status });
  }

  const purchaseId = payment.external_reference;
  if (!purchaseId) {
    return NextResponse.json({ error: "Sin referencia de compra" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("purchases")
    .select("id, status")
    .eq("id", purchaseId)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
  }

  let fulfilled = existing.status === "paid";
  if (!fulfilled) {
    const result = await markPurchasePaid(supabase, purchaseId, {
      email: payment.payer?.email,
      mpPaymentId: String(payment.id),
    });
    fulfilled = result?.status === "paid";
  }

  const marketplaceFeeCents =
    typeof payment.marketplace_fee === "number"
      ? Math.round(payment.marketplace_fee * 100)
      : undefined;
  const totalCents =
    typeof payment.transaction_amount === "number"
      ? Math.round(payment.transaction_amount * 100)
      : undefined;

  const updates: Record<string, unknown> = {
    mp_payment_id: String(payment.id),
  };

  if (payment.marketplace) {
    updates.mp_marketplace_id = String(payment.marketplace);
    updates.mp_marketplace_receiver_id = String(payment.marketplace);
  }

  if (marketplaceFeeCents !== undefined) {
    updates.mp_marketplace_fee_cents = marketplaceFeeCents;
    updates.platform_fee_cents = marketplaceFeeCents;
    if (totalCents !== undefined) {
      updates.seller_amount_cents = Math.max(0, totalCents - marketplaceFeeCents);
      updates.amount_cents = totalCents;
    }
  }

  // Guardamos siempre los datos del pago (para trazabilidad), aunque la entrega falle.
  await supabase.from("purchases").update(updates).eq("id", purchaseId);

  if (!fulfilled) {
    // El comprador pagó pero no pudimos entregar (p. ej. foto ya vendida o error
    // transitorio de DB). Registramos el incidente y devolvemos error para que
    // Mercado Pago reintente el webhook (recuperando fallos transitorios).
    logError("mercadopago-webhook", "Pago aprobado sin poder entregar la compra", {
      purchaseId,
      paymentId: String(payment.id),
    });
    return NextResponse.json(
      { error: "No se pudo entregar la compra", purchaseId, paymentId: payment.id },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    purchaseId,
    paymentId: payment.id,
    status: payment.status,
  });
}

/** Webhook JSON de Mercado Pago (payment notifications). */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const paymentId =
      body?.data?.id ??
      body?.id ??
      new URL(request.url).searchParams.get("data.id");

    if (!paymentId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (isMercadoPagoWebhookVerificationRequired()) {
      const valid = verifyMercadoPagoWebhookSignature(request, String(paymentId));
      if (!valid) {
        return NextResponse.json({ error: "Firma de webhook inválida" }, { status: 401 });
      }
    }

    return handleMercadoPagoPayment(paymentId);
  } catch (e) {
    logError("mercadopago-webhook", "Error procesando webhook POST", {
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

/** IPN legacy (?topic=payment&id=). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const topic = url.searchParams.get("topic");
  const id = url.searchParams.get("id");

  if (topic === "payment" && id) {
    try {
      if (isMercadoPagoWebhookVerificationRequired()) {
        const valid = verifyMercadoPagoWebhookSignature(request, id);
        if (!valid) {
          return NextResponse.json({ error: "Firma de webhook inválida" }, { status: 401 });
        }
      }
      return handleMercadoPagoPayment(id);
    } catch (e) {
      logError("mercadopago-webhook", "Error procesando webhook GET", {
        message: e instanceof Error ? e.message : String(e),
      });
      return NextResponse.json({ error: "Webhook error" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
