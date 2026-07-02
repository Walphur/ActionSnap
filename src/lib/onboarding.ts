const PREFIX = "actionsnap_onboarding_";

export const ONBOARDING_KEYS = {
  checklistCompleteSeen: `${PREFIX}checklist_complete_seen`,
  firstSaleSeen: `${PREFIX}first_sale_seen`,
  tipsSeen: `${PREFIX}tips_seen`,
} as const;

export type OnboardingTipId =
  | "tab-overview"
  | "tab-events"
  | "tab-upload"
  | "tab-settings"
  | "tagging"
  | "mercadopago";

export function getStorageItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStorageItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota / private mode */
  }
}

export function getTipsSeen(): Set<string> {
  const raw = getStorageItem(ONBOARDING_KEYS.tipsSeen);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function markTipSeen(tipId: OnboardingTipId | string): void {
  const seen = getTipsSeen();
  seen.add(tipId);
  setStorageItem(ONBOARDING_KEYS.tipsSeen, JSON.stringify([...seen]));
}

export function hasSeenTip(tipId: OnboardingTipId | string): boolean {
  return getTipsSeen().has(tipId);
}

export function getAppUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function buildEventShareUrl(slug: string): string {
  return `${getAppUrl().replace(/\/$/, "")}/eventos/${slug}`;
}

export function buildWhatsAppShareUrl(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}

export function buildFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function buildQrImageUrl(url: string, size = 180): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}
