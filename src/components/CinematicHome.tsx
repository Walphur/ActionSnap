"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useState, type CSSProperties } from "react";
import { EventSportFilter } from "@/components/EventSportFilter";
import { HowItWorks } from "@/components/HowItWorks";
import { formatDate, formatPrice } from "@/lib/format";
import { formatSportLabel, normalizeSport, PLATFORM } from "@/lib/platform";

type EventItem = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  sport?: string | null;
  event_date: string;
  price_per_photo_cents: number;
  displayCoverUrl: string | null;
};

type Props = {
  events: EventItem[];
  configError: boolean;
};

const services = [
  "Cobertura de carrera completa",
  "Contenido para pilotos y marcas",
  "Edición premium con look documental",
  "Entrega en alta resolución y reels",
];

const sponsors = [
  "RED RAMP",
  "FOX STYLE",
  "DIRT LAB",
  "MONSTER TRACK",
  "MOTO X PRO",
  "RACE CORE",
];

const riders = [
  {
    name: "Franco Vega",
    category: "MX1 Pro",
    quote: "Cada frame parece póster de película.",
    image: "/banner-victor-films.png",
  },
  {
    name: "Lautaro Diaz",
    category: "MX2",
    quote: "Se siente velocidad real, barro y adrenalina.",
    image: "/banner-victor-films.png",
  },
];

const testimonials = [
  {
    author: "Agustin M.",
    role: "Piloto MX2",
    text: "Nunca vi mis carreras con este nivel. Parece Netflix, pero en barro.",
  },
  {
    author: "Team Ruta 7",
    role: "Equipo oficial",
    text: "El contenido de Victor Films nos subió el nivel de marca en redes.",
  },
  {
    author: "Nico P.",
    role: "Piloto Amateur",
    text: "Compré en dos clics y descargué todo en HD al instante.",
  },
];

