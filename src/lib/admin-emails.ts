import { timingSafeEqual } from "crypto";

/** Emails con acceso admin cuando ADMIN_EMAILS no esta en Render. */
const BUILTIN_ADMIN_EMAILS = ["juank.gagliano@gmail.com"];

/** Emails con acceso al panel /admin (separados por coma). */
export function getAdminEmails(): string[] {
  const raw =
    process.env.ADMIN_EMAILS?.trim() ||
    process.env.SUPER_ADMIN_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "";

  const fromEnv = raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (fromEnv.length > 0) return fromEnv;
  return BUILTIN_ADMIN_EMAILS;
}

export function isConfiguredAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return getAdminEmails().includes(normalized);
}

export function adminPasswordMatches(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
