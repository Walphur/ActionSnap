import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  buildMercadoPagoAuthUrl,
  getMercadoPagoRedirectUri,
  resolveAppUrl,
} from "@/lib/mercadopago";
import {
  generatePkcePair,
  isMercadoPagoPkceEnabled,
  VERIFIER_COOKIE,
} from "@/lib/mercadopago-oauth";
import { createClient } from "@/lib/supabase/server";

const STATE_COOKIE = "mp_oauth_state";

export async function GET(request: Request) {
  try {
    const appUrl = resolveAppUrl(request.url);
    const redirectUri = getMercadoPagoRedirectUri(appUrl);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL(`/fotografos/login?next=/fotografos`, appUrl)
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

    if (!process.env.MERCADOPAGO_CLIENT_ID?.trim()) {
      throw new Error("MERCADOPAGO_CLIENT_ID no configurado en el servidor");
    }
    if (!process.env.MERCADOPAGO_CLIENT_SECRET?.trim()) {
      throw new Error("MERCADOPAGO_CLIENT_SECRET no configurado en el servidor");
    }

    const state = randomUUID();
    const pkce = isMercadoPagoPkceEnabled() ? generatePkcePair() : null;
    const authUrl = buildMercadoPagoAuthUrl({
      state,
      redirectUri,
      codeChallenge: pkce?.challenge,
    });
    const response = NextResponse.redirect(authUrl);

    const cookieBase = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 600,
      path: "/",
    };

    response.cookies.set(STATE_COOKIE, state, cookieBase);
    if (pkce) {
      response.cookies.set(VERIFIER_COOKIE, pkce.verifier, cookieBase);
    }

    return response;
  } catch (e) {
    const message = e instanceof Error ? e.message : "No se pudo iniciar OAuth";
    const appUrl = resolveAppUrl(request.url);
    const settingsUrl = new URL("/fotografos?tab=settings", appUrl);
    settingsUrl.searchParams.set("mp", "error");
    settingsUrl.searchParams.set("reason", message);
    return NextResponse.redirect(settingsUrl);
  }
}
