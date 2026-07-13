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

export function profilesSchemaHint(errorMessage: string): string | undefined {
  if (
    isMissingColumnError(errorMessage, "watermark_text") ||
    isMissingColumnError(errorMessage, "watermark_use_logo") ||
    isMissingColumnError(errorMessage, "bank_cbu") ||
    isMissingColumnError(errorMessage, "accepts_bank_transfer")
  ) {
    return "Ejecutá en Supabase SQL Editor el contenido de supabase/sync-missing-columns.sql.";
  }
  return undefined;
}

export async function updateProfileRow(
  supabase: SupabaseClient,
  userId: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; error: string | null; skippedKeys: string[] }> {
  let current = { ...payload };
  const skippedKeys: string[] = [];
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (Object.keys(current).length === 0) {
      return { ok: false, error: lastError, skippedKeys };
    }

    const { error } = await supabase.from("profiles").update(current).eq("id", userId);

    if (!error) {
      return { ok: true, error: null, skippedKeys };
    }

    lastError = error.message;
    const next = stripMissingColumn(current, error.message);
    if (!next) break;

    for (const key of Object.keys(current)) {
      if (!(key in next)) skippedKeys.push(key);
    }
    current = next;
  }

  return { ok: false, error: lastError, skippedKeys };
}
