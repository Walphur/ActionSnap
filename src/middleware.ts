import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "vf_admin";

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.DOWNLOAD_SIGNING_SECRET?.trim() ||
    "vf-dev-secret-change-me"
  );
}

async function signToken(password: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(password));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "frame-src https://challenges.cloudflare.com https://www.mercadopago.com https://mercadopago.com https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  return response;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();
  response = withSecurityHeaders(response);

  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!adminPassword) return response;

  const path = request.nextUrl.pathname;
  if (path === "/admin/login" || path === "/api/admin/login") {
    return response;
  }

  const isAdmin =
    path.startsWith("/admin") || path.startsWith("/api/admin");
  if (!isAdmin) return response;

  const token = request.cookies.get(COOKIE)?.value;
  const expected = await signToken(adminPassword);

  if (token === expected) return response;

  if (path.startsWith("/api/admin")) {
    return withSecurityHeaders(
      NextResponse.json({ error: "No autorizado" }, { status: 401 })
    );
  }

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", path);
  return withSecurityHeaders(NextResponse.redirect(login));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
