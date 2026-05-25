import { fetchImageBuffer } from "@/lib/fetch-image";
import { parseNumbersFromJson } from "@/lib/detect/parse-numbers";

export function hasGemini() {
  return Boolean(process.env.GOOGLE_GEMINI_API_KEY?.trim());
}

export async function detectWithGemini(imageUrl: string) {
  const key = process.env.GOOGLE_GEMINI_API_KEY!.trim();
  const { buffer, mime, base64 } = await fetchImageBuffer(imageUrl);

  const prompt = `Sos experto en motocross. Mirá la foto y encontrá TODOS los números de dorsal en motos o pilotos.
Prioridad: tablero frontal blanco/negro o amarillo/negro con números grandes (ej. 27, 80, 98).
Respondé SOLO JSON: {"numbers":[{"value":"27","confidence":0.95}]}
Si no hay dorsal legible: {"numbers":[]}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mime, data: base64 } },
            ],
          },
        ],
        generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini: ${err.slice(0, 200)}`);
  }

  const json = await res.json();
  const text =
    json.candidates?.[0]?.content?.parts?.[0]?.text ?? '{"numbers":[]}';
  const cleaned = text.replace(/```json|```/g, "").trim();
  return parseNumbersFromJson(cleaned);
}
