import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { EventCard } from "@/components/EventCard";
import { BRAND } from "@/lib/brand";
import { attachEventCovers, type EventWithCover } from "@/lib/event-cover";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "01",
    title: "Elegí la carrera",
    desc: "Entrá al evento donde corriste y explorá la galería completa.",
  },
  {
    n: "02",
    title: "Buscá tu dorsal",
    desc: "Filtrá por tu número o navegá las fotos hasta encontrarte.",
  },
  {
    n: "03",
    title: "Pagá y descargá",
    desc: "Seleccioná las que quieras, pagá con tarjeta y bajá en HD sin marca de agua.",
  },
];

import { IconBolt, IconCamera, IconLock } from "@/components/icons";

const FEATURES = [
  {
    Icon: IconBolt,
    title: "Rápido",
    desc: "Encontrá tus fotos en segundos, sin mensajes al fotógrafo.",
  },
  {
    Icon: IconLock,
    title: "Pago seguro",
    desc: "Checkout con tarjeta. Link de descarga a tu email.",
  },
  {
    Icon: IconCamera,
    title: "Alta resolución",
    desc: "Vista previa con marca de agua; descarga HD sin marca al pagar.",
  },
];

export default async function HomePage() {
  let list: EventWithCover[] = [];
  let configError = false;

  try {
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      const supabase = await createClient();
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("event_date", { ascending: false });
      list = await attachEventCovers(supabase, (events ?? []) as Event[]);
    } else {
      configError = true;
    }
  } catch {
    configError = true;
  }

  return (
    <div className="-mt-2">
      <section className="relative mb-20 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1591637333184-19aa7feee448?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f08]/95 via-[var(--surface)]/90 to-[var(--bg)]/95" />
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[var(--accent)] opacity-[0.08] blur-[80px]" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-orange-900/30 blur-[60px]" />

        <div className="relative px-6 py-16 md:px-14 md:py-24">
          <div className="mb-8">
            <BrandLogo href="/" size="hero" />
          </div>
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[var(--muted)]">
            {BRAND.tagline}
          </p>
          <h1 className="font-display mb-6 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
            Tus fotos de carrera,
            <span className="text-[var(--accent)]"> listas para llevar</span>
          </h1>
          <p className="mb-10 max-w-xl text-lg leading-relaxed text-[var(--muted)] md:text-xl">
            La plataforma donde los corredores encuentran sus mejores tomas, pagan online
            y se llevan la foto en alta resolución al instante.
          </p>
          <div className="flex flex-wrap gap-3">
            {list.length > 0 ? (
              <a href="#carreras" className="btn-primary">
                Ver carreras disponibles
              </a>
            ) : (
              <span className="btn-primary opacity-70">Próximamente nuevas carreras</span>
            )}
            <a href="#como-funciona" className="btn-secondary">
              Cómo funciona
            </a>
          </div>
        </div>
      </section>

      {configError && (
        <div className="mb-10 rounded-[var(--radius-lg)] border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100/90">
          Modo demo: conectá Supabase en <code className="text-amber-200">.env.local</code> para
          listar carreras reales.
        </div>
      )}

      <section id="como-funciona" className="mb-20">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          Simple y claro
        </p>
        <h2 className="font-display mb-10 text-3xl font-bold md:text-4xl">Cómo funciona</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="card p-6 transition hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
            >
              <span className="font-display text-3xl font-bold text-[var(--accent)]/50">
                {s.n}
              </span>
              <h3 className="font-display mt-3 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface)]/50 p-5"
            >
              <span className="text-[var(--accent)]" aria-hidden>
                <f.Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="carreras" className="mb-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
              Eventos activos
            </p>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Carreras publicadas</h2>
            <p className="mt-2 text-[var(--muted)]">
              Elegí el evento y buscá tus fotos por dorsal.
            </p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="card flex flex-col items-center px-8 py-16 text-center">
            <p className="font-display text-xl font-bold">Próximas carreras</p>
            <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
              Cuando Victor publique un evento, aparece acá. Mientras tanto, así se ve la
              galería:
            </p>
            <div className="mt-8 grid w-full max-w-2xl grid-cols-3 gap-2 opacity-80">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="aspect-[4/3] rounded-lg bg-gradient-to-br from-[var(--border)] to-[var(--surface)]"
                />
              ))}
            </div>
            <Link href="/admin" className="btn-secondary mt-8">
              Panel del fotógrafo
            </Link>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card overflow-hidden border-[var(--accent)]/20 bg-gradient-to-r from-[var(--accent-muted)] to-transparent p-8 md:p-12">
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Para fotógrafos
          </p>
          <h2 className="font-display mb-3 text-2xl font-bold md:text-3xl">
            Panel Victor Films
          </h2>
          <p className="mb-6 text-[var(--muted)]">
            Subí lotes de carrera, etiquetá dorsales y cobrá por cada descarga desde tu
            panel privado.
          </p>
          <Link href="/admin" className="btn-primary">
            Ir al panel de fotógrafo
          </Link>
        </div>
      </section>
    </div>
  );
}
