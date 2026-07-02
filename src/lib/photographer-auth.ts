import type { User } from "@supabase/supabase-js";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export type PhotographerProfile = {
  id: string;
  full_name: string | null;
  role: string;
  is_active: boolean | null;
  mp_receiver_id: string | null;
  mp_seller_id: string | null;
  watermark_text: string | null;
  watermark_use_logo: boolean | null;
};

function fullNameFromUser(user: User): string | null {
  const name = String(user.user_metadata?.full_name ?? "").trim();
  return name || null;
}

function intendedPhotographerRole(user: User): boolean {
  const role = user.user_metadata?.role;
  return role === "photographer" || role === undefined || role === null || role === "";
}

/** Crea o repara el perfil en public.profiles (service role). */
export async function ensurePhotographerProfileRow(user: User): Promise<void> {
  const service = createServiceClient();

  const payload: Record<string, unknown> = {
    id: user.id,
    full_name: fullNameFromUser(user),
    role: "photographer",
  };

  const { error } = await service.from("profiles").upsert(payload, { onConflict: "id" });

  if (error) {
    throw new Error(`No se pudo crear el perfil: ${error.message}`);
  }

  // Si el trigger creó rol racer por defecto, corregir cuando vino del registro fotógrafo.
  if (intendedPhotographerRole(user)) {
    await service.from("profiles").update({ role: "photographer" }).eq("id", user.id);
  }
}

async function loadMpExtras(userId: string) {
  const supabase = await createClient();
  const defaults = {
    mp_receiver_id: null as string | null,
    mp_seller_id: null as string | null,
    watermark_text: null as string | null,
    watermark_use_logo: true as boolean | null,
  };

  const { data: extended, error } = await supabase
    .from("profiles")
    .select("mp_receiver_id, mp_seller_id, watermark_text, watermark_use_logo")
    .eq("id", userId)
    .maybeSingle();

  if (error || !extended) return defaults;

  return {
    mp_receiver_id: extended.mp_receiver_id ?? null,
    mp_seller_id: extended.mp_seller_id ?? null,
    watermark_text: extended.watermark_text ?? null,
    watermark_use_logo: extended.watermark_use_logo ?? true,
  };
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient();
  const res = await supabase.auth.getUser();
  return res.data.user?.id ?? null;
}

export async function requirePhotographerProfile(): Promise<PhotographerProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await ensurePhotographerProfileRow(user);
    const { data: created, error: reloadError } = await supabase
      .from("profiles")
      .select("id, full_name, role, is_active")
      .eq("id", user.id)
      .single();

    if (reloadError || !created) {
      throw new Error("Perfil de fotógrafo no encontrado");
    }
    profile = created;
  }

  if (profile.role !== "photographer") {
    if (intendedPhotographerRole(user)) {
      const service = createServiceClient();
      await service.from("profiles").update({ role: "photographer" }).eq("id", user.id);
      profile = { ...profile, role: "photographer" };
    } else {
      throw new Error("No sos fotógrafo");
    }
  }

  if (profile.is_active === false) {
    throw new Error("Cuenta suspendida");
  }

  const extras = await loadMpExtras(user.id);
  return { ...profile, ...extras } as PhotographerProfile;
}

export function isPhotographerAuthError(message: string): boolean {
  return (
    message === "No autenticado" ||
    message === "Perfil de fotógrafo no encontrado" ||
    message === "No sos fotógrafo" ||
    message === "Cuenta suspendida" ||
    message.startsWith("No se pudo crear el perfil")
  );
}
