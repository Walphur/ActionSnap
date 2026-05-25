export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  return { url, anonKey, serviceKey, missing };
}

export function assertSupabaseEnv() {
  const env = getSupabaseEnv();
  if (env.missing.length > 0) {
    throw new Error(
      `Faltan variables en .env.local: ${env.missing.join(", ")}. Guardá el archivo y reiniciá "npm run dev".`
    );
  }
  return env as { url: string; anonKey: string; serviceKey: string };
}
