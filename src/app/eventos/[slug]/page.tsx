import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventFilters } from "@/components/EventFilters";
import { EventHero } from "@/components/EventHero";
import { EventPhotoGallery } from "@/components/EventPhotoGallery";
import { getPaymentProvider, paymentProviderLabel } from "@/lib/payments";
import { getEventDisplayCover } from "@/lib/event-cover";
import { PLATFORM } from "@/lib/platform";
import type { Event } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ numero?: string; color?: string }>;
};

type EventRow = Event & { photographer_id?: string | null };

async function getPhotographerName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  photographerId?: string | null
): Promise<string> {
  if (!photographerId) return "nuestros fotógrafos";

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", photographerId)
    .maybeSingle();

  const name = profile?.full_name?.trim();
  return name || "nuestros fotógrafos";
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const pageUrl = `${appUrl}/eventos/${slug}`;

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!event) {
    return { title: `Evento no encontrado — ${PLATFORM.name}` };
  }

  const ev = event as EventRow;
  const coverUrl = (await getEventDisplayCover(supabase, ev)) ?? ev.cover_url;
  const photographerName = await getPhotographerName(supabase, ev.photographer_id);
  const title = `Fotos de ${ev.title} - ${PLATFORM.name}`;
  const description = `Buscá tus fotos en HD por número de dorsal o piloto en ${PLATFORM.name}. Cobertura en directo por ${photographerName}.`;
  const ogImage =
    coverUrl ??
    (PLATFORM.heroImageSrc.startsWith("http")
      ? PLATFORM.heroImageSrc
      : `${appUrl}${PLATFORM.heroImageSrc}`);

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: PLATFORM.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Portada — ${ev.title}`,
        },
      ],
      locale: "es_AR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function EventPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { numero, color } = await searchParams;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!event) notFound();
  const ev = event as Event;
  const displayCover = await getEventDisplayCover(supabase, ev);

  const { count: totalPhotos } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("event_id", ev.id);

  const searchNum = numero?.trim().replace(/\D/g, "") || undefined;
  const filterColor = color && color !== "todos" ? color : undefined;
  const paymentProvider = getPaymentProvider();
  const paymentLabel = paymentProvider ? paymentProviderLabel(paymentProvider) : null;

  return (
    <div>
      <EventHero event={ev} photoCount={totalPhotos ?? 0} coverUrl={displayCover} />

      <div className="mb-8">
        <Suspense
          fallback={<div className="card h-32 animate-pulse bg-[var(--surface)]" />}
        >
          <EventFilters eventSlug={slug} sport={ev.sport ?? undefined} />
        </Suspense>
        {searchNum && (
          <p className="mt-4 text-sm">
            <span className="text-[var(--muted)]">Resultados para </span>
            <span className="font-display font-bold text-[var(--accent)]">
              dorsal #{searchNum}
            </span>
            {filterColor && (
              <span className="text-[var(--muted)]">
                {" "}
                · moto {filterColor}
              </span>
            )}
          </p>
        )}
      </div>

      <EventPhotoGallery
        eventSlug={slug}
        eventTitle={ev.title}
        priceCents={ev.price_per_photo_cents}
        packDiscountPercent={ev.pack_discount_percent ?? 20}
        filterDorsal={searchNum}
        filterColor={filterColor}
        paymentLabel={paymentLabel}
        totalPhotos={totalPhotos ?? 0}
      />
    </div>
  );
}
