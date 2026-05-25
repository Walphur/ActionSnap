import { fetchImageBuffer } from "@/lib/fetch-image";
import { parseNumbersFromText } from "@/lib/detect/parse-numbers";

export function hasGoogleVision() {
  return Boolean(process.env.GOOGLE_VISION_API_KEY?.trim());
}

/** OCR clásico — muy bueno para dígitos en tableros */
export async function detectWithGoogleVision(imageUrl: string) {
  const key = process.env.GOOGLE_VISION_API_KEY!.trim();
  const { base64 } = await fetchImageBuffer(imageUrl);

  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "TEXT_DETECTION", maxResults: 20 }],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Vision: ${err.slice(0, 200)}`);
  }

  const json = await res.json();
  const text =
    json.responses?.[0]?.fullTextAnnotation?.text ??
    json.responses?.[0]?.textAnnotations?.[0]?.description ??
    "";

  const all = parseNumbersFromText(text);
  return all.filter((n) => n.number.length >= 1);
}
