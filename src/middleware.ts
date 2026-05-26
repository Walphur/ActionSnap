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

export async function middleware(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!adminPassword) return NextResponse.next();

  const path = request.nextUrl.pathname;
  if (path === "/admin/login" || path === "/api/admin/login") {
    return NextResponse.next();
  }

  const isAdmin =
    path.startsWith("/admin") || path.startsWith("/api/admin");
  if (!isAdmin) return NextResponse.next();

  const token = request.cookies.get(COOKIE)?.value;
  const expected = await signToken(adminPassword);

  if (token === expected) return NextResponse.next();

  if (path.startsWith("/api/admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", path);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
