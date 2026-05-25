import OpenAI from "openai";
import { parseNumbersFromJson } from "@/lib/detect/parse-numbers";

export function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

const PROMPT = `Encontrá números de DORSAL de motocross en esta foto.
Buscar en: tablero frontal de la moto (placa blanca/negra o amarilla), laterales, casco.
Ejemplos: 27, 80, 98, 16. Ignorar años (2024, 2025) y marcas.
JSON solo: {"numbers":[{"value":"27","confidence":0.95}]}`;

async function detectOnce(imageUrl: string, detail: "low" | "high") {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 300,
    temperature: 0.1,
    messages: [
      { role: "system", content: PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "¿Qué dorsales ves?" },
          { type: "image_url", image_url: { url: imageUrl, detail } },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });
  const raw = response.choices[0]?.message?.content ?? '{"numbers":[]}';
  return parseNumbersFromJson(raw);
}

export async function detectWithOpenAI(imageUrl: string) {
  let n = await detectOnce(imageUrl, "high");
  if (n.length === 0) n = await detectOnce(imageUrl, "low");
  return n;
}
