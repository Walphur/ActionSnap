import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null, fallback: string): string {
  if (!value) return fallback;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return fallback;
}

function loginPathForIntent(intent: string | null): string {
  return intent === "racer" ? "/mis-compras" : "/fotografos/login";
}

/**
 * Base pública para las redirecciones. En Render la app corre detrás de un proxy
 * en el puerto interno 10000, por lo que `request.url` apunta a http://localhost:10000.
 * Usamos NEXT_PUBLIC_APP_URL (o el host reenviado por el proxy) para no filtrar esa
 * URL interna al navegador.
 */
function resolveBaseUrl(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const baseUrl = resolveBaseUrl(request);
  const code = request.nextUrl.searchParams.get("code");
  const nextParam = request.nextUrl.searchParams.get("next");
  const intent = request.nextUrl.searchParams.get("intent");
  const oauthError = request.nextUrl.searchParams.get("error");
  const oauthErrorDescription = request.nextUrl.searchParams.get("error_description");

  if (oauthError) {
    const login = new URL(loginPathForIntent(intent), baseUrl);
    login.searchParams.set(
      "error",
      oauthErrorDescription ?? oauthError
    );
    return NextResponse.redirect(login);
  }

  if (!code) {
    const login = new URL(loginPathForIntent(intent), baseUrl);
    login.searchParams.set("error", "oauth");
    return NextResponse.redirect(login);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const login = new URL(loginPathForIntent(intent), baseUrl);
    login.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(login);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultNext = intent === "racer" ? "/mis-compras" : "/fotografos";

  if (user) {
    const service = createServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (intent === "racer") {
      if (profile?.role === "photographer" || profile?.role === "admin") {
        await supabase.auth.signOut();
        const login = new URL("/mis-compras", baseUrl);
        login.searchParams.set("error", "not-racer");
        return NextResponse.redirect(login);
      }

      if (profile && profile.role !== "racer") {
        await service.from("profiles").update({ role: "racer" }).eq("id", user.id);
      }

      defaultNext = "/mis-compras";
    } else if (!nextParam) {
      if (profile?.role === "admin") defaultNext = "/admin";
      else if (profile?.role === "racer") defaultNext = "/mis-compras";
      else defaultNext = "/fotografos";
    }
  }

  const redirectPath = safeNextPath(nextParam, defaultNext);
  return NextResponse.redirect(new URL(redirectPath, baseUrl));
}
