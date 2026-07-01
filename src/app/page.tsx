import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { attachEventCovers, type EventWithCover } from "@/lib/event-cover";
import { PLATFORM } from "@/lib/platform";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${PLATFORM.name} — Vendé tus coberturas deportivas en automático`,
  description:
    "Subí tu galería, la IA etiqueta dorsales y cobrás directo en Mercado Pago. Entrega HD instantánea para pilotos.",
  openGraph: {
    title: "Tus fotos deportivas, vendidas en piloto automático.",
    description:
      "Plataforma para fotógrafos deportivos: IA, Mercado Pago y descargas HD sin fricción.",
  },
};

export default async function HomePage() {
  let events: EventWithCover[] = [];
  let configError = false;

  try {
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("event_date", { ascending: false })
        .limit(4);

      events = await attachEventCovers(supabase, (data ?? []) as Event[]);
    } else {
      configError = true;
    }
  } catch {
    configError = true;
  }

  return <LandingPage events={events} configError={configError} />;
}
