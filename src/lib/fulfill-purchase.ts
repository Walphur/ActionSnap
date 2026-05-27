import type { SupabaseClient } from "@supabase/supabase-js";
import { sendPurchaseEmail } from "@/lib/email";
import { PLATFORM } from "@/lib/platform";

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

  if (!purchase || purchase.status === "paid") {
    return purchase;
  }

  const email = opts.email ?? purchase.email;

  await supabase
    .from("purchases")
    .update({
      status: "paid",
      email,
      ...(opts.mpPaymentId ? { mp_payment_id: String(opts.mpPaymentId) } : {}),
      ...(opts.stripePaymentIntent
        ? { stripe_payment_intent: opts.stripePaymentIntent }
        : {}),
    })
    .eq("id", purchaseId);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await sendPurchaseEmail(
    email,
    `${appUrl}/descargas?purchase_id=${purchaseId}`,
    opts.eventTitle ?? PLATFORM.name,
    `${appUrl}/mis-compras`
  );

  return { ...purchase, status: "paid", email };
}
