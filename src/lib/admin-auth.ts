import { cookies } from "next/headers";

const COOKIE = "vf_admin";

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.DOWNLOAD_SIGNING_SECRET?.trim() ||
    "vf-dev-secret-change-me"
  );
}

export async function signAdminToken(password: string) {
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

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return true;
  return password === expected;
}

export function isAdminProtectionEnabled() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export async function setAdminSession(password: string) {
  const pwd = isAdminProtectionEnabled() ? password : "open";
  const token = await signAdminToken(pwd);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAdminAuthenticated() {
  if (!isAdminProtectionEnabled()) return true;
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;
  const expected = await signAdminToken(process.env.ADMIN_PASSWORD!.trim());
  return token === expected;
}
