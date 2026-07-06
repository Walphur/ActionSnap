import type { ApiErrorCode } from "@/lib/api-response";

type CheckoutErrorPayload = {
  error?: string;
  code?: ApiErrorCode | string;
  hint?: string;
  details?: {
    code?: string;
    dbCode?: string;
    conflicts?: Array<{
      photoId: string;
      reason: string;
      isSold?: boolean;
      reservationExpired?: boolean;
    }>;
  };
};

const CONFLICT_MESSAGES: Record<string, string> = {
  photo_already_sold: "Una o más fotos ya fueron vendidas. Actualizá la galería.",
  active_reservation: "Otra compra está en curso. Esperá un minuto e intentá de nuevo.",
  pending_purchase_items: "Hay un pago pendiente reciente. Esperá un minuto o refrescá la página.",
  stale_pending_purchase: "Se liberó un checkout anterior. Intentá de nuevo.",
  reserve_update_missed: "No pudimos reservar las fotos. Refrescá la galería e intentá otra vez.",
};

/** Mensaje amigable para el comprador — sin detalles técnicos. */
export function formatCheckoutError(data: CheckoutErrorPayload, status: number): string {
  const code = data.code ?? data.details?.code;

  if (code === "PHOTOS_UNAVAILABLE" || status === 409) {
    const conflict = data.details?.conflicts?.[0];
    if (conflict?.reason && CONFLICT_MESSAGES[conflict.reason]) {
      return CONFLICT_MESSAGES[conflict.reason];
    }
    if (data.error?.includes("vendidas")) return "Una o más fotos ya fueron vendidas. Actualizá la galería.";
    if (data.error?.includes("procesando")) return "Otra compra está en curso. Esperá un minuto e intentá de nuevo.";
    return "Una o más fotos ya no están disponibles. Refrescá la página e intentá de nuevo.";
  }

  if (code === "CHECKOUT_UNAVAILABLE") {
    return data.error ?? "Este evento no está disponible para compra.";
  }

  if (code === "PAYMENT_NOT_CONFIGURED") {
    return "Los pagos no están configurados todavía. Contactá al fotógrafo del evento.";
  }

  if (code === "PAYMENT_PROVIDER_ERROR") {
    return "No pudimos conectar con Mercado Pago. Intentá de nuevo en unos minutos.";
  }

  if (code === "FORBIDDEN") {
    return "Completá la verificación anti-robot antes de pagar.";
  }

  if (code === "RATE_LIMITED") {
    return "Demasiados intentos. Esperá unos minutos e intentá de nuevo.";
  }

  if (code === "INTERNAL_ERROR") {
    if (data.error?.includes("Supabase") || data.error?.includes("columnas")) {
      return "Estamos actualizando el sistema de pagos. Intentá de nuevo en unos minutos.";
    }
    return "No pudimos procesar tu compra. Intentá de nuevo.";
  }

  if (data.hint && !data.hint.includes("MERCADOPAGO") && !data.hint.includes("Render")) {
    return [data.error, data.hint].filter(Boolean).join(" ");
  }

  return data.error ?? "No se pudo iniciar el pago. Revisá tu email e intentá de nuevo.";
}
