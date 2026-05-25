import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { assertSupabaseEnv, getSupabaseEnv } from "@/lib/env";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function createClient() {
  const cookieStore = await cookies();

  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) {
    throw new Error("Supabase no configurado en .env.local");
  }

  return createServerClient(url, anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  );
}

export function createServiceClient() {
  const { url, serviceKey } = assertSupabaseEnv();
  return createSupabaseClient(url, serviceKey);
}
