import { createHash, randomBytes } from "crypto";

const VERIFIER_COOKIE = "mp_oauth_verifier";

export { VERIFIER_COOKIE };

export function isMercadoPagoPkceEnabled() {
  const raw = process.env.MERCADOPAGO_OAUTH_PKCE?.trim().toLowerCase();
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  if (raw === "false" || raw === "0" || raw === "no") return false;
  // Solo enviar PKCE si está habilitado explícitamente en el panel MP.
  return false;
}

export function generatePkcePair() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function maskClientId(clientId: string) {
  if (clientId.length <= 4) return "****";
  return `${"*".repeat(Math.min(clientId.length - 4, 8))}${clientId.slice(-4)}`;
}
