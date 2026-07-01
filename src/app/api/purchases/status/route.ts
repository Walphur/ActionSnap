import { NextResponse } from "next/server";
import { createDownloadToken } from "@/lib/download-token";
import { getClientIp } from "@/lib/get-client-ip";
import { markPurchasePaid } from "@/lib/fulfill-purchase";
import {
  getMercadoPagoPayment,
  isMercadoPagoPaid,
} from "@/lib/mercadopago";
import { getPurchasePhotos } from "@/lib/purchase-downloads";
import { rateLimit } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function findPurchase(
  purchaseId: string | null,
  preferenceId: string | null
) {
  const supabase = createServiceClient();

  if (purchaseId) {
    const { data, error } = await supabase
      .from("purchases")
      .select("id, status, email, amount_cents")
      .eq("id", purchaseId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  if (preferenceId) {
    const { data, error } = await supabase
      .from("purchases")
      .select("id, status, email, amount_cents")
      .eq("mp_preference_id", preferenceId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`purchase-status:${ip}`, 120, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { status: "error", error: "Demasiadas consultas. Esperá un momento." },
        { status: 429 }
      );
    }

    const url = new URL(request.url);
    const purchaseId = url.searchParams.get("purchase_id")?.trim() || null;
    const preferenceId =
      url.searchParams.get("preference_id")?.trim() ||
      url.searchParams.get("preference-id")?.trim() ||
      null;
    const paymentId =
      url.searchParams.get("payment_id")?.trim() ||
      url.searchParams.get("collection_id")?.trim() ||
      null;

    if (!purchaseId && !preferenceId) {
      return NextResponse.json(
        { status: "error", error: "Falta purchase_id o preference_id" },
        { status: 400 }
      );
    }

    let purchase = await findPurchase(purchaseId, preferenceId);

    if (!purchase) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }

    const supabase = createServiceClient();

    if (purchase.status !== "paid" && paymentId) {
      try {
        const payment = await getMercadoPagoPayment(paymentId);
        if (isMercadoPagoPaid(payment.status)) {
          await markPurchasePaid(supabase, purchase.id, {
            email: payment.payer?.email ?? purchase.email,
            mpPaymentId: String(payment.id),
          });
          purchase = { ...purchase, status: "paid" };
        }
      } catch {
        /* El webhook puede confirmar después */
      }
    }

    if (purchase.status === "pending") {
      return NextResponse.json({
        status: "pending",
        purchaseId: purchase.id,
      });
    }

    if (purchase.status !== "paid") {
      return NextResponse.json({
        status: purchase.status,
        purchaseId: purchase.id,
      });
    }

    const downloads = await getPurchasePhotos(supabase, purchase.id);
    const zipToken =
      downloads.length > 1 ? await createDownloadToken(purchase.id) : null;

    return NextResponse.json({
      status: "paid",
      purchaseId: purchase.id,
      amountCents: purchase.amount_cents,
      downloads: downloads.map((photo) => ({
        photoId: photo.photoId,
        previewUrl: photo.previewUrl,
        downloadUrl: photo.downloadUrl,
        fileName: photo.fileName,
      })),
      zipUrl: zipToken
        ? `/api/download/zip?token=${encodeURIComponent(zipToken)}`
        : null,
    });
  } catch (e) {
    console.error("purchase status:", e);
    return NextResponse.json(
      { status: "error", error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