export function CinematicHome({ events, configError }: Props) {
  const [sportFilter, setSportFilter] = useState("todos");
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

  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.35]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const sectionsY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const particlesY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -220]);

  const reveal = {
    initial: { opacity: 0, y: 36, filter: "blur(8px)" },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.65, ease: "easeOut" as const },
  };

  return (
    <div className="-mt-10 space-y-28 pb-8">
      <section className="relative -mx-4 min-h-[100vh] overflow-hidden border-y border-white/10 sm:-mx-6 md:rounded-[28px] md:border md:border-white/10">
        <motion.video
          autoPlay
          muted
          loop
          playsInline
          poster="/banner-victor-films.png"
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
          {Array.from({ length: 28 }).map((_, i) => (
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
            Encontrá y comprá tus fotos deportivas por dorsal
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
              Explorar eventos
            </Link>
            <Link href="/mis-compras" className="btn-secondary border-white/25 bg-black/35">
              Mis compras
            </Link>
            <Link href="/para-fotografos" className="btn-secondary border-white/25 bg-black/35">
              Soy fotógrafo
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05 }}
            className="mt-10 grid max-w-3xl grid-cols-2 gap-3 text-xs uppercase tracking-[0.18em] text-white/70 md:grid-cols-4"
          >
            {["Entrega en 4K", "Listos para reels", "HD al instante", "Historias deportivas"].map((k) => (
              <div key={k} className="glass rounded-xl px-3 py-2 text-center">
                {k}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {configError && (
        <div className="rounded-[var(--radius-lg)] border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100/90">
          Modo demo: conecta Supabase en <code>.env.local</code> para listar carreras reales.
        </div>
      )}

      <HowItWorks />

      <motion.section id="services" style={{ y: sectionsY }} className="space-y-7" {...reveal}>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">
          Servicios
        </p>
        <h2 className="font-display text-3xl font-extrabold uppercase md:text-5xl">
          Producción audiovisual integral
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service, idx) => (
            <motion.div
              key={service}
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: idx * 0.06 }}
              className="glass reveal-card rounded-2xl border border-white/10 p-6"
            >
              <p className="font-display text-xl font-bold uppercase text-white">{service}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent p-6 md:p-10"
        {...reveal}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
          Marketplace para fotógrafos
        </p>
        <h3 className="font-display text-3xl font-extrabold uppercase md:text-5xl">
          Cobran tus ventas, con split
        </h3>
        <p className="max-w-2xl text-sm text-white/70 md:text-base">
          Publicá eventos multideporte, subí fotos con marca de agua y vendé por dorsal.
          La plataforma toma una comisión del 20% y el resto se acredita al fotógrafo.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { k: "Onboarding", v: "Registro de fotógrafo" },
            { k: "Dashboard", v: "Crear, subir y publicar" },
            { k: "Cobro", v: "Split automático por Mercado Pago" },
          ].map((x) => (
            <div key={x.k} className="glass rounded-2xl border border-white/10 p-5">
              <p className="font-display text-lg font-bold uppercase">{x.k}</p>
              <p className="mt-2 text-sm text-white/70">{x.v}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/fotografos/registro" className="btn-primary">
            Unirme al marketplace
          </Link>
          <Link href="/fotografos/login" className="btn-secondary bg-black/30">
            Ya tengo cuenta
          </Link>
        </div>
      </motion.section>

      <motion.section
        className="grid items-center gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent p-6 md:grid-cols-2 md:p-9"
        {...reveal}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            Piloto destacado
          </p>
          <h3 className="font-display mt-3 text-3xl font-extrabold uppercase md:text-5xl">
            Rostros de la pista
          </h3>
          <p className="mt-4 max-w-lg text-sm text-white/70">
            Retratos de pilotos con lenguaje visual agresivo: humo, barro, luces duras y
            contraste documental.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {riders.map((r, idx) => (
            <motion.article
              key={r.name}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, delay: idx * 0.09 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10"
            >
              <img
                src={r.image}
                alt={r.name}
                className="h-64 w-full object-cover grayscale transition duration-500 group-hover:scale-110 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-0 p-4">
                <p className="font-display text-base font-bold uppercase">{r.name}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/65">{r.category}</p>
                <p className="mt-2 text-xs text-white/80">“{r.quote}”</p>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="overflow-hidden rounded-2xl border border-white/10 py-5"
        {...reveal}
      >
        <div className="sponsors-marquee">
          {[...sponsors, ...sponsors].map((s, i) => (
            <span key={`${s}-${i}`} className="mx-6 text-sm font-semibold tracking-[0.28em] text-white/55">
              {s}
            </span>
          ))}
        </div>
      </motion.section>

      <motion.section id="eventos" className="space-y-7" {...reveal}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
              Marketplace
            </p>
            <h2 className="font-display text-3xl font-extrabold uppercase md:text-5xl">
              Eventos publicados
            </h2>
          </div>
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
          <div className="grid auto-rows-[200px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredEvents.map((event, idx) => (
            <motion.div
                key={event.id}
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: idx * 0.04 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.35 } }}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 reveal-card ${
                  idx % 5 === 0 || idx % 5 === 3 ? "sm:row-span-2" : ""
                }`}
              >
                <motion.img
                  src={event.displayCoverUrl ?? "/banner-victor-films.png"}
                  alt={event.title}
                  whileHover={{ scale: 1.16 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-4">
                  <span className="badge-sport mb-2">{formatSportLabel(event.sport)}</span>
                  <p className="font-display text-lg font-bold uppercase">{event.title}</p>
                  <p className="mt-1 text-xs tracking-wide text-white/75">
                    {formatDate(event.event_date)} {event.location ? `· ${event.location}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-white/75">
                    Desde {formatPrice(event.price_per_photo_cents)}
                  </p>
                  <Link
                    href={`/eventos/${event.slug}`}
                    className="mt-3 inline-flex text-xs font-semibold uppercase tracking-wider text-white"
                  >
                    Entrar a la galería →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      <motion.section className="space-y-6" {...reveal}>
        <h3 className="font-display text-2xl font-bold uppercase md:text-4xl">Lo que dicen</h3>
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

      <motion.section className="space-y-6" {...reveal}>
        <div className="flex items-end justify-between">
          <h3 className="font-display text-2xl font-bold uppercase md:text-4xl">Reels destacados</h3>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white"
          >
            Ver perfil
          </a>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <motion.div
              key={n}
              whileHover={{ y: -6, filter: "blur(0px)" }}
              initial={{ filter: "blur(4px)" }}
              whileInView={{ filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.35 }}
              className="group relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 reveal-card"
            >
              <motion.img
                src="/banner-victor-films.png"
                alt="Reel motocross"
                whileHover={{ scale: 1.12 }}
                transition={{ duration: 0.7 }}
                className="h-full w-full object-cover opacity-80 grayscale transition group-hover:opacity-100 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2 py-1 text-[10px] uppercase tracking-[0.18em]">
                Reel 0{n}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
