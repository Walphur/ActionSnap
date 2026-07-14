import { NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";
import { resolveSellerMercadoPagoCredentials } from "@/lib/mp-seller-credentials";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function fetchPreferenceInitPoint(
  preferenceId: string,
  accessToken: string
): Promise<string | null> {
  const prefRes = await fetch(
    `https://api.mercadopago.com/checkout/preferences/${preferenceId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );
  if (!prefRes.ok) return null;
  const pref = (await prefRes.json()) as {
    init_point?: string;
    sandbox_init_point?: string;
  };
  return pref.init_point ?? pref.sandbox_init_point ?? null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const purchaseId = url.searchParams.get("purchase_id")?.trim();
  const token = url.searchParams.get("token")?.trim();

  if (!purchaseId || !token) {
    return NextResponse.json({ error: "Faltan parametros" }, { status: 400 });
  }

  const tokenPurchaseId = await verifyDownloadToken(token);
  if (tokenPurchaseId !== purchaseId) {
    return NextResponse.json({ error: "Token invalido" }, { status: 403 });
  }

  const supabase = createServiceClient();
  const { data: purchase } = await supabase
    .from("purchases")
    .select(
      "id, status, amount_cents, mp_preference_id, mp_checkout_url, checkout_method, photographer_id"
    )
    .eq("id", purchaseId)
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
  }

  if (purchase.checkout_method !== "qr") {
    return NextResponse.json({ error: "Esta compra no es pago QR" }, { status: 422 });
  }

  let qrUrl =
    typeof purchase.mp_checkout_url === "string" && purchase.mp_checkout_url.trim()
      ? purchase.mp_checkout_url.trim()
      : null;

  if (!qrUrl && purchase.mp_preference_id) {
    // Preferencia creada con token OAuth del fotógrafo → hay que leerla con ese token.
    if (purchase.photographer_id) {
      const seller = await resolveSellerMercadoPagoCredentials(purchase.photographer_id);
      if (seller.ok) {
        qrUrl = await fetchPreferenceInitPoint(
          purchase.mp_preference_id,
          seller.credentials.accessToken
        );
      }
    }

    // Fallback legacy (preferencias viejas creadas con token de plataforma).
    if (!qrUrl) {
      const platformToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
      if (platformToken) {
        qrUrl = await fetchPreferenceInitPoint(purchase.mp_preference_id, platformToken);
      }
    }

    if (qrUrl) {
      await supabase
        .from("purchases")
        .update({ mp_checkout_url: qrUrl })
        .eq("id", purchase.id)
        .then(({ error }) => {
          /* columna puede faltar en prod vieja */
          void error;
        });
    }
  }

  return NextResponse.json({
    purchaseId: purchase.id,
    status: purchase.status,
    amountCents: purchase.amount_cents,
    qrUrl,
    ...(qrUrl
      ? {}
      : {
          hint: "No se pudo obtener el link de Mercado Pago. Pedile al fotógrafo reconectar MP o reintentá el checkout.",
        }),
  });
}
