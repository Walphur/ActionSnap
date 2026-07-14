import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { isMercadoPagoPkceEnabled } from "@/lib/mercadopago-oauth";

const MP_API = "https://api.mercadopago.com";

export type MpOAuthTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token?: string;
  public_key?: string;
  live_mode?: boolean;
};

export type MpPayment = {
  id: number;
  status: string;
  status_detail?: string;
  external_reference?: string;
  payer?: { email?: string };
  transaction_amount?: number;
  marketplace?: string;
  marketplace_fee?: number;
};

function platformToken() {
  const t = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!t) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
  return t;
}

export function getMercadoPagoConfig() {
  return new MercadoPagoConfig({ accessToken: platformToken() });
}

export function getMercadoPagoClientId() {
  const id = process.env.MERCADOPAGO_CLIENT_ID?.trim();
  if (!id) throw new Error("MERCADOPAGO_CLIENT_ID no configurado");
  return id;
}

export function getMercadoPagoClientSecret() {
  const secret = process.env.MERCADOPAGO_CLIENT_SECRET?.trim();
  if (!secret) throw new Error("MERCADOPAGO_CLIENT_SECRET no configurado");
  return secret;
}

export function normalizeAppUrl(url: string) {
  return url.replace(/\/$/, "");
}

export function resolveAppUrl(requestUrl?: string) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return normalizeAppUrl(configured);
  if (requestUrl) return normalizeAppUrl(new URL(requestUrl).origin);
  return "http://localhost:3000";
}

export function getMercadoPagoRedirectUri(appUrl: string) {
  const configured = process.env.MERCADOPAGO_REDIRECT_URI?.trim();
  if (configured) return normalizeAppUrl(configured);
  return `${normalizeAppUrl(appUrl)}/api/mercadopago/callback`;
}

export function getMercadoPagoAuthBaseUrl() {
  return (
    process.env.MERCADOPAGO_AUTH_URL?.trim() ||
    "https://auth.mercadopago.com/authorization"
  );
}

export function getMercadoPagoOAuthPublicConfig(appUrl: string) {
  const redirectUri = getMercadoPagoRedirectUri(appUrl);
  const configuredRedirect = process.env.MERCADOPAGO_REDIRECT_URI?.trim() ?? null;
  const normalizedAppUrl = normalizeAppUrl(appUrl);
  const clientId = process.env.MERCADOPAGO_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET?.trim() ?? "";
  const expectedFromApp = `${normalizedAppUrl}/api/mercadopago/callback`;

  return {
    redirectUri,
    expectedRedirectUri: expectedFromApp,
    configuredRedirectUri: configuredRedirect,
    redirectUriMismatch:
      Boolean(configuredRedirect) &&
      normalizeAppUrl(configuredRedirect!) !== redirectUri,
    appUrl: normalizedAppUrl,
    authBaseUrl: getMercadoPagoAuthBaseUrl(),
    pkceEnabled: isMercadoPagoPkceEnabled(),
    clientIdConfigured: Boolean(clientId),
    clientSecretConfigured: Boolean(clientSecret),
    accessTokenConfigured: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()),
    clientIdSuffix: clientId ? clientId.slice(-4) : null,
    panelUrl: "https://www.mercadopago.com.ar/developers/panel/app",
    oauthReady: Boolean(clientId && clientSecret),
  };
}

