import { NextResponse } from "next/server";
import {
  exchangeMercadoPagoOAuthCode,
  getMercadoPagoRedirectUri,
  resolveAppUrl,
  normalizeMpCollectorId,
} from "@/lib/mercadopago";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const STATE_COOKIE = "mp_oauth_state";

export async function GET(request: Request) {
  const appUrl = resolveAppUrl(request.url);
  const settingsUrl = new URL("/fotografos?tab=settings", appUrl);

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");

    if (oauthError) {
      settingsUrl.searchParams.set("mp", "error");
      settingsUrl.searchParams.set("reason", oauthError);
      return NextResponse.redirect(settingsUrl);
    }

    if (!code || !state) {
      settingsUrl.searchParams.set("mp", "error");
      settingsUrl.searchParams.set("reason", "missing_code");
      return NextResponse.redirect(settingsUrl);
    }

    const cookieState = request.headers
      .get("cookie")
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${STATE_COOKIE}=`))
      ?.slice(STATE_COOKIE.length + 1);

    if (!cookieState || cookieState !== state) {
      settingsUrl.searchParams.set("mp", "error");
      settingsUrl.searchParams.set("reason", "invalid_state");
      return NextResponse.redirect(settingsUrl);
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/fotografos/login?next=/fotografos", appUrl));
    }

    const redirectUri = getMercadoPagoRedirectUri(appUrl);
    const tokenData = await exchangeMercadoPagoOAuthCode({ code, redirectUri });
    const collectorId = normalizeMpCollectorId(tokenData.user_id);

    const service = createServiceClient();
    const { error } = await service
      .from("profiles")
      .update({
        mp_seller_id: collectorId,
        mp_receiver_id: collectorId,
      })
      .eq("id", user.id)
      .eq("role", "photographer");

    if (error) {
      settingsUrl.searchParams.set("mp", "error");
      settingsUrl.searchParams.set("reason", "db");
      return NextResponse.redirect(settingsUrl);
    }

    settingsUrl.searchParams.set("mp", "connected");
    const response = NextResponse.redirect(settingsUrl);
    response.cookies.set(STATE_COOKIE, "", { maxAge: 0, path: "/" });
    return response;
  } catch (e) {
    settingsUrl.searchParams.set("mp", "error");
    settingsUrl.searchParams.set(
      "reason",
      e instanceof Error ? e.message : "oauth_failed"
    );
    return NextResponse.redirect(settingsUrl);
  }
}
