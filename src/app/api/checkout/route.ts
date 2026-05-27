import { NextResponse } from "next/server";
import { z } from "zod";
import { createMercadoPagoPreference } from "@/lib/mercadopago";
import { getPaymentProvider, paymentProviderLabel } from "@/lib/payments";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/get-client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const bodySchema = z.object({
  photoIds: z.array(z.string().uuid()).min(1),
  eventSlug: z.string(),
  email: z.string().email(),
  packDiscount: z.number().int().min(0).max(50).optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`checkout:${ip}`, 20, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Demasiados intentos. Esperá unos minutos." },
        { status: 429 }
      );
    }

    const provider = getPaymentProvider();
    if (!provider) {
      return NextResponse.json(
        {
          error: "Pagos no configurados",
          hint: "Agregá MERCADOPAGO_ACCESS_TOKEN o STRIPE_SECRET_KEY en Render.",
        },
        { status: 503 }
      );
    }

    const json = await request.json();
    const { photoIds, eventSlug, email, packDiscount, turnstileToken } =
      bodySchema.parse(json);

    const captchaOk = await verifyTurnstile(turnstileToken, ip);
    if (!captchaOk) {
      return NextResponse.json(
        { error: "Completá la verificación anti-robot antes de pagar." },
        { status: 403 }
      );
    }

    const slug = eventSlug.trim();

    const supabase = createServiceClient();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, photographer_id, price_per_photo_cents")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (eventError) {
      console.error("checkout event lookup:", eventError);
      return NextResponse.json(
        { error: "Error al buscar el evento", hint: eventError.message },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const { data: photographer, error: photographerError } = await supabase
      .from("profiles")
      .select("id, mp_receiver_id")
      .eq("id", event.photographer_id)
      .single();

    const mpReceiverId = photographerError ? null : photographer?.mp_receiver_id ?? null;

    const { data: photos } = await supabase
      .from("photos")
      .select("id")
      .eq("event_id", event.id)
      .in("id", photoIds);

    if (!photos?.length || photos.length !== photoIds.length) {
      return NextResponse.json({ error: "Fotos inválidas" }, { status: 400 });
    }

    const discountPct = packDiscount && packDiscount > 0 ? packDiscount : 0;
    const unitAmount =
      discountPct > 0
        ? Math.round(event.price_per_photo_cents * (1 - discountPct / 100))
        : event.price_per_photo_cents;

    const amount = unitAmount * photoIds.length;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const splitEnabled = provider === "mercadopago" && Boolean(mpReceiverId);
    const platformFeeCents = splitEnabled ? Math.round(amount * 0.2) : 0;
    const sellerAmountCents = amount - platformFeeCents;

    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        email,
        amount_cents: amount,
        status: "pending",
        payment_provider: provider,
        photographer_id: event.photographer_id,
        platform_fee_cents: platformFeeCents,
        seller_amount_cents: sellerAmountCents,
        mp_marketplace_fee_cents: splitEnabled ? platformFeeCents : 0,
        mp_marketplace_id: mpReceiverId,
        mp_marketplace_receiver_id: mpReceiverId,
      })
      .select("id")
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: purchaseError?.message ?? "No se pudo crear la compra" },
        { status: 500 }
      );
    }

    await supabase.from("purchase_items").insert(
      photoIds.map((photoId) => ({
        purchase_id: purchase.id,
        photo_id: photoId,
      }))
    );

    if (provider === "mercadopago") {
      const mp = await createMercadoPagoPreference({
        purchaseId: purchase.id,
        email,
        eventTitle: event.title,
        photoCount: photoIds.length,
        unitPriceCents: unitAmount,
        eventSlug: slug,
        appUrl,
        marketplace: mpReceiverId,
        marketplaceFeeCents: platformFeeCents,
      });

      await supabase
        .from("purchases")
        .update({ mp_preference_id: mp.preferenceId })
        .eq("id", purchase.id);

      return NextResponse.json({
        url: mp.initPoint,
        provider,
        providerLabel: paymentProviderLabel(provider),
      });
    }

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
        event_slug: slug,
      },
      success_url: `${appUrl}/compra/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/eventos/${slug}`,
    });

    await supabase
      .from("purchases")
      .update({ stripe_session_id: session.id })
      .eq("id", purchase.id);

    return NextResponse.json({
      url: session.url,
      provider,
      providerLabel: paymentProviderLabel(provider),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en checkout" },
      { status: 500 }
    );
  }
}
