import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/format";
import { PhotoGrid } from "@/components/PhotoGrid";
import { EventFilters } from "@/components/EventFilters";
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

  let query = supabase
    .from("photos")
    .select("*, photo_numbers(number, confidence)")
    .eq("event_id", ev.id)
    .order("created_at", { ascending: false });

  if (color && color !== "todos") {
    query = query
      .eq("ai_status", "manual")
      .or(`bike_color.eq.${color},rider_color.eq.${color}`);
  }

  const { count: manualTaggedCount } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("event_id", ev.id)
    .eq("ai_status", "manual");

  if (numero) {
    const searchNum = numero.trim().replace(/\D/g, "");
    const { data: eventPhotos } = await supabase
      .from("photos")
      .select("id")
      .eq("event_id", ev.id)
      .eq("ai_status", "manual");
    const eventPhotoIds = (eventPhotos ?? []).map((p) => p.id);

    const taggedCount = manualTaggedCount ?? 0;

    const { data: matched } =
      eventPhotoIds.length > 0
        ? await supabase
            .from("photo_numbers")
            .select("photo_id")
            .eq("number", searchNum)
            .in("photo_id", eventPhotoIds)
        : { data: [] };

    const ids = (matched ?? []).map((m) => m.photo_id);

    if (ids.length === 0) {
      return (
        <EventLayout event={ev} numero={searchNum} taggedCount={taggedCount}>
          <div className="rounded-lg border border-[var(--border)] p-8 text-center text-[var(--muted)]">
            <p className="mb-3">
              No hay fotos etiquetadas con el dorsal <strong>#{searchNum}</strong>.
            </p>
            {(taggedCount ?? 0) === 0 ? (
              <p className="text-sm">
                Todavía ninguna foto tiene dorsales cargados. El fotógrafo debe
                etiquetarlos en <strong>/admin</strong> → &quot;Etiquetar dorsales&quot;.
              </p>
            ) : (
              <p className="text-sm">
                Probá otro número (uno por búsqueda, ej. <strong>9</strong> o{" "}
                <strong>34</strong>) o{" "}
                <a href={`/eventos/${slug}`} className="text-[var(--accent)] hover:underline">
                  ver todas las fotos
                </a>
                .
              </p>
            )}
          </div>
        </EventLayout>
      );
    }
    query = query.in("id", ids);
  }

  const { data: photos } = await query;
  const list = (photos ?? []) as PhotoWithNumbers[];

  return (
    <EventLayout
      event={ev}
      numero={numero?.trim().replace(/\D/g, "")}
      color={color}
      taggedCount={manualTaggedCount ?? 0}
    >
      {list.length === 0 ? (
        <p className="text-[var(--muted)]">Aún no hay fotos en esta carrera.</p>
      ) : (
        <PhotoGrid
          photos={list}
          priceCents={ev.price_per_photo_cents}
          eventSlug={slug}
        />
      )}
    </EventLayout>
  );
}

function EventLayout({
  event,
  numero,
  color,
  taggedCount = 0,
  children,
}: {
  event: Event;
  numero?: string;
  color?: string;
  taggedCount?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">{event.title}</h1>
        <p className="mt-1 text-[var(--muted)]">
          {formatDate(event.event_date)}
          {event.location ? ` · ${event.location}` : ""} ·{" "}
          {formatPrice(event.price_per_photo_cents)} por foto
        </p>
        {event.description && (
          <p className="mt-3 text-sm text-[var(--muted)]">{event.description}</p>
        )}
      </div>

      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-[var(--muted)]">
          Buscar por dorsal o color de moto
        </p>
        {taggedCount === 0 && !numero && !color && (
          <p className="mb-2 text-xs text-amber-400/90">
            Dorsales pendientes — en /admin usá &quot;Etiquetar dorsales&quot; (manual, 2 min por
            lote).
          </p>
        )}
        <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-[var(--border)]" />}>
          <EventFilters eventSlug={event.slug} />
        </Suspense>
        {(numero || (color && color !== "todos")) && (
          <p className="mt-2 text-sm text-[var(--accent)]">
            {numero && <>Dorsal #{numero}</>}
            {numero && color && color !== "todos" && " · "}
            {color && color !== "todos" && <>Color {color}</>}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}
