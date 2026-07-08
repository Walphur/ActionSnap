import { logWarn } from "@/lib/safe-logger";

function trimEnv(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

export function hasTurnstile() {
  return Boolean(trimEnv(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) && trimEnv(process.env.TURNSTILE_SECRET_KEY));
}

type TurnstileVerifyResult = {
  success?: boolean;
  "error-codes"?: string[];
};

async function requestTurnstileVerify(
  secret: string,
  token: string,
  ip?: string
): Promise<TurnstileVerifyResult> {
  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (ip && ip !== "unknown") {
    body.set("remoteip", ip);
  }

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  return (await res.json()) as TurnstileVerifyResult;
}

export async function verifyTurnstile(token: string | null | undefined, ip: string) {
  if (!hasTurnstile()) return true;

  if (!token) return false;

  const secret = trimEnv(process.env.TURNSTILE_SECRET_KEY);
  let result = await requestTurnstileVerify(secret, token, ip);

  // Detras de Render/proxy la IP del request suele no coincidir con la del navegador.
  if (!result.success && ip && ip !== "unknown") {
    result = await requestTurnstileVerify(secret, token);
  }

  if (!result.success) {
    logWarn("turnstile", "Verificacion fallida", {
      codes: result["error-codes"] ?? [],
    });
  }

  return Boolean(result.success);
}
