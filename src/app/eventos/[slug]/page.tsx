import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventFilters } from "@/components/EventFilters";
import { EventHero } from "@/components/EventHero";
import { EventPhotoGallery } from "@/components/EventPhotoGallery";
import { Skeleton } from "@/components/ui/Skeleton";
import { getPaymentProvider, paymentProviderLabel } from "@/lib/payments";
import { getEventDisplayCover } from "@/lib/event-cover";
import type { PhotoSortOrder } from "@/lib/sort-photos";
import { PLATFORM } from "@/lib/platform";
import type { Event } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ numero?: string; color?: string; orden?: string }>;
};

type EventRow = Event & { photographer_id?: string | null };

async function getPhotographerName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  photographerId?: string | null
): Promise<string> {
  if (!photographerId) return "Action Snap";

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", photographerId)
    .maybeSingle();

  const name = profile?.full_name?.trim();
  return name || "Action Snap";
}

async function getDistinctPilotCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string
): Promise<number | null> {
  const { data: eventPhotos } = await supabase
    .from("photos")
    .select("id")
    .eq("event_id", eventId)
    .eq("is_sold", false);

  const ids = (eventPhotos ?? []).map((p) => p.id);
  if (ids.length === 0) return null;

  const { data: numbers } = await supabase
    .from("photo_numbers")
    .select("number")
    .in("photo_id", ids);

  const unique = new Set((numbers ?? []).map((n) => n.number).filter(Boolean));
  return unique.size > 0 ? unique.size : null;
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
  const description = `Buscá tus fotos en HD por número de dorsal en ${PLATFORM.name}. Cobertura por ${photographerName}.`;
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
      images: [{ url: ogImage, width: 1200, height: 630, alt: `Portada — ${ev.title}` }],
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
  const { numero, color, orden } = await searchParams;
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

  const photographerName = await getPhotographerName(
    supabase,
    (event as EventRow).photographer_id
  );
  const pilotCount = await getDistinctPilotCount(supabase, ev.id);

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const shareUrl = `${appUrl}/eventos/${slug}`;

  const searchNum = numero?.trim().replace(/\D/g, "") || undefined;
  const filterColor = color && color !== "todos" ? color : undefined;
  const sortOrder = (orden as PhotoSortOrder) || "default";
  const paymentProvider = getPaymentProvider();
  const paymentLabel = paymentProvider ? paymentProviderLabel(paymentProvider) : null;

  return (
    <div className="buyer-event">
      <EventHero
        event={ev}
        photoCount={totalPhotos ?? 0}
        coverUrl={displayCover}
        photographerName={photographerName}
        pilotCount={pilotCount}
        shareUrl={shareUrl}
      />

      <Suspense
        fallback={
          <div className="buyer-filters">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-4 h-24 w-full" />
          </div>
        }
      >
        <EventFilters eventSlug={slug} sport={ev.sport ?? undefined} />
      </Suspense>

      <EventPhotoGallery
        eventSlug={slug}
        eventTitle={ev.title}
        priceCents={ev.price_per_photo_cents}
        packDiscountPercent={ev.pack_discount_percent ?? 20}
        filterDorsal={searchNum}
        filterColor={filterColor}
        sortOrder={sortOrder}
        paymentLabel={paymentLabel}
        totalPhotos={totalPhotos ?? 0}
      />
    </div>
  );
}
