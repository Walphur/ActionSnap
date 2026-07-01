import type { SupabaseClient } from "@supabase/supabase-js";
import { sendPurchaseEmail } from "@/lib/email";
import { PLATFORM } from "@/lib/platform";

async function markPhotosSold(supabase: SupabaseClient, purchaseId: string) {
  const { data: items } = await supabase
    .from("purchase_items")
    .select("photo_id")
    .eq("purchase_id", purchaseId);

  const photoIds = (items ?? []).map((item) => item.photo_id).filter(Boolean);
  if (photoIds.length === 0) return;

  await supabase.from("photos").update({ is_sold: true }).in("id", photoIds);
}

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

  await markPhotosSold(supabase, purchaseId);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await sendPurchaseEmail(
    email,
    `${appUrl}/descargas?purchase_id=${purchaseId}`,
    opts.eventTitle ?? PLATFORM.name,
    `${appUrl}/mis-compras`
  );

  return { ...purchase, status: "paid", email };
}
