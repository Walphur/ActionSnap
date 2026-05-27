"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EventShowcaseCard } from "@/components/EventShowcaseCard";
import { EventSportFilter } from "@/components/EventSportFilter";
import { HowItWorks } from "@/components/HowItWorks";
import { normalizeSport, PLATFORM } from "@/lib/platform";

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
};

const sports = ["Motocross", "Triatlón", "Rally", "Cuatri"];

export function CinematicHome({ events, configError }: Props) {
  const [sportFilter, setSportFilter] = useState("todos");
  const [searchNumber, setSearchNumber] = useState("");
  const [searchEventId, setSearchEventId] = useState("");

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
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === searchEventId) ?? null,
    [events, searchEventId]
  );

  return (
    <div className="-mt-6 space-y-20 pb-12 md:space-y-28">
      {/* Hero minimal */}
      <section className="hero-minimal -mx-4 sm:-mx-6">
        <img src={HERO_FALLBACK} alt="" className="hero-minimal-bg" />
        <div className="hero-minimal-overlay" />
        <div className="hero-minimal-content">
          <p className="text-sm text-white/70">{PLATFORM.tagline}</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white md:text-5xl md:leading-[1.1]">
            Encontrá y comprá tus fotos deportivas en segundos
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/75">{PLATFORM.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#eventos" className="btn-primary">
              Ver eventos
            </Link>
            <Link href="#buscar" className="btn-ghost">
              Buscar por dorsal
            </Link>
          </div>
        </div>
      </section>

      {configError && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Conectá Supabase en <code>.env.local</code> para listar eventos reales.
        </p>
      )}

      <HowItWorks />

      {/* Búsqueda */}
      <section id="buscar" className="section-minimal">
        <h2 className="section-title">Buscar mis fotos</h2>
        <p className="section-lead">Elegí el evento e ingresá tu número de dorsal.</p>
        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedEvent) return;
            const n = searchNumber.trim();
            const q = n ? `?numero=${encodeURIComponent(n)}` : "";
            window.location.href = `/eventos/${selectedEvent.slug}${q}`;
          }}
        >
          <div className="flex-1">
            <label className="label-minimal">Evento</label>
            <select
              value={searchEventId}
              onChange={(e) => setSearchEventId(e.target.value)}
              className="field-input mt-1.5 w-full"
            >
              <option value="">Seleccionar evento</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-40">
            <label className="label-minimal">Dorsal</label>
            <input
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              placeholder="Ej. 27"
              inputMode="numeric"
              className="field-input field-input--hero mt-1.5 w-full"
            />
          </div>
          <button type="submit" className="btn-primary w-full sm:w-auto sm:px-8" disabled={!selectedEvent}>
            Buscar
          </button>
        </form>
      </section>

      {/* Eventos */}
      <section id="eventos" className="section-minimal">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Eventos</h2>
            <p className="section-lead">Galerías disponibles para comprar.</p>
          </div>
          <Link href="/fotografos/login?next=/fotografos" className="btn-ghost text-sm">
            Soy fotógrafo →
          </Link>
        </div>

        {sportKeys.length > 1 && (
          <div className="mt-6">
            <EventSportFilter sports={sportKeys} active={sportFilter} onChange={setSportFilter} />
          </div>
        )}

        {filteredEvents.length === 0 ? (
          <p className="mt-8 text-center text-[var(--muted)]">No hay eventos en esta categoría.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, idx) => (
              <EventShowcaseCard
                key={event.id}
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

      {/* Fotógrafos — bloque simple */}
      <section className="section-minimal rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent-muted)] p-6 md:p-8">
        <h2 className="section-title">Para fotógrafos</h2>
        <p className="section-lead max-w-xl">
          Publicá eventos, vendé por dorsal y cobrá online. Comisión plataforma{" "}
          {PLATFORM.commissionPercent}% — vos te quedás con {PLATFORM.photographerSharePercent}%.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/fotografos/registro" className="btn-primary">
            Crear cuenta
          </Link>
          <Link href="/para-fotografos" className="btn-ghost">
            Más info
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {sports.map((s) => (
            <span key={s} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
              {s}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
