import { NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
    .select("id, status, amount_cents, mp_preference_id, checkout_method")
    .eq("id", purchaseId)
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
  }

  if (purchase.checkout_method !== "qr") {
    return NextResponse.json({ error: "Esta compra no es pago QR" }, { status: 422 });
  }

  let qrUrl: string | null = null;
  if (purchase.mp_preference_id) {
    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
    if (mpToken) {
      const prefRes = await fetch(
        `https://api.mercadopago.com/checkout/preferences/${purchase.mp_preference_id}`,
        {
          headers: { Authorization: `Bearer ${mpToken}` },
          cache: "no-store",
        }
      );
      if (prefRes.ok) {
        const pref = (await prefRes.json()) as {
          init_point?: string;
          sandbox_init_point?: string;
        };
        qrUrl = pref.init_point ?? pref.sandbox_init_point ?? null;
      }
    }
  }

  return NextResponse.json({
    purchaseId: purchase.id,
    status: purchase.status,
    amountCents: purchase.amount_cents,
    qrUrl,
  });
}
