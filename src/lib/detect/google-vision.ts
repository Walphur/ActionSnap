import { ImageAnnotatorClient, protos } from "@google-cloud/vision";
import { parseNumbersFromText, mergeDetections } from "@/lib/detect/parse-numbers";
import { COLOR_FILTER_OPTIONS } from "@/lib/color-options";

type AnnotateResponse = protos.google.cloud.vision.v1.IAnnotateImageResponse;

let visionClient: ImageAnnotatorClient | null = null;

function normalizePrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

export function hasGoogleVisionServiceAccount() {
  return Boolean(
    process.env.GOOGLE_CLIENT_EMAIL?.trim() &&
      process.env.GOOGLE_PRIVATE_KEY?.trim()
  );
}

export function hasGoogleVision() {
  return hasGoogleVisionServiceAccount() || Boolean(process.env.GOOGLE_VISION_API_KEY?.trim());
}

function getVisionClient() {
  if (visionClient) return visionClient;

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim();

  if (!clientEmail || !privateKey) {
    throw new Error("Faltan GOOGLE_CLIENT_EMAIL o GOOGLE_PRIVATE_KEY");
  }

  visionClient = new ImageAnnotatorClient({
    credentials: {
      client_email: clientEmail,
      private_key: normalizePrivateKey(privateKey),
    },
  });

  return visionClient;
}

const COLOR_LABEL_MAP: Record<string, string> = {
  red: "rojo",
  orange: "naranja",
  yellow: "amarillo",
  blue: "azul",
  green: "verde",
  white: "blanco",
  black: "negro",
  pink: "rosa",
  gray: "gris",
  grey: "gris",
};

const RELEVANT_LABEL_HINTS = [
  "motorcycle",
  "motocross",
  "vehicle",
  "wheel",
  "helmet",
  "sport",
  "dirt",
  "race",
  "orange",
  "red",
  "blue",
  "green",
  "yellow",
  "white",
  "black",
];

export type GoogleVisionDetection = {
  numbers: { number: string; confidence: number }[];
  labels: string[];
  bike_color: string | null;
};

function extractNumbersFromVision(result: AnnotateResponse) {
  const collected: { number: string; confidence: number }[] = [];

  for (const page of result.fullTextAnnotation?.pages ?? []) {
    for (const block of page.blocks ?? []) {
      for (const paragraph of block.paragraphs ?? []) {
        for (const word of paragraph.words ?? []) {
          const text = (word.symbols ?? []).map((s) => s.text ?? "").join("");
          if (!/\d/.test(text)) continue;

          const confidence = word.confidence ?? 0.72;
          const parsed = parseNumbersFromText(text);
          for (const item of parsed) {
            collected.push({
              number: item.number,
              confidence: Math.min(1, Math.max(confidence, item.confidence)),
            });
          }
        }
      }
    }
  }

  if (collected.length === 0) {
    const fallbackText =
      result.fullTextAnnotation?.text ??
      result.textAnnotations?.[0]?.description ??
      "";
    return parseNumbersFromText(fallbackText);
  }

  return mergeDetections([collected])
    .filter((n) => n.confidence >= 0.45)
    .slice(0, 8);
}

function extractLabels(result: AnnotateResponse) {
  const labels =
    result.labelAnnotations
      ?.filter((label) => (label.score ?? 0) >= 0.6)
      .map((label) => label.description?.toLowerCase().trim())
      .filter((label): label is string => Boolean(label)) ?? [];

  const unique = [...new Set(labels)];
  const relevant = unique.filter((label) =>
    RELEVANT_LABEL_HINTS.some((hint) => label.includes(hint))
  );

  return relevant.length > 0 ? relevant.slice(0, 8) : unique.slice(0, 8);
}

function colorFromLabels(labels: string[]): string | null {
  for (const label of labels) {
    for (const [en, es] of Object.entries(COLOR_LABEL_MAP)) {
      if (label.includes(en) && COLOR_FILTER_OPTIONS.includes(es as (typeof COLOR_FILTER_OPTIONS)[number])) {
        return es;
      }
    }
  }
  return null;
}

/** OCR + etiquetas con el SDK oficial y URL firmada o pública. */
export async function detectWithGoogleVisionSdk(
  imageUrl: string
): Promise<GoogleVisionDetection> {
  const client = getVisionClient();

  const [result] = await client.annotateImage({
    image: { source: { imageUri: imageUrl } },
    features: [
      { type: "TEXT_DETECTION" },
      { type: "LABEL_DETECTION", maxResults: 15 },
    ],
  });

  const numbers = extractNumbersFromVision(result);
  const labels = extractLabels(result);
  const bike_color = colorFromLabels(labels);

  return { numbers, labels, bike_color };
}

/** Fallback REST con API key (legacy). */
export async function detectWithGoogleVisionApiKey(imageUrl: string) {
  const key = process.env.GOOGLE_VISION_API_KEY!.trim();
  const { fetchImageBuffer } = await import("@/lib/fetch-image");
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
            features: [
              { type: "TEXT_DETECTION", maxResults: 20 },
              { type: "LABEL_DETECTION", maxResults: 15 },
            ],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Vision: ${err.slice(0, 200)}`);
  }

  const json = (await res.json()) as { responses?: AnnotateResponse[] };
  const result = json.responses?.[0] ?? {};

  const numbers = extractNumbersFromVision(result);
  const labels = extractLabels(result);
  const bike_color = colorFromLabels(labels);

  return { numbers, labels, bike_color };
}

/** Punto de entrada usado por el analizador del fotógrafo. */
export async function detectWithGoogleVision(imageUrl: string): Promise<GoogleVisionDetection> {
  if (hasGoogleVisionServiceAccount()) {
    return detectWithGoogleVisionSdk(imageUrl);
  }
  if (process.env.GOOGLE_VISION_API_KEY?.trim()) {
    return detectWithGoogleVisionApiKey(imageUrl);
  }
  throw new Error("Google Vision no configurado");
}
