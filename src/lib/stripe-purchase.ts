import type { SupabaseClient } from "@supabase/supabase-js";
import { markPurchasePaid } from "@/lib/fulfill-purchase";
import { getStripe } from "@/lib/stripe";

export async function resolvePurchaseFromStripeSession(
  supabase: SupabaseClient,
  sessionId: string
): Promise<string | null> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") return null;

  const { data: bySession } = await supabase
    .from("purchases")
    .select("id, status")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (bySession?.status === "paid") {
    return bySession.id;
  }

  const purchaseId = session.metadata?.purchase_id ?? bySession?.id;
  if (!purchaseId) return null;

  if (bySession?.status !== "paid") {
    await markPurchasePaid(supabase, purchaseId, {
      email: session.customer_details?.email ?? session.customer_email ?? undefined,
      stripePaymentIntent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? undefined,
    });
  }

  return purchaseId;
}
