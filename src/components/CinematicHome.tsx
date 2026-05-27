"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useState, type CSSProperties } from "react";
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

const marketplaceHighlights = [
  "Búsqueda por dorsal",
  "Pago con Mercado Pago",
  "Descarga HD + ZIP",
  "Panel para fotógrafos",
];

const photographerSteps = [
  { k: "Publicá", v: "Creá eventos por deporte y subí lotes con marca de agua" },
  { k: "Vendé", v: "Los atletas buscan por dorsal y compran al instante" },
  { k: "Cobrá", v: `Te quedás con el ${PLATFORM.photographerSharePercent}% · comisión ${PLATFORM.commissionPercent}%` },
];

const uploadableSports = [
  { label: "Motocross", image: "/banner-upload-motocross.png" },
  { label: "Triatlón", image: "/banner-upload-triatlon.png" },
  { label: "Rally", image: "/banner-upload-rally.png" },
  { label: "Cuatri", image: "/banner-upload-cuatri.png" },
];

const testimonials = [
  {
    author: "Agustín M.",
    role: "Piloto amateur",
    text: "Encontré mis fotos por dorsal y las compré en menos de un minuto.",
  },
  {
    author: "Lucía R.",
    role: "Fotógrafa de eventos",
    text: `Subo la galería, ${PLATFORM.name} cobra y entrega automático. Sin ir por WhatsApp.`,
  },
  {
    author: "Equipo Norte",
    role: "Organizador",
    text: "Cada fotógrafo publica su evento y los corredores compran directo desde la plataforma.",
  },
];

