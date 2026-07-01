import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/fotografos";
  const intent = url.searchParams.get("intent");

  if (!code) {
    const loginPath = intent === "racer" ? "/mis-compras" : "/fotografos/login";
    return NextResponse.redirect(new URL(`${loginPath}?error=oauth`, request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginPath = intent === "racer" ? "/mis-compras" : "/fotografos/login";
    const login = new URL(loginPath, request.url);
    login.searchParams.set("error", error.message);
    return NextResponse.redirect(login);
  }

  if (intent === "racer") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const service = createServiceClient();
      const { data: profile } = await service
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role === "photographer" || profile?.role === "admin") {
        await supabase.auth.signOut();
        const login = new URL("/mis-compras", request.url);
        login.searchParams.set("error", "not-racer");
        return NextResponse.redirect(login);
      }

      if (profile && profile.role !== "racer") {
        await service.from("profiles").update({ role: "racer" }).eq("id", user.id);
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
