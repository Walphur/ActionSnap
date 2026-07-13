import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isConfiguredAdminEmail } from "@/lib/admin-emails";

export type AdminProfile = {
  id: string;
  full_name: string | null;
  role: string;
  is_active: boolean | null;
};

async function promoteConfiguredAdmin(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  if (!isConfiguredAdminEmail(user.email)) return null;

  const service = createServiceClient();
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim() || null
      : null;

  const { data: profile } = await service
    .from("profiles")
    .select("id, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return profile as AdminProfile;
  }

  const { data: updated, error } = await service
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: profile?.full_name ?? fullName,
        role: "admin",
      },
      { onConflict: "id" }
    )
    .select("id, full_name, role, is_active")
    .single();

  if (error || !updated) return null;
  return updated as AdminProfile;
}

export async function resolveAdminAccess(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): Promise<AdminProfile | null> {
  const promoted = await promoteConfiguredAdmin(user);
  if (promoted) return promoted;

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("id, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") return null;
  return profile as AdminProfile;
}

export async function getAdminProfile(): Promise<AdminProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return resolveAdminAccess(user);
}

export async function requireAdminProfile(): Promise<AdminProfile> {
  const profile = await getAdminProfile();
  if (!profile) {
    throw new Error("No autorizado");
  }
  return profile;
}
