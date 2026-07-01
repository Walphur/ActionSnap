import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export type RacerProfile = {
  id: string;
  full_name: string | null;
  role: string;
};

export type RacerSession =
  | { ok: true; userId: string; email: string; profile: RacerProfile }
  | { ok: false; reason: "unauthenticated" | "not-racer" | "no-profile" };

/** Vincula compras pagadas por email al usuario recién autenticado. */
export async function linkPurchasesToUser(userId: string, email: string) {
  const supabase = createServiceClient();
  const normalized = email.trim().toLowerCase();

  await supabase
    .from("purchases")
    .update({ user_id: userId })
    .eq("status", "paid")
    .is("user_id", null)
    .ilike("email", normalized);
}

export async function getRacerSession(): Promise<RacerSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false, reason: "unauthenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { ok: false, reason: "no-profile" };
  }

  if (profile.role === "photographer" || profile.role === "admin") {
    return { ok: false, reason: "not-racer" };
  }

  await linkPurchasesToUser(user.id, user.email);

  return {
    ok: true,
    userId: user.id,
    email: user.email,
    profile: profile as RacerProfile,
  };
}

export async function requireRacerSession(): Promise<
  Extract<RacerSession, { ok: true }>
> {
  const session = await getRacerSession();
  if (!session.ok) {
    if (session.reason === "not-racer") {
      throw new Error("Esta cuenta no es de piloto/atleta.");
    }
    throw new Error("No autenticado");
  }
  return session;
}
