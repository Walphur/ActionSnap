import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import {
  calculateCheckoutPricing,
  resolvePackDiscountPercent,
} from "@/lib/checkout-pricing";
import {
  releasePurchaseReservation,
  reservePhotosForCheckout,
} from "@/lib/checkout-reserve";
import { createDownloadToken } from "@/lib/download-token";
import { createMercadoPagoPreference } from "@/lib/mercadopago";
import { getPaymentProvider, paymentProviderLabel } from "@/lib/payments";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/get-client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { logError, logInfo } from "@/lib/safe-logger";
import { verifyTurnstile } from "@/lib/turnstile";
import { PLATFORM } from "@/lib/platform";

function describePurchaseInsertError(message: string, code?: string): string {
  if (code === "42703" || /column.*does not exist/i.test(message)) {
    return "Falta una columna en la base de datos (ejecutá las migraciones de Supabase).";
  }
  if (code === "23503") {
    return "El fotógrafo del evento no existe en perfiles.";
  }
  if (code === "23502") {
    return "Faltan datos obligatorios para registrar la compra.";
  }
  return message || "Error desconocido al insertar la compra.";
}

const bodySchema = z.object({
  photoIds: z.array(z.string().uuid()).min(1),
  eventSlug: z.string(),
  email: z.string().email(),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  let purchaseId: string | null = null;
  const supabase = createServiceClient();

  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`checkout:${ip}`, 20, 15 * 60 * 1000);
    if (!limited.ok) {
      return apiError(429, "RATE_LIMITED", "Demasiados intentos. Esperá unos minutos.");
    }

    const provider = getPaymentProvider();
    if (!provider) {
      return apiError(
        503,
        "PAYMENT_NOT_CONFIGURED",
        "Pagos no configurados",
        { hint: "Agregá MERCADOPAGO_ACCESS_TOKEN o STRIPE_SECRET_KEY en Render." }
      );
    }

    const json = await request.json();
    const { photoIds, eventSlug, email, turnstileToken } = bodySchema.parse(json);

    const captchaOk = await verifyTurnstile(turnstileToken, ip);
    if (!captchaOk) {
      return apiError(403, "FORBIDDEN", "Completá la verificación anti-robot antes de pagar.");
    }

    const slug = eventSlug.trim();
    const uniquePhotoIds = [...new Set(photoIds)];

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select(
        "id, title, photographer_id, price_per_photo_cents, pack_discount_percent, is_published"
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (eventError) {
      logError("checkout", "Error al buscar evento", { slug, message: eventError.message });
      return apiError(500, "INTERNAL_ERROR", "Error al buscar el evento");
    }

    if (!event) {
      return apiError(404, "NOT_FOUND", "Evento no encontrado o no publicado");
    }

    if (!event.price_per_photo_cents || event.price_per_photo_cents <= 0) {
      return apiError(422, "CHECKOUT_UNAVAILABLE", "Precio del evento inválido");
    }

    const { data: photographer, error: photographerError } = await supabase
      .from("profiles")
      .select("id, mp_receiver_id, mp_seller_id, is_active, role")
      .eq("id", event.photographer_id)
      .single();

    if (photographerError || !photographer) {
      return apiError(404, "NOT_FOUND", "Fotógrafo no encontrado");
    }

    if (photographer.role !== "photographer") {
      return apiError(422, "CHECKOUT_UNAVAILABLE", "El evento no tiene un fotógrafo válido");
    }

    if (photographer.is_active === false) {
      return apiError(
        422,
        "CHECKOUT_UNAVAILABLE",
        "El fotógrafo no está disponible para ventas en este momento"
      );
    }

    const collectorId = photographer.mp_seller_id ?? photographer.mp_receiver_id;

    if (provider === "mercadopago" && !collectorId) {
      return apiError(
        422,
        "CHECKOUT_UNAVAILABLE",
        "El fotógrafo aún no vinculó Mercado Pago",
        { hint: "El fotógrafo debe conectar su cuenta desde el panel antes de vender." }
      );
    }

    const { data: photos } = await supabase
      .from("photos")
      .select("id, price_cents, is_sold, event_id")
      .eq("event_id", event.id)
      .in("id", uniquePhotoIds);

    if (!photos?.length || photos.length !== uniquePhotoIds.length) {
      return apiError(
        400,
        "PHOTOS_UNAVAILABLE",
        "Una o más fotos no pertenecen a este evento o no existen"
      );
    }

    const alreadySold = photos.filter((p) => p.is_sold);
    if (alreadySold.length > 0) {
      return apiError(
        409,
        "PHOTOS_UNAVAILABLE",
        "Una o más fotos ya fueron vendidas. Actualizá la galería e intentá de nuevo.",
        { details: { soldCount: alreadySold.length } }
      );
    }

    const configuredPackDiscount = event.pack_discount_percent ?? 0;
    const appliedPackDiscount = await resolvePackDiscountPercent(
      supabase,
      event.id,
      uniquePhotoIds,
      configuredPackDiscount
    );

    const pricing = calculateCheckoutPricing({
      eventId: event.id,
      eventPriceCents: event.price_per_photo_cents,
      packDiscountPercent: appliedPackDiscount,
      photoIds: uniquePhotoIds,
      photos,
    });

    if (pricing.amountCents <= 0) {
      return apiError(422, "CHECKOUT_UNAVAILABLE", "Monto de compra inválido");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const splitEnabled = provider === "mercadopago" && Boolean(collectorId);
    const feeRate = PLATFORM.commissionPercent / 100;
    const platformFeeCents = splitEnabled ? Math.round(pricing.amountCents * feeRate) : 0;
    const sellerAmountCents = pricing.amountCents - platformFeeCents;

    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        email,
        amount_cents: pricing.amountCents,
        status: "pending",
        payment_provider: provider,
        photographer_id: event.photographer_id,
        platform_fee_cents: platformFeeCents,
        seller_amount_cents: sellerAmountCents,
        mp_marketplace_fee_cents: splitEnabled ? platformFeeCents : 0,
        mp_marketplace_id: collectorId,
        mp_marketplace_receiver_id: collectorId,
      })
      .select("id")
      .single();

    if (purchaseError || !purchase) {
      const dbMessage = purchaseError?.message ?? "sin detalle";
      const dbCode = purchaseError?.code;
      logError("checkout", "No se pudo crear la compra", { message: dbMessage, code: dbCode });
      return apiError(
        500,
        "INTERNAL_ERROR",
        describePurchaseInsertError(dbMessage, dbCode),
        { details: { dbCode, dbMessage } }
      );
    }

    purchaseId = purchase.id;

    const reserved = await reservePhotosForCheckout(
      supabase,
      purchase.id,
      event.id,
      uniquePhotoIds
    );

    if (!reserved.ok) {
      await supabase.from("purchases").delete().eq("id", purchase.id);
      purchaseId = null;
      return apiError(409, "PHOTOS_UNAVAILABLE", reserved.message, {
        details: { code: reserved.code },
      });
    }

    const { error: itemsError } = await supabase.from("purchase_items").insert(
      uniquePhotoIds.map((photoId) => ({
        purchase_id: purchase.id,
        photo_id: photoId,
      }))
    );

    if (itemsError) {
      await releasePurchaseReservation(supabase, purchase.id);
      await supabase.from("purchases").delete().eq("id", purchase.id);
      purchaseId = null;
      return apiError(500, "INTERNAL_ERROR", "No se pudieron reservar las fotos", {
        details: { dbMessage: itemsError.message, dbCode: itemsError.code },
      });
    }

    const downloadAccessToken = await createDownloadToken(purchase.id);

    if (provider === "mercadopago") {
      let mp;
      try {
        mp = await createMercadoPagoPreference({
          purchaseId: purchase.id,
          email,
          eventTitle: event.title,
          photoCount: uniquePhotoIds.length,
          unitPriceCents: pricing.unitAmountCents,
          totalCents: pricing.amountCents,
          eventSlug: slug,
          appUrl,
          collectorId,
          marketplaceFeeCents: platformFeeCents,
          downloadAccessToken,
        });
      } catch (mpError) {
        await releasePurchaseReservation(supabase, purchase.id);
        await supabase.from("purchases").delete().eq("id", purchase.id);
        purchaseId = null;
        const mpMessage = mpError instanceof Error ? mpError.message : "Error de Mercado Pago";
        logError("checkout", "Preferencia MP rechazada", { message: mpMessage });
        return apiError(502, "PAYMENT_PROVIDER_ERROR", `Mercado Pago rechazó el checkout: ${mpMessage}`, {
          hint:
            mpMessage.includes("MERCADOPAGO_ACCESS_TOKEN") || mpMessage.includes("configurado")
              ? "Verificá MERCADOPAGO_ACCESS_TOKEN en Render (credenciales de producción)."
              : "Revisá que el Access Token y el Collector ID del fotógrafo sean válidos.",
        });
      }

      await supabase
        .from("purchases")
        .update({ mp_preference_id: mp.preferenceId })
        .eq("id", purchase.id);

      logInfo("checkout", "Preferencia MP creada", {
        purchaseId: purchase.id,
        photoCount: uniquePhotoIds.length,
        amountCents: pricing.amountCents,
      });

      return apiSuccess({
        url: mp.initPoint,
        provider,
        providerLabel: paymentProviderLabel(provider),
        purchaseId: purchase.id,
        split: {
          totalCents: pricing.amountCents,
          platformFeeCents,
          sellerAmountCents,
          collectorId,
          packDiscountPercent: appliedPackDiscount,
        },
      });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          quantity: uniquePhotoIds.length,
          price_data: {
            currency: "ars",
            unit_amount: pricing.unitAmountCents,
            product_data: {
              name:
                appliedPackDiscount > 0
                  ? `${uniquePhotoIds.length} foto(s) — ${event.title} (${appliedPackDiscount}% pack)`
                  : `${uniquePhotoIds.length} foto(s) — ${event.title}`,
            },
          },
        },
      ],
      metadata: {
        purchase_id: purchase.id,
        event_slug: slug,
      },
      success_url: `${appUrl}/compra/exito?session_id={CHECKOUT_SESSION_ID}&token=${encodeURIComponent(downloadAccessToken)}`,
      cancel_url: `${appUrl}/eventos/${slug}`,
    });

    await supabase
      .from("purchases")
      .update({ stripe_session_id: session.id })
      .eq("id", purchase.id);

    logInfo("checkout", "Sesión Stripe creada", {
      purchaseId: purchase.id,
      photoCount: uniquePhotoIds.length,
      amountCents: pricing.amountCents,
    });

    return apiSuccess({
      url: session.url,
      provider,
      providerLabel: paymentProviderLabel(provider),
      purchaseId: purchase.id,
      packDiscountPercent: appliedPackDiscount,
    });
  } catch (e) {
    if (purchaseId) {
      await releasePurchaseReservation(supabase, purchaseId);
      await supabase.from("purchases").delete().eq("id", purchaseId);
    }

    logError("checkout", "Error inesperado", {
      message: e instanceof Error ? e.message : "unknown",
    });

    if (e instanceof z.ZodError) {
      return apiError(400, "VALIDATION_ERROR", "Datos de checkout inválidos", {
        details: { issues: e.issues.length },
      });
    }

    return apiError(
      500,
      "INTERNAL_ERROR",
      e instanceof Error ? e.message : "Error en checkout"
    );
  }
}
