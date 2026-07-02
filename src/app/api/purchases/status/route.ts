import { NextResponse } from "next/server";
import { createDownloadToken, verifyDownloadToken } from "@/lib/download-token";
import { getClientIp } from "@/lib/get-client-ip";
import { markPurchasePaid } from "@/lib/fulfill-purchase";
import {
  getMercadoPagoPayment,
  isMercadoPagoPaid,
} from "@/lib/mercadopago";
import { getPurchasePhotos } from "@/lib/purchase-downloads";
import { rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/safe-logger";
import { resolvePurchaseFromStripeSession } from "@/lib/stripe-purchase";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const BLOCKED_DOWNLOAD_STATUSES = new Set(["pending", "failed", "cancelled", "canceled"]);

async function findPurchase(
  purchaseId: string | null,
  preferenceId: string | null,
  stripeSessionId: string | null
) {
  const supabase = createServiceClient();

  if (stripeSessionId) {
    const resolvedId = await resolvePurchaseFromStripeSession(supabase, stripeSessionId);
    if (!resolvedId) return null;

    const { data } = await supabase
      .from("purchases")
      .select("id, status, email, amount_cents")
      .eq("id", resolvedId)
      .maybeSingle();

    return data;
  }

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

function emailMatches(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`purchase-status:${ip}`, 120, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { success: false, status: "error", error: "Demasiadas consultas. Esperá un momento.", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const url = new URL(request.url);
    const purchaseId = url.searchParams.get("purchase_id")?.trim() || null;
    const stripeSessionId = url.searchParams.get("session_id")?.trim() || null;
    const preferenceId =
      url.searchParams.get("preference_id")?.trim() ||
      url.searchParams.get("preference-id")?.trim() ||
      null;
    const paymentId =
      url.searchParams.get("payment_id")?.trim() ||
      url.searchParams.get("collection_id")?.trim() ||
      null;
    const accessToken = url.searchParams.get("token")?.trim() || null;
    const emailHint = url.searchParams.get("email")?.trim() || null;

    if (!purchaseId && !preferenceId && !stripeSessionId) {
      return NextResponse.json(
        {
          success: false,
          status: "error",
          error: "Falta purchase_id, preference_id o session_id",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    let purchase = await findPurchase(purchaseId, preferenceId, stripeSessionId);

    if (!purchase) {
      return NextResponse.json({ success: false, status: "not_found", code: "NOT_FOUND" }, { status: 404 });
    }

    const supabase = createServiceClient();
    let paymentValidated = Boolean(stripeSessionId);

    if (purchase.status !== "paid" && paymentId) {
      try {
        const payment = await getMercadoPagoPayment(paymentId);
        if (
          isMercadoPagoPaid(payment.status) &&
          payment.external_reference === purchase.id
        ) {
          if (purchase.status === "pending") {
            const paid = await markPurchasePaid(supabase, purchase.id, {
              email: payment.payer?.email ?? purchase.email,
              mpPaymentId: String(payment.id),
            });
            if (paid) {
              purchase = { ...purchase, status: "paid" };
            }
          }
          paymentValidated = true;
        }
      } catch {
        /* El webhook puede confirmar después */
      }
    } else if (purchase.status === "paid" && paymentId) {
      try {
        const payment = await getMercadoPagoPayment(paymentId);
        if (
          isMercadoPagoPaid(payment.status) &&
          payment.external_reference === purchase.id
        ) {
          paymentValidated = true;
        }
      } catch {
        /* ignore */
      }
    }

    if (BLOCKED_DOWNLOAD_STATUSES.has(purchase.status)) {
      return NextResponse.json({
        success: true,
        status: purchase.status,
        purchaseId: purchase.id,
      });
    }

    if (purchase.status !== "paid") {
      return NextResponse.json({
        success: true,
        status: purchase.status,
        purchaseId: purchase.id,
      });
    }

    const tokenPurchaseId = await verifyDownloadToken(accessToken);
    const canAccessDownloads =
      tokenPurchaseId === purchase.id ||
      paymentValidated ||
      emailMatches(emailHint, purchase.email);

    if (!canAccessDownloads) {
      return NextResponse.json({
        success: true,
        status: "paid",
        purchaseId: purchase.id,
        amountCents: purchase.amount_cents,
      });
    }

    const downloads = await getPurchasePhotos(supabase, purchase.id);
    const zipToken =
      downloads.length > 1 ? await createDownloadToken(purchase.id) : null;

    return NextResponse.json({
      success: true,
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
    logError("purchase-status", "Error al consultar estado", {
      message: e instanceof Error ? e.message : "unknown",
    });
    return NextResponse.json(
      {
        success: false,
        status: "error",
        error: e instanceof Error ? e.message : "Error interno",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
