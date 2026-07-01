import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventFilters } from "@/components/EventFilters";
import { EventHero } from "@/components/EventHero";
import { PhotoGrid } from "@/components/PhotoGrid";
import { getPaymentProvider, paymentProviderLabel } from "@/lib/payments";
import { getEventDisplayCover } from "@/lib/event-cover";
import type { Event, PhotoWithNumbers } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ numero?: string; color?: string }>;
};

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

  let query = supabase
    .from("photos")
    .select("*, photo_numbers(number, confidence)")
    .eq("event_id", ev.id)
    .order("created_at", { ascending: false });

  const showColorFilter = (ev.sport ?? "").toLowerCase() === "motocross";
  if (showColorFilter && color && color !== "todos") {
    query = query
      .eq("ai_status", "manual")
      .or(`bike_color.eq.${color},rider_color.eq.${color}`);
  }

  if (numero) {
    const searchNum = numero.trim().replace(/\D/g, "");
    if (!searchNum) {
      // ignore empty search
    } else {
      const { data: eventPhotos } = await supabase
        .from("photos")
        .select("id")
        .eq("event_id", ev.id);
      const eventPhotoIds = (eventPhotos ?? []).map((p) => p.id);

      const { data: photosWithTags } = await supabase
        .from("photos")
        .select("id, photo_numbers(number)")
        .eq("event_id", ev.id);

      const taggedCount =
        photosWithTags?.filter((p) => (p.photo_numbers?.length ?? 0) > 0).length ?? 0;

      const { data: matched } =
        eventPhotoIds.length > 0
          ? await supabase
              .from("photo_numbers")
              .select("photo_id")
              .eq("number", searchNum)
              .in("photo_id", eventPhotoIds)
          : { data: [] };

      const ids = [...new Set((matched ?? []).map((m) => m.photo_id))];

      if (ids.length === 0) {
        return (
          <div>
            <EventHero event={ev} photoCount={totalPhotos ?? 0} coverUrl={displayCover} />
            <Suspense
              fallback={<div className="card mb-8 h-32 animate-pulse bg-[var(--surface)]" />}
            >
              <div className="mb-8">
                <EventFilters eventSlug={slug} sport={ev.sport ?? undefined} />
              </div>
            </Suspense>
            <div className="card px-8 py-14 text-center">
              <p className="font-display text-xl font-bold">
                No encontramos fotos con el dorsal #{searchNum}
              </p>
              {taggedCount === 0 ? (
                <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
                  Las fotos de este evento se están organizando con IA. Probá buscar en la
                  galería completa o volvé más tarde.
                </p>
              ) : (
                <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
                  Revisá que el número sea correcto o explorá todas las fotos del evento.
                </p>
              )}
              <Link href={`/eventos/${slug}`} className="btn-primary mt-8 inline-flex">
                Ver galería completa
              </Link>
            </div>
          </div>
        );
      }
      query = query.in("id", ids);
    }
  }

  const { data: photos } = await query;
  const list = (photos ?? []) as PhotoWithNumbers[];
  const searchNum = numero?.trim().replace(/\D/g, "") || undefined;
  const paymentProvider = getPaymentProvider();
  const paymentLabel = paymentProvider
    ? paymentProviderLabel(paymentProvider)
    : null;

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
            {color && color !== "todos" && (
              <span className="text-[var(--muted)]">
                {" "}
                ·{" "}
                {showColorFilter ? `moto ${color}` : `categoría ${color}`}
              </span>
            )}
            <span className="text-[var(--muted)]"> · {list.length} foto(s)</span>
          </p>
        )}
      </div>

      {list.length === 0 ? (
        <div className="card px-8 py-14 text-center">
          <p className="font-display text-xl font-bold">Galería en preparación</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            Todavía no hay fotos publicadas para este evento. Volvé pronto.
          </p>
          <Link href="/" className="btn-secondary mt-8 inline-flex">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <PhotoGrid
          photos={list}
          priceCents={ev.price_per_photo_cents}
          eventSlug={slug}
          eventTitle={ev.title}
          packDiscountPercent={ev.pack_discount_percent ?? 20}
          filterDorsal={searchNum}
          paymentLabel={paymentLabel}
        />
      )}
    </div>
  );
}
