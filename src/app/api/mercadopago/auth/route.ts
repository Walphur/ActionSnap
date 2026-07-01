import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { buildMercadoPagoAuthUrl, getMercadoPagoRedirectUri } from "@/lib/mercadopago";
import { createClient } from "@/lib/supabase/server";

const STATE_COOKIE = "mp_oauth_state";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/fotografos/login?next=/fotografos", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "photographer") {
      return NextResponse.json(
        { error: "Solo fotógrafos pueden vincular Mercado Pago" },
        { status: 403 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const redirectUri = getMercadoPagoRedirectUri(appUrl);
    const state = randomUUID();

    const authUrl = buildMercadoPagoAuthUrl({ state, redirectUri });
    const response = NextResponse.redirect(authUrl);

    response.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (e) {
    const message = e instanceof Error ? e.message : "No se pudo iniciar OAuth";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const settingsUrl = new URL("/fotografos?tab=settings", appUrl);
    settingsUrl.searchParams.set("mp", "error");
    settingsUrl.searchParams.set("reason", message);
    return NextResponse.redirect(settingsUrl);
  }
}
