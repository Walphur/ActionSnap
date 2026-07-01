import type { SupabaseClient } from "@supabase/supabase-js";

function isMissingColumnError(message: string, column: string): boolean {
  const lower = message.toLowerCase();
  const col = column.toLowerCase();
  return (
    lower.includes(col) &&
    (lower.includes("schema cache") ||
      lower.includes("does not exist") ||
      lower.includes("could not find"))
  );
}

function stripMissingColumn(payload: Record<string, unknown>, errorMessage: string) {
  const next = { ...payload };
  for (const key of Object.keys(next)) {
    if (isMissingColumnError(errorMessage, key)) {
      delete next[key];
      return next;
    }
  }
  return null;
}

export async function insertPhotoRow(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
): Promise<{ id: string | null; error: string | null }> {
  let current = { ...payload };
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { data, error } = await supabase
      .from("photos")
      .insert(current)
      .select("id")
      .single();

    if (!error) {
      return { id: data?.id ?? null, error: null };
    }

    lastError = error.message;
    const next = stripMissingColumn(current, error.message);
    if (!next) break;
    current = next;
  }

  return { id: null, error: lastError };
}

export function photosSchemaHint(errorMessage: string): string | undefined {
  if (isMissingColumnError(errorMessage, "photographer_id")) {
    return "Ejecutá en Supabase SQL Editor el bloque de columnas photos de supabase/RUN-THIS-NOW.sql.";
  }
  return undefined;
}
