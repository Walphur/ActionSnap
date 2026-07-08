import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/env";
import { getPaymentProvider, paymentProviderLabel } from "@/lib/payments";
import { hasR2 } from "@/lib/r2/client";

export async function GET() {
  const supabase = getSupabaseEnv();
  const payment = getPaymentProvider();
  return NextResponse.json({
    supabaseUrl: Boolean(supabase.url),
    supabaseAnon: Boolean(supabase.anonKey),
    supabaseService: Boolean(supabase.serviceKey),
    missing: supabase.missing,
    ready: supabase.missing.length === 0,
    paymentProvider: payment,
    paymentLabel: payment ? paymentProviderLabel(payment) : null,
    photoStorage: hasR2() ? "r2" : "supabase",
    r2Configured: hasR2(),
  });
}
