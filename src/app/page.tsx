import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { Event } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let list: Event[] = [];
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
      list = (events ?? []) as Event[];
    } else {
      configError = true;
    }
  } catch {
    configError = true;
  }

  return (
    <div>
      {/* ——— FRONT PÚBLICO (corredores) ——— */}
      <section className="relative mb-16 overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[#1a0f08] px-6 py-14 md:px-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--accent)] opacity-10 blur-3xl" />
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
          Para corredores
        </p>
        <h1 className="mb-4 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
          Encontrá tus fotos de carrera en segundos
        </h1>
        <p className="mb-8 max-w-xl text-lg text-[var(--muted)]">
          Entrá a la carrera, buscá tu número de dorsal, elegí las fotos que
          quieras, pagá online y descargá en alta resolución.
        </p>
        <ol className="mb-8 grid max-w-2xl gap-3 text-sm md:grid-cols-3">
          {[
            ["1", "Elegí la carrera"],
            ["2", "Buscá tu dorsal"],
            ["3", "Pagá y descargá"],
          ].map(([n, t]) => (
            <li
              key={n}
              className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-black">
                {n}
              </span>
              {t}
            </li>
          ))}
        </ol>
        {list.length > 0 && (
          <a
            href="#carreras"
            className="inline-block rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-black hover:bg-[var(--accent-hover)]"
          >
            Ver carreras disponibles
          </a>
        )}
      </section>

      {configError && (
        <div className="mb-8 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Falta configurar Supabase en <code>.env.local</code>. El sitio público
          mostrará las carreras cuando esté conectado.
        </div>
      )}

      <section id="carreras" className="mb-8">
        <h2 className="mb-1 text-2xl font-bold">Carreras publicadas</h2>
        <p className="text-sm text-[var(--muted)]">
          Esto es lo que ven los corredores — no el panel de admin.
        </p>
      </section>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
          <p className="mb-2 text-[var(--muted)]">
            Todavía no hay carreras visibles para el público.
          </p>
          <p className="mb-6 text-sm text-[var(--muted)]">
            El fotógrafo las crea en{" "}
            <strong className="text-[var(--text)]">/admin</strong> y debe marcar
            &quot;Publicar&quot;. Después aparecen acá automáticamente.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-lg bg-[var(--surface)] px-4 py-2 text-[var(--muted)]">
              Vista pública → <strong className="text-[var(--accent)]">/</strong>
            </span>
            <span className="rounded-lg bg-[var(--surface)] px-4 py-2 text-[var(--muted)]">
              Galería → <strong className="text-[var(--accent)]">/eventos/nombre-carrera</strong>
            </span>
            <Link
              href="/admin"
              className="rounded-lg border border-[var(--border)] px-4 py-2 hover:border-[var(--accent)]"
            >
              Panel fotógrafo → /admin
            </Link>
          </div>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((event) => (
            <li key={event.id}>
              <Link
                href={`/eventos/${event.slug}`}
                className="group block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition hover:border-[var(--accent)]"
              >
                <div
                  className="aspect-video bg-[var(--border)] bg-cover bg-center"
                  style={
                    event.cover_url
                      ? { backgroundImage: `url(${event.cover_url})` }
                      : undefined
                  }
                />
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
                    Ver fotos →
                  </p>
                  <h3 className="text-lg font-semibold group-hover:text-[var(--accent)]">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {formatDate(event.event_date)}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
