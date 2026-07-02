/**
 * Etiquetado automático (OCR / Google Vision / Gemini / OpenAI).
 *
 * **Flujo oficial del producto:** subir fotos → etiquetado manual → publicar.
 * La IA es opcional, experimental y no debe bloquear ningún paso del flujo.
 *
 * Pausado por defecto en producción: `DETECTION_DISABLED=true` en `.env`.
 * Para probar IA en desarrollo: `DETECTION_DISABLED=false` + credenciales.
 */
export function isAiTaggingEnabled(): boolean {
  return process.env.DETECTION_DISABLED !== "true";
}

/** Etiquetas de producto para UI experimental (no implica que el flujo dependa de IA). */
export const EXPERIMENTAL_AI_LABEL = "Experimental / Beta";
