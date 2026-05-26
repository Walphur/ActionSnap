import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  photoIds: z.array(z.string().uuid()).min(1),
  eventSlug: z.string(),
  email: z.string().email(),
  packDiscount: z.number().int().min(0).max(50).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { photoIds, eventSlug, email, packDiscount } = bodySchema.parse(json);

    const supabase = createServiceClient();
    const { data: event } = await supabase
      .from("events")
      .select("id, title, price_per_photo_cents, pack_discount_percent")
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

    const discountPct =
      packDiscount && packDiscount > 0
        ? packDiscount
        : (event.pack_discount_percent ?? 0);
    const unitAmount =
      discountPct > 0
        ? Math.round(event.price_per_photo_cents * (1 - discountPct / 100))
        : event.price_per_photo_cents;

    const amount = unitAmount * photoIds.length;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { data: purchase } = await supabase
      .from("purchases")
      .insert({
        email,
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
      customer_email: email,
      line_items: [
        {
          quantity: photoIds.length,
          price_data: {
            currency: "ars",
            unit_amount: unitAmount,
            product_data: {
              name:
                discountPct > 0
                  ? `${photoIds.length} foto(s) — ${event.title} (${discountPct}% pack)`
                  : `${photoIds.length} foto(s) — ${event.title}`,
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
