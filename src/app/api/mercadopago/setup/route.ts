import { NextResponse } from "next/server";
import {
  getMercadoPagoOAuthPublicConfig,
  resolveAppUrl,
} from "@/lib/mercadopago";
import { createClient } from "@/lib/supabase/server";

/** Devuelve la Redirect URI exacta que debe estar en el panel de Mercado Pago. */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "photographer") {
      return NextResponse.json({ error: "Solo fotógrafos" }, { status: 403 });
    }

    const appUrl = resolveAppUrl(request.url);
    return NextResponse.json(getMercadoPagoOAuthPublicConfig(appUrl));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo leer la configuración" },
      { status: 500 }
    );
  }
}
