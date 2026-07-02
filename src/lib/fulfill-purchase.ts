import type { SupabaseClient } from "@supabase/supabase-js";
import { createDownloadToken } from "@/lib/download-token";
import { finalizePurchasePhotos } from "@/lib/checkout-reserve";
import { sendPurchaseEmail } from "@/lib/email";
import { PLATFORM } from "@/lib/platform";
import { logError, logInfo } from "@/lib/safe-logger";

export async function markPurchasePaid(
  supabase: SupabaseClient,
  purchaseId: string,
  opts: {
    email?: string;
    mpPaymentId?: string;
    stripePaymentIntent?: string;
    eventTitle?: string;
  }
) {
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, status, email")
    .eq("id", purchaseId)
    .single();

  if (!purchase) return null;

  if (purchase.status === "paid") {
    return purchase;
  }

  if (purchase.status !== "pending") {
    logError("fulfill-purchase", "Compra no pendiente al intentar marcar paid", {
      purchaseId,
      status: purchase.status,
    });
    return null;
  }

  const finalized = await finalizePurchasePhotos(supabase, purchaseId);
  if (!finalized.ok) {
    logError("fulfill-purchase", "Conflicto al marcar fotos vendidas", {
      purchaseId,
      code: finalized.code,
    });
    return null;
  }

  const email = opts.email ?? purchase.email;

  const { error: updateError } = await supabase
    .from("purchases")
    .update({
      status: "paid",
      email,
      ...(opts.mpPaymentId ? { mp_payment_id: String(opts.mpPaymentId) } : {}),
      ...(opts.stripePaymentIntent
        ? { stripe_payment_intent: opts.stripePaymentIntent }
        : {}),
    })
    .eq("id", purchaseId)
    .eq("status", "pending");

  if (updateError) {
    logError("fulfill-purchase", "No se pudo actualizar compra a paid", {
      purchaseId,
      message: updateError.message,
    });
    return null;
  }

  logInfo("fulfill-purchase", "Compra marcada como pagada", { purchaseId });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const downloadToken = await createDownloadToken(purchaseId);
  const downloadUrl = `${appUrl}/descargas?purchase_id=${purchaseId}&token=${encodeURIComponent(downloadToken)}`;
  await sendPurchaseEmail(
    email,
    downloadUrl,
    opts.eventTitle ?? PLATFORM.name,
    `${appUrl}/mis-compras`
  );

  return { ...purchase, status: "paid", email };
}