/** URL de OAuth Connect para vincular cuenta del fotógrafo. */
export function buildMercadoPagoAuthUrl(params: {
  state: string;
  redirectUri: string;
  codeChallenge?: string;
}) {
  const redirectUri = normalizeAppUrl(params.redirectUri);
  const url = new URL(getMercadoPagoAuthBaseUrl());
  url.searchParams.set("client_id", getMercadoPagoClientId());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("platform_id", "mp");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", params.state);
  if (params.codeChallenge) {
    url.searchParams.set("code_challenge", params.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
  }
  return url.toString();
}

/** Intercambia el authorization code por credenciales del vendedor. */
export async function exchangeMercadoPagoOAuthCode(params: {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}): Promise<MpOAuthTokenResponse> {
  const redirectUri = normalizeAppUrl(params.redirectUri);
  const body = new URLSearchParams({
    client_id: getMercadoPagoClientId(),
    client_secret: getMercadoPagoClientSecret(),
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: redirectUri,
  });
  if (params.codeVerifier) {
    body.set("code_verifier", params.codeVerifier);
  }

  const res = await fetch(`${MP_API}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await res.json()) as MpOAuthTokenResponse & {
    message?: string;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? "Error al vincular Mercado Pago");
  }

  return data;
}

/**
 * Crea la preferencia con el access_token del VENDEDOR (OAuth Connect).
 * Así el cobro entra en la cuenta del fotógrafo y `marketplace_fee` va a la app.
 *
 * Antes se usaba el token de la plataforma + `marketplace: userId` (incorrecto):
 * toda la plata caía en la MP del dueño de Action Snap.
 */
export async function createMercadoPagoPreference(params: {
  purchaseId: string;
  email: string;
  eventTitle: string;
  photoCount: number;
  unitPriceCents: number;
  totalCents: number;
  eventSlug: string;
  appUrl: string;
  sellerAccessToken: string;
  marketplaceFeeCents?: number;
  downloadAccessToken?: string;
}) {
  const sellerToken = params.sellerAccessToken.trim();
  if (!sellerToken) {
    throw new Error(
      "El fotógrafo debe volver a vincular Mercado Pago (falta access token OAuth)."
    );
  }

  const unitPrice = params.unitPriceCents / 100;
  const marketplaceFee = Math.max(0, (params.marketplaceFeeCents ?? 0) / 100);
  const tokenQs = params.downloadAccessToken
    ? `&token=${encodeURIComponent(params.downloadAccessToken)}`
    : "";
  const successUrl = `${params.appUrl}/compra/exito?purchase_id=${params.purchaseId}${tokenQs}`;

  const preference = new Preference(new MercadoPagoConfig({ accessToken: sellerToken }));

  const body = {
    items: [
      {
        id: params.purchaseId,
        title: `${params.photoCount} foto(s) — ${params.eventTitle}`,
        quantity: params.photoCount,
        unit_price: unitPrice,
        currency_id: "ARS",
      },
    ],
    payer: { email: params.email },
    back_urls: {
      success: successUrl,
      failure: `${params.appUrl}/eventos/${params.eventSlug}`,
      pending: `${successUrl}&pending=1`,
    },
    auto_return: "approved" as const,
    external_reference: params.purchaseId,
    notification_url: `${params.appUrl}/api/webhooks/mercadopago`,
    // Solo marketplace_fee: el token del vendedor ya define quién cobra.
    marketplace_fee: marketplaceFee,
  };

  let data;
  try {
    data = await preference.create({ body });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "error desconocido";
    throw new Error(`Mercado Pago rechazó la preferencia: ${detail}`);
  }

  if (!data.id) {
    throw new Error("Mercado Pago no devolvió preference id");
  }

  const initPoint = data.init_point ?? data.sandbox_init_point;
  if (!initPoint) {
    throw new Error(
      "Mercado Pago no devolvió URL de pago (revisá credenciales de producción vs prueba)"
    );
  }

  return {
    preferenceId: data.id,
    initPoint,
  };
}

/** Renueva el access_token del vendedor con refresh_token. */
export async function refreshMercadoPagoSellerToken(
  refreshToken: string
): Promise<MpOAuthTokenResponse> {
  const body = new URLSearchParams({
    client_id: getMercadoPagoClientId(),
    client_secret: getMercadoPagoClientSecret(),
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(`${MP_API}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await res.json()) as MpOAuthTokenResponse & {
    message?: string;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? "No se pudo renovar el token de Mercado Pago");
  }

  return data;
}

export function mpTokenExpiresAt(expiresInSeconds: number | undefined): string {
  const ttl = typeof expiresInSeconds === "number" && expiresInSeconds > 0 ? expiresInSeconds : 15552000;
  return new Date(Date.now() + ttl * 1000).toISOString();
}

export async function getMercadoPagoPayment(paymentId: string | number) {
  const payment = new Payment(getMercadoPagoConfig());
  const data = await payment.get({ id: String(paymentId) });
  return data as MpPayment;
}

export function isMercadoPagoPaid(status: string) {
  return status === "approved";
}

/** ID del vendedor (collector) guardado en profiles. */
export function normalizeMpCollectorId(userId: number | string) {
  return String(userId);
}
