import { createClient } from "@/lib/supabase/server";

export type AdminProfile = {
  id: string;
  full_name: string | null;
  role: string;
  is_active: boolean | null;
};

export async function getAdminProfile(): Promise<AdminProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") return null;
  return profile as AdminProfile;
}

export async function requireAdminProfile(): Promise<AdminProfile> {
  const profile = await getAdminProfile();
  if (!profile) {
    throw new Error("No autorizado");
  }
  return profile;
}
