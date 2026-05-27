const MP_API = "https://api.mercadopago.com";

function token() {
  const t = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!t) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
  return t;
}

export type MpPayment = {
  id: number;
  status: string;
  status_detail?: string;
  external_reference?: string;
  payer?: { email?: string };
  transaction_amount?: number;
};

export async function createMercadoPagoPreference(params: {
  purchaseId: string;
  email: string;
  eventTitle: string;
  photoCount: number;
  unitPriceCents: number;
  eventSlug: string;
  appUrl: string;
}) {
  const unitPrice = params.unitPriceCents / 100;

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: `${params.photoCount} foto(s) — ${params.eventTitle}`,
          quantity: params.photoCount,
          unit_price: unitPrice,
          currency_id: "ARS",
        },
      ],
      payer: { email: params.email },
      back_urls: {
        success: `${params.appUrl}/compra/exito?purchase_id=${params.purchaseId}`,
        failure: `${params.appUrl}/eventos/${params.eventSlug}`,
        pending: `${params.appUrl}/compra/exito?purchase_id=${params.purchaseId}&pending=1`,
      },
      auto_return: "approved",
      external_reference: params.purchaseId,
      notification_url: `${params.appUrl}/api/webhooks/mercadopago`,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? "Error Mercado Pago");
  }

  return {
    preferenceId: data.id as string,
    initPoint: (data.init_point ?? data.sandbox_init_point) as string,
  };
}

export async function getMercadoPagoPayment(paymentId: string | number) {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "No se pudo verificar el pago");
  }
  return data as MpPayment;
}

export function isMercadoPagoPaid(status: string) {
  return status === "approved";
}
