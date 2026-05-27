"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { formatDate, formatPrice } from "@/lib/format";

type EventItem = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
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
  "Edicion premium con look documental",
  "Entrega en alta resolucion y reels",
];

const sponsors = [
  "RED RAMP",
  "FOX STYLE",
  "DIRT LAB",
  "MONSTER TRACK",
  "MOTO X PRO",
  "RACE CORE",
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
    text: "El contenido de Victor Films nos subio el nivel de marca en redes.",
  },
  {
    author: "Nico P.",
    role: "Piloto Amateur",
    text: "Compre en dos clicks y descargue todo en HD al instante.",
  },
];

export function CinematicHome({ events, configError }: Props) {
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.35]);

  return (
    <div className="-mt-10 space-y-24 pb-8">
      <section className="relative -mx-4 min-h-[100vh] overflow-hidden border-y border-white/10 sm:-mx-6 md:rounded-[28px] md:border md:border-white/10">
        <motion.video
          autoPlay
          muted
          loop
          playsInline
          poster="/banner-victor-films.png"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ scale: heroScale, opacity: heroOpacity }}
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-motocross-training-2346/1080p.mp4"
            type="video/mp4"
          />
        </motion.video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/70 to-black/95" />
        <div className="smoke-layer absolute inset-0" />
        <div className="dirt-layer absolute inset-0" />

        <div className="relative z-10 flex min-h-[92vh] flex-col justify-end px-6 pb-10 pt-24 md:px-12 md:pb-14">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/75"
          >
            Premium Motocross Media Agency
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display max-w-5xl text-4xl font-extrabold uppercase leading-[0.9] text-white md:text-7xl"
          >
            Cinematic Action Photography For Extreme Riders
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-5 max-w-2xl text-sm text-white/80 md:text-base"
          >
            Victor Films transforma cada salto, derrape y polvo en una historia visual con
            estetica de documental deportivo.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="#carreras" className="btn-primary">
              Ver carreras
            </Link>
            <Link href="/mis-compras" className="btn-secondary border-white/25 bg-black/35">
              Recuperar mis compras
            </Link>
          </motion.div>
        </div>
      </section>

      {configError && (
        <div className="rounded-[var(--radius-lg)] border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100/90">
          Modo demo: conecta Supabase en <code>.env.local</code> para listar carreras reales.
        </div>
      )}

      <section id="services" className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">
          Servicios
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service, idx) => (
            <motion.div
              key={service}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: idx * 0.06 }}
              className="glass rounded-2xl border border-white/10 p-6"
            >
              <p className="font-display text-xl font-bold uppercase text-white">{service}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 py-5">
        <div className="sponsors-marquee">
          {[...sponsors, ...sponsors].map((s, i) => (
            <span key={`${s}-${i}`} className="mx-6 text-sm font-semibold tracking-[0.28em] text-white/55">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section id="carreras" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
              Gallery
            </p>
            <h2 className="font-display text-3xl font-extrabold uppercase md:text-5xl">
              Racing Archives
            </h2>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="glass rounded-2xl border border-white/10 p-8 text-center">
            <p className="font-display text-2xl uppercase">Próximas carreras</p>
            <p className="mt-2 text-sm text-white/65">
              Estamos preparando nuevas sesiones cinematograficas de motocross.
            </p>
          </div>
        ) : (
          <div className="grid auto-rows-[180px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: idx * 0.04 }}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 ${
                  idx % 5 === 0 || idx % 5 === 3 ? "sm:row-span-2" : ""
                }`}
              >
                <img
                  src={event.displayCoverUrl ?? "/banner-victor-films.png"}
                  alt={event.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110 group-hover:contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-4">
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
                    Entrar a galeria →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {testimonials.map((item) => (
          <motion.article
            key={item.author}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            className="glass rounded-2xl border border-white/10 p-6"
          >
            <p className="text-sm leading-relaxed text-white/85">“{item.text}”</p>
            <p className="mt-4 font-display text-sm font-bold uppercase">{item.author}</p>
            <p className="text-xs tracking-wide text-white/55">{item.role}</p>
          </motion.article>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <h3 className="font-display text-2xl font-bold uppercase md:text-4xl">Instagram Reels</h3>
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
              whileHover={{ y: -6 }}
              className="group relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10"
            >
              <img
                src="/banner-victor-films.png"
                alt="Reel motocross"
                className="h-full w-full object-cover opacity-80 grayscale transition group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2 py-1 text-[10px] uppercase tracking-[0.18em]">
                Reel 0{n}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
