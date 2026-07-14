import { createServiceClient } from "@/lib/supabase/server";
import {
  mpTokenExpiresAt,
  refreshMercadoPagoSellerToken,
} from "@/lib/mercadopago";

const EXPIRY_SKEW_MS = 5 * 60 * 1000;

export type SellerMpCredentials = {
  collectorId: string;
  accessToken: string;
};

/**
 * Devuelve access_token OAuth vigente del fotógrafo (renueva si hace falta).
 * Si solo tiene collector id viejo sin token → hay que reconectar MP.
 */
export async function resolveSellerMercadoPagoCredentials(
  photographerId: string
): Promise<
  | { ok: true; credentials: SellerMpCredentials }
  | { ok: false; error: string; code: "NOT_CONNECTED" | "RECONNECT_REQUIRED" | "REFRESH_FAILED" }
> {
  const service = createServiceClient();

  const { data: profile, error } = await service
    .from("profiles")
    .select(
      "mp_seller_id, mp_receiver_id, mp_access_token, mp_refresh_token, mp_token_expires_at"
    )
    .eq("id", photographerId)
    .maybeSingle();

  if (error) {
    // Columnas de token todavía no existen en Supabase
    if (/mp_access_token|schema cache|does not exist/i.test(error.message)) {
      return {
        ok: false,
        code: "RECONNECT_REQUIRED",
        error:
          "Faltan columnas de tokens MP en la base. Ejecutá supabase/fix-mp-seller-tokens.sql y pedile al fotógrafo que vuelva a conectar Mercado Pago.",
      };
    }
    return { ok: false, code: "NOT_CONNECTED", error: error.message };
  }

  const collectorId = (profile?.mp_seller_id ?? profile?.mp_receiver_id)?.trim() || null;
  if (!collectorId) {
    return {
      ok: false,
      code: "NOT_CONNECTED",
      error: "El fotógrafo aún no vinculó Mercado Pago",
    };
  }

  let accessToken = profile?.mp_access_token?.trim() || null;
  const refreshToken = profile?.mp_refresh_token?.trim() || null;
  const expiresAt = profile?.mp_token_expires_at
    ? new Date(profile.mp_token_expires_at).getTime()
    : null;

  const expired =
    !accessToken ||
    (expiresAt !== null && Number.isFinite(expiresAt) && expiresAt - EXPIRY_SKEW_MS <= Date.now());

  if (expired) {
    if (!refreshToken) {
      return {
        ok: false,
        code: "RECONNECT_REQUIRED",
        error:
          "El fotógrafo tiene Mercado Pago vinculado sin token OAuth. Tiene que volver a tocar Conectar Mercado Pago en Ajustes.",
      };
    }

    try {
      const refreshed = await refreshMercadoPagoSellerToken(refreshToken);
      accessToken = refreshed.access_token;
      await service
        .from("profiles")
        .update({
          mp_access_token: refreshed.access_token,
          mp_refresh_token: refreshed.refresh_token ?? refreshToken,
          mp_token_expires_at: mpTokenExpiresAt(refreshed.expires_in),
          mp_seller_id: String(refreshed.user_id ?? collectorId),
          mp_receiver_id: String(refreshed.user_id ?? collectorId),
        })
        .eq("id", photographerId);
    } catch (e) {
      return {
        ok: false,
        code: "REFRESH_FAILED",
        error:
          e instanceof Error
            ? e.message
            : "No se pudo renovar Mercado Pago. El fotógrafo debe reconectar en Ajustes.",
      };
    }
  }

  if (!accessToken) {
    return {
      ok: false,
      code: "RECONNECT_REQUIRED",
      error: "Falta access token del fotógrafo. Debe reconectar Mercado Pago.",
    };
  }

  return {
    ok: true,
    credentials: { collectorId, accessToken },
  };
}
