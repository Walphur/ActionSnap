import { createClient } from "@/lib/supabase/server";

export type PhotographerProfile = {
  id: string;
  full_name: string | null;
  role: string;
  mp_receiver_id: string | null;
  mp_seller_id: string | null;
  watermark_text: string | null;
  watermark_use_logo: boolean | null;
};

export async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient();
  const res = await supabase.auth.getUser();
  return res.data.user?.id ?? null;
}

export async function requirePhotographerProfile(): Promise<PhotographerProfile> {
  const supabase = await createClient();
  const res = await supabase.auth.getUser();
  const userId = res.data.user?.id;
  if (!userId) {
    throw new Error("No autenticado");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    throw new Error("Perfil de fotógrafo no encontrado");
  }

  if (profile.role !== "photographer") {
    throw new Error("No sos fotógrafo");
  }

  const extras = {
    mp_receiver_id: null as string | null,
    mp_seller_id: null as string | null,
    watermark_text: null as string | null,
    watermark_use_logo: true as boolean | null,
  };

  const { data: extended } = await supabase
    .from("profiles")
    .select("mp_receiver_id, mp_seller_id, watermark_text, watermark_use_logo")
    .eq("id", userId)
    .maybeSingle();

  if (extended) {
    extras.mp_receiver_id = extended.mp_receiver_id ?? null;
    extras.mp_seller_id = extended.mp_seller_id ?? null;
    extras.watermark_text = extended.watermark_text ?? null;
    extras.watermark_use_logo = extended.watermark_use_logo ?? true;
  }

  return { ...profile, ...extras } as PhotographerProfile;
}

