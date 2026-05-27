import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/env";
import { getDetectionProviders } from "@/lib/detect-numbers";
import { getPaymentProvider, paymentProviderLabel } from "@/lib/payments";

export async function GET() {
  const supabase = getSupabaseEnv();
  const providers = getDetectionProviders();
  const payment = getPaymentProvider();
  return NextResponse.json({
    supabaseUrl: Boolean(supabase.url),
    supabaseAnon: Boolean(supabase.anonKey),
    supabaseService: Boolean(supabase.serviceKey),
    missing: supabase.missing,
    ready: supabase.missing.length === 0,
    aiProviders: providers,
    aiReady: providers.length > 0,
    paymentProvider: payment,
    paymentLabel: payment ? paymentProviderLabel(payment) : null,
  });
}
