import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PhotographerPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/fotografos/login?next=/fotografos");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_active === false) {
    redirect("/fotografos/login?error=suspended");
  }

  if (profile && profile.role !== "photographer") {
    redirect("/fotografos/login?error=not-photographer");
  }

  return children;
}
