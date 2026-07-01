import { fetchImageBuffer } from "@/lib/fetch-image";
import { detectWithGemini, hasGemini } from "@/lib/detect/gemini";
import { detectWithGoogleVision, hasGoogleVision } from "@/lib/detect/google-vision";
import { detectWithOpenAI, hasOpenAI } from "@/lib/detect/openai-vision";
import { mergeDetections } from "@/lib/detect/parse-numbers";
import { extractBikeAndRiderColors } from "@/lib/detect/extract-colors";
import { detectWithTesseract, hasLocalOcr } from "@/lib/detect/tesseract-ocr";
import {
  getCloudBlockReason,
  isCloudBlocked,
  markQuotaError,
  shouldUseCloud,
} from "@/lib/detect/cloud-quota";

export { hasGemini } from "@/lib/detect/gemini";
export { hasGoogleVision } from "@/lib/detect/google-vision";
export { hasOpenAI } from "@/lib/detect/openai-vision";
export { isCloudBlocked, getCloudBlockReason } from "@/lib/detect/cloud-quota";

export function getDetectionProviders() {
  const list: string[] = [];
  if (hasLocalOcr()) list.push("OCR local (gratis, sin cuota)");
  if (shouldUseCloud() && hasGoogleVision()) list.push("Google Vision");
  if (shouldUseCloud() && hasGemini()) list.push("Google Gemini");
  if (shouldUseCloud() && hasOpenAI()) list.push("OpenAI");
  if (isCloudBlocked()) list.push(`(nube bloqueada: ${getCloudBlockReason()})`);
  return list;
}

export function hasAnyDetector() {
  return hasLocalOcr() || (shouldUseCloud() && (hasGemini() || hasOpenAI() || hasGoogleVision()));
}

/**
 * 1) OCR local Tesseract (gratis, sin API)
 * 2) Nube solo si DETECTION_USE_CLOUD=true y hay cuota
 */
export type PhotoDetection = {
  numbers: { number: string; confidence: number }[];
  bike_color: string | null;
  rider_color: string | null;
};

export async function detectRacerNumbers(imageUrl: string): Promise<PhotoDetection> {
  const { buffer } = await fetchImageBuffer(imageUrl);

  let bike_color: string | null = null;
  let rider_color: string | null = null;
  try {
    const colors = await extractBikeAndRiderColors(buffer);
    bike_color = colors.bike_color;
    rider_color = colors.rider_color;
  } catch {
    /* opcional */
  }
  const results: { number: string; confidence: number }[][] = [];
  const errors: string[] = [];

  if (hasLocalOcr()) {
    try {
      const local = await detectWithTesseract(buffer);
      if (local.length > 0) {
        results.push(local.map((n) => ({ ...n, confidence: Math.max(n.confidence, 0.85) })));
      }
    } catch (e) {
      errors.push(`local: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  if (shouldUseCloud()) {
    const runners: { name: string; fn: () => Promise<{ number: string; confidence: number }[]> }[] = [];
    if (hasGoogleVision()) {
      runners.push({
        name: "vision",
        fn: async () => {
          const result = await detectWithGoogleVision(imageUrl);
          return result.numbers;
        },
      });
    }
    if (hasGemini()) runners.push({ name: "gemini", fn: () => detectWithGemini(imageUrl) });
    if (hasOpenAI()) runners.push({ name: "openai", fn: () => detectWithOpenAI(imageUrl) });

    for (const { name, fn } of runners) {
      try {
        const nums = await fn();
        if (nums.length > 0) results.push(nums);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "error";
        markQuotaError(msg);
        errors.push(`${name}: ${msg.slice(0, 80)}`);
        if (isCloudBlocked()) break;
      }
    }
  }

  const merged = mergeDetections(results);

  if (errors.length > 0 && !isCloudBlocked() && merged.length === 0) {
    console.warn("Detección dorsales:", errors.join("; "));
  }

  const numbers = merged.slice(0, 1);

  return {
    numbers,
    bike_color,
    rider_color,
  };
}
