function signingSecret() {
  return (
    process.env.DOWNLOAD_SIGNING_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    "vf-dev-secret-change-me"
  );
}

async function hmacSign(payload: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(signingSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Token firmado para descargar una compra (ZIP o revalidación). */
export async function createDownloadToken(purchaseId: string, hours = 72) {
  const exp = Date.now() + hours * 60 * 60 * 1000;
  const body = `${purchaseId}.${exp}`;
  const sig = await hmacSign(body);
  return Buffer.from(`${body}.${sig}`).toString("base64url");
}

export async function verifyDownloadToken(token: string | null | undefined) {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastDot = decoded.lastIndexOf(".");
    if (lastDot <= 0) return null;
    const body = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expected = await hmacSign(body);
    if (sig !== expected) return null;

    const [purchaseId, expStr] = body.split(".");
    const exp = Number(expStr);
    if (!purchaseId || !exp || Date.now() > exp) return null;
    return purchaseId;
  } catch {
    return null;
  }
}
