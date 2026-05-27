"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EventShowcaseCard } from "@/components/EventShowcaseCard";
import { EventSportFilter } from "@/components/EventSportFilter";
import { HowItWorks } from "@/components/HowItWorks";
import { HeroCinematic } from "@/components/home/HeroCinematic";
import { PhotoSearchHero } from "@/components/home/PhotoSearchHero";
import { PhotographerPitch } from "@/components/home/PhotographerPitch";
import { TrustSection } from "@/components/home/TrustSection";
import { normalizeSport, PLATFORM, type HomeStats } from "@/lib/platform";

const HERO_FALLBACK = "/banner-upload-motocross.png";

type EventItem = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  sport?: string | null;
  event_date: string;
  price_per_photo_cents: number;
  displayCoverUrl: string | null;
  photoCount: number;
};

type Props = {
  events: EventItem[];
  configError: boolean;
  stats: HomeStats;
};

export function CinematicHome({ events, configError, stats }: Props) {
  const [sportFilter, setSportFilter] = useState("todos");

  const sportKeys = useMemo(
    () => [...new Set(events.map((e) => normalizeSport(e.sport)))],
    [events]
  );
  const filteredEvents = useMemo(
    () =>
      sportFilter === "todos"
        ? events
        : events.filter((e) => normalizeSport(e.sport) === sportFilter),
    [events, sportFilter]
  );

  const eventOptions = useMemo(
    () => events.map((e) => ({ id: e.id, slug: e.slug, title: e.title })),
    [events]
  );

  return (
    <div className="home-page">
      <HeroCinematic />

      <div className="home-page-body">
        {configError && (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Conectá Supabase en <code>.env.local</code> para listar eventos reales.
          </p>
        )}

        <PhotoSearchHero events={eventOptions} />

        <TrustSection stats={stats} />

        <HowItWorks />

        <section id="eventos" className="events-section">
          <div className="section-diagonal section-diagonal--events" aria-hidden />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="trust-kicker">Explorar eventos</p>
              <h2 className="font-display section-heading">Eventos en vivo</h2>
              <p className="section-lead">Galerías premium listas para comprar.</p>
            </div>
            <Link href="/explorar" className="btn-ghost text-sm">
              Ver todos →
            </Link>
          </div>

          {sportKeys.length > 1 && (
            <div className="mt-6">
              <EventSportFilter sports={sportKeys} active={sportFilter} onChange={setSportFilter} />
            </div>
          )}

          {filteredEvents.length === 0 ? (
            <p className="mt-10 text-center text-[var(--muted)]">No hay eventos en esta categoría.</p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, idx) => (
                <EventShowcaseCard
                  key={event.id}
                  index={idx}
                  slug={event.slug}
                  title={event.title}
                  sport={event.sport}
                  eventDate={event.event_date}
                  location={event.location}
                  photoCount={event.photoCount}
                  priceCents={event.price_per_photo_cents}
                  coverUrl={event.displayCoverUrl}
                  fallbackCover={HERO_FALLBACK}
                  featured={idx === 0 && filteredEvents.length > 2}
                />
              ))}
            </div>
          )}
        </section>

        <PhotographerPitch />

        <section className="marketplace-banner glass-panel glow-accent">
          <p className="trust-kicker">{PLATFORM.tagline}</p>
          <h2 className="font-display text-2xl uppercase tracking-wide text-white md:text-4xl">
            Marketplace de fotografía deportiva
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/70 md:text-base">
            No es un portfolio ni una galería simple: es la forma más rápida de encontrar,
            pagar y descargar tus fotos de competencia.
          </p>
        </section>
      </div>
    </div>
  );
}
