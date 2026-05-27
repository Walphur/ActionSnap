import { BRAND } from "@/lib/brand";

export type WatermarkOptions = {
  text: string;
  useLogo: boolean;
};

const MAX_LEN = 32;

export function normalizeWatermarkText(raw: string | null | undefined): string {
  const t = (raw ?? "").trim().slice(0, MAX_LEN);
  return t || BRAND.watermark;
}

export function watermarkFromProfile(profile: {
  watermark_text?: string | null;
  watermark_use_logo?: boolean | null;
}): WatermarkOptions {
  return {
    text: normalizeWatermarkText(profile.watermark_text),
    useLogo: profile.watermark_use_logo !== false,
  };
}

export const DEFAULT_WATERMARK: WatermarkOptions = {
  text: BRAND.watermark,
  useLogo: true,
};
