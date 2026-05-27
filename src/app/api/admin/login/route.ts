import { NextResponse } from "next/server";
import {
  clearAdminSession,
  isAdminProtectionEnabled,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { getClientIp } from "@/lib/get-client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-login:${ip}`, 10, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá más tarde." },
      { status: 429 }
    );
  }

  const { password, action, turnstileToken } = await request.json();

  if (action === "logout") {
    await clearAdminSession();
    return NextResponse.json({ ok: true });
  }

  const captchaOk = await verifyTurnstile(turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json(
      { error: "Verificá que no sos un robot." },
      { status: 403 }
    );
  }

  if (!isAdminProtectionEnabled()) {
    await setAdminSession("open");
    return NextResponse.json({ ok: true, open: true });
  }

  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  await setAdminSession(password);
  return NextResponse.json({ ok: true });
}
