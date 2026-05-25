import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  photoIds: z.array(z.string().uuid()).min(1),
  eventSlug: z.string(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { photoIds, eventSlug } = bodySchema.parse(json);

    const supabase = createServiceClient();
    const { data: event } = await supabase
      .from("events")
      .select("id, title, price_per_photo_cents")
      .eq("slug", eventSlug)
      .eq("is_published", true)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const { data: photos } = await supabase
      .from("photos")
      .select("id")
      .eq("event_id", event.id)
      .in("id", photoIds);

    if (!photos?.length || photos.length !== photoIds.length) {
      return NextResponse.json({ error: "Fotos inválidas" }, { status: 400 });
    }

    const amount = event.price_per_photo_cents * photoIds.length;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { data: purchase } = await supabase
      .from("purchases")
      .insert({
        email: "guest@checkout",
        amount_cents: amount,
        status: "pending",
      })
      .select("id")
      .single();

    if (!purchase) {
      return NextResponse.json({ error: "No se pudo crear la compra" }, { status: 500 });
    }

    await supabase.from("purchase_items").insert(
      photoIds.map((photoId) => ({
        purchase_id: purchase.id,
        photo_id: photoId,
      }))
    );

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: undefined,
      line_items: [
        {
          quantity: photoIds.length,
          price_data: {
            currency: "ars",
            unit_amount: event.price_per_photo_cents,
            product_data: {
              name: `${photoIds.length} foto(s) — ${event.title}`,
            },
          },
        },
      ],
      metadata: {
        purchase_id: purchase.id,
        event_slug: eventSlug,
      },
      success_url: `${appUrl}/compra/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/eventos/${eventSlug}`,
    });

    await supabase
      .from("purchases")
      .update({ stripe_session_id: session.id })
      .eq("id", purchase.id);

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en checkout" },
      { status: 500 }
    );
  }
}
