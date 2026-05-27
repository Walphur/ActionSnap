import Link from "next/link";
import { attachEventCovers, type EventWithCover } from "@/lib/event-cover";
import { formatSportLabel } from "@/lib/platform";
import { formatDate, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explorar eventos — Action Snap",
  description: "Todas las galerías deportivas disponibles para comprar.",
};

export default async function ExplorarPage() {
  let list: EventWithCover[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("event_date", { ascending: false });
      list = await attachEventCovers(supabase, (events ?? []) as Event[]);
    }
  } catch {
    list = [];
  }

  return (
    <div className="marketing-page">
      <header className="marketing-page-header glass-panel">
        <p className="trust-kicker">Explore</p>
        <h1 className="font-display marketing-page-title">Todos los eventos</h1>
        <p className="marketing-page-lead">Elegí una galería y buscá tu dorsal.</p>
      </header>

      {list.length === 0 ? (
        <p className="mt-8 text-center text-[var(--muted)]">No hay eventos publicados aún.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((e) => (
            <li key={e.id}>
              <Link
                href={`/eventos/${e.slug}`}
                className="explore-row glass-panel flex flex-wrap items-center justify-between gap-3 p-4 transition hover:border-[var(--accent)]/40"
              >
                <div>
                  <span className="badge-sport">{formatSportLabel(e.sport)}</span>
                  <h2 className="mt-1 font-display text-xl uppercase text-white">{e.title}</h2>
                  <p className="text-sm text-[var(--muted)]">
                    {formatDate(e.event_date)}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>
                <p className="text-sm font-medium text-white">
                  {e.photoCount} fotos · Desde {formatPrice(e.price_per_photo_cents)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
