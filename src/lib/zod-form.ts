import { z } from "zod";

/** Acepta string, null o vacío desde formularios/JSON; normaliza a string | undefined. */
export const optionalText = z.preprocess((val) => {
  if (val === null || val === undefined) return undefined;
  const text = String(val).trim();
  return text.length > 0 ? text : undefined;
}, z.string().optional());

export const optionalUrlText = z.preprocess((val) => {
  if (val === null || val === undefined) return undefined;
  const text = String(val).trim();
  return text.length > 0 ? text : undefined;
}, z.string().optional());

export function formatApiError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (Array.isArray(error)) {
    const first = error[0];
    if (first && typeof first === "object" && "message" in first) {
      return String((first as { message: string }).message);
    }
  }
  return "No pudimos completar la acción. Revisá tu conexión e intentá de nuevo.";
}
