import { NextResponse } from "next/server";
import Stripe from "stripe";
import { markPurchasePaid } from "@/lib/fulfill-purchase";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createServiceClient();
    const email =
      session.customer_details?.email ?? session.customer_email ?? "unknown";
    const purchaseId = session.metadata?.purchase_id;
    const slug = session.metadata?.event_slug ?? "";

    if (purchaseId) {
      await markPurchasePaid(supabase, purchaseId, {
        email,
        stripePaymentIntent:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? undefined,
        eventTitle: slug ? `Carrera ${slug}` : "Victor Films",
      });
    } else {
      await supabase
        .from("purchases")
        .update({
          status: "paid",
          stripe_payment_intent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          email,
        })
        .eq("stripe_session_id", session.id);
    }
  }

  return NextResponse.json({ received: true });
}