export function CinematicHome({ events, configError }: Props) {
  const [sportFilter, setSportFilter] = useState("todos");
  const [searchNumber, setSearchNumber] = useState("");
  const [searchEventId, setSearchEventId] = useState("");
  const sports = useMemo(
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
    () => events.find((event) => event.id === searchEventId) ?? null,
    [events, searchEventId]
  );

  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.35]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const particlesY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -220]);

  const reveal = {
    initial: { opacity: 0, y: 36, filter: "blur(8px)" },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.65, ease: "easeOut" as const },
  };

  return (
    <div className="-mt-10 space-y-24 pb-8 md:space-y-28">
      <section className="relative -mx-4 min-h-[100vh] overflow-hidden border-y border-white/10 sm:-mx-6 md:rounded-[28px] md:border md:border-white/10">
        <motion.video
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_FALLBACK}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-motocross-training-2346/1080p.mp4"
            type="video/mp4"
          />
        </motion.video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/70 to-black/95" />
        <motion.div style={{ y: glowY }} className="hero-light absolute inset-0" />
        <div className="smoke-layer absolute inset-0" />
        <div className="dirt-layer absolute inset-0" />
        <motion.div style={{ y: particlesY }} className="dust-particles absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="dust-particle"
              style={
                {
                  left: `${(i * 13) % 100}%`,
                  top: `${(i * 7) % 100}%`,
                  animationDelay: `${(i % 8) * 0.8}s`,
                  animationDuration: `${8 + (i % 6)}s`,
                } as CSSProperties
              }
            />
          ))}
        </motion.div>

        <div className="relative z-10 flex min-h-[92vh] flex-col justify-end px-6 pb-10 pt-24 md:px-12 md:pb-14">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.42em] text-white/75"
          >
            {PLATFORM.name} · {PLATFORM.tagline}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display max-w-5xl text-4xl font-extrabold uppercase leading-[0.88] text-white md:text-7xl"
          >
            Marketplace para vender fotos de eventos deportivos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-6 max-w-2xl text-sm text-white/80 md:text-base"
          >
            {PLATFORM.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Link href="#eventos" className="btn-primary">
              Ver eventos
            </Link>
            <Link href="#buscar-fotos" className="btn-secondary border-white/25 bg-black/35">
              Buscar mis fotos
            </Link>
            <Link href="/fotografos/login?next=/fotografos" className="btn-racing">
              Subir evento
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05 }}
            className="mt-10 grid max-w-3xl grid-cols-2 gap-3 text-xs uppercase tracking-[0.18em] text-white/70 md:grid-cols-4"
          >
            {marketplaceHighlights.map((k) => (
              <div key={k} className="glass rounded-xl px-3 py-2 text-center">
                {k}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {configError && (
        <div className="rounded-[var(--radius-lg)] border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100/90">
          Modo demo: conectá Supabase en <code>.env.local</code> para listar eventos reales.
        </div>
      )}

      <HowItWorks />

      <motion.section id="buscar-fotos" className="search-panel space-y-6" {...reveal}>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">
          Para corredores
        </p>
        <h2 className="font-display text-3xl font-extrabold uppercase md:text-5xl">
          Buscá tus fotos al instante
        </h2>
        <p className="max-w-2xl text-sm text-white/70 md:text-base">
          Elegí el evento, ingresá tu dorsal y comprá solo las fotos que te interesan.
        </p>
        <form
          className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedEvent) return;
            const number = searchNumber.trim();
            const query = number ? `?numero=${encodeURIComponent(number)}` : "";
            window.location.href = `/eventos/${selectedEvent.slug}${query}`;
          }}
        >
          <select
            value={searchEventId}
            onChange={(e) => setSearchEventId(e.target.value)}
            className="field-input"
          >
            <option value="">Elegí un evento</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
          <input
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value)}
            placeholder="Tu dorsal"
            inputMode="numeric"
            className="field-input field-input--hero"
          />
          <button type="submit" className="btn-primary cta-pulse" disabled={!selectedEvent}>
            Buscar fotos
          </button>
        </form>
      </motion.section>

      <motion.section
        id="fotografos"
        className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent p-6 md:p-10"
        {...reveal}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
          Para fotógrafos
        </p>
        <h3 className="font-display text-3xl font-extrabold uppercase md:text-5xl">
          Vendé tus fotos automáticamente
        </h3>
        <p className="max-w-2xl text-sm text-white/70 md:text-base">
          Subí galerías, cobrá online y entregá en HD sin coordinar por WhatsApp. {PLATFORM.name}{" "}
          retiene {PLATFORM.commissionPercent}% y el resto va a tu cuenta.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {photographerSteps.map((x) => (
            <div key={x.k} className="glass rounded-2xl border border-white/10 p-5">
              <p className="font-display text-lg font-bold uppercase">{x.k}</p>
              <p className="mt-2 text-sm text-white/70">{x.v}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/fotografos/registro" className="btn-primary">
            Crear cuenta gratis
          </Link>
          <Link href="/para-fotografos" className="btn-secondary bg-black/30">
            Ver cómo funciona
          </Link>
        </div>
      </motion.section>

      <motion.section className="space-y-6" {...reveal}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              Qué podés subir
            </p>
            <h3 className="font-display text-3xl font-extrabold uppercase md:text-5xl">
              Multideporte en un solo marketplace
            </h3>
          </div>
          <p className="max-w-xl text-sm text-white/65">
            Motocross, triatlón, rally, cuatri y más. Cada evento con su galería, precio y venta por
            dorsal.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {uploadableSports.map((item) => (
            <article
              key={item.label}
              className="group relative overflow-hidden rounded-2xl border border-white/10"
            >
              <img
                src={item.image}
                alt={`Ejemplo de ${item.label}`}
                className="h-60 w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="badge-sport absolute left-3 top-3">{item.label}</span>
              <p className="absolute bottom-3 left-3 text-sm font-semibold uppercase tracking-[0.14em] text-white">
                Listo para publicar
              </p>
            </article>
          ))}
        </div>
      </motion.section>

      <motion.section id="eventos" className="space-y-7" {...reveal}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
              Eventos en vivo
            </p>
            <h2 className="font-display text-3xl font-extrabold uppercase md:text-5xl">
              Galerías publicadas
            </h2>
          </div>
          <Link
            href="/fotografos/login?next=/fotografos"
            className="btn-racing hidden sm:inline-flex"
          >
            Publicar mi evento
          </Link>
        </div>

        {sports.length > 1 && (
          <EventSportFilter sports={sports} active={sportFilter} onChange={setSportFilter} />
        )}

        {filteredEvents.length === 0 ? (
          <div className="glass rounded-2xl border border-white/10 p-8 text-center">
            <p className="font-display text-2xl uppercase">Sin eventos en esta categoría</p>
            <p className="mt-2 text-sm text-white/65">
              Probá otro deporte o volvé más tarde.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(220px,auto)]">
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
                featured={idx % 5 === 0 || idx % 5 === 3}
              />
            ))}
          </div>
        )}
      </motion.section>

      <motion.section className="space-y-6" {...reveal}>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
          Confianza
        </p>
        <h3 className="font-display text-2xl font-bold uppercase md:text-4xl">
          Lo que dicen usuarios
        </h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {testimonials.map((item) => (
            <motion.article
              key={item.author}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.4 }}
              className="glass reveal-card rounded-2xl border border-white/10 p-6"
            >
              <p className="text-sm leading-relaxed text-white/85">“{item.text}”</p>
              <p className="mt-4 font-display text-sm font-bold uppercase">{item.author}</p>
              <p className="text-xs tracking-wide text-white/55">{item.role}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
