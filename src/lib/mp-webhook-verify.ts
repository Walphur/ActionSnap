import { createHmac, timingSafeEqual } from "crypto";

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Valida x-signature de Mercado Pago (notificaciones v2). */
export function verifyMercadoPagoWebhookSignature(
  request: Request,
  dataId: string
): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  if (!secret) return true;

  const shared = request.headers.get("x-actionsnap-webhook-secret")?.trim();
  if (shared && safeEqual(shared, secret)) return true;

  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signature || !requestId) return false;

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const eq = part.indexOf("=");
      if (eq <= 0) return [part.trim(), ""];
      return [part.slice(0, eq).trim(), part.slice(eq + 1)];
    })
  );

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  return safeEqual(expected, v1);
}

export function isMercadoPagoWebhookVerificationRequired() {
  return Boolean(process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim());
}
