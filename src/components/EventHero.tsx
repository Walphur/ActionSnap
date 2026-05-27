import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import { formatSportLabel } from "@/lib/platform";
import type { Event } from "@/lib/types";

type Props = {
  event: Event;
  photoCount?: number;
  coverUrl?: string | null;
};

const FALLBACK = "/banner-upload-motocross.png";

export function EventHero({ event, photoCount, coverUrl }: Props) {
  const imageUrl = coverUrl ?? event.cover_url ?? FALLBACK;

  return (
    <section className="event-hero relative -mx-4 mb-8 overflow-hidden rounded-[var(--radius-xl)] border border-white/10 md:-mx-0">
      <div className="relative aspect-[16/9] min-h-[240px] sm:aspect-[21/9] md:min-h-[300px]">
        <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <Link
            href="/#eventos"
            className="mb-4 inline-flex w-fit items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:text-white"
          >
            ← Todos los eventos
          </Link>
          <span className="badge-sport w-fit">{formatSportLabel(event.sport)}</span>
          <h1 className="font-display mt-3 text-3xl font-extrabold uppercase leading-[0.95] text-white md:text-5xl">
            {event.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/85">
              {formatDate(event.event_date)}
            </span>
            {event.location && (
              <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/85">
                {event.location}
              </span>
            )}
            <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent-muted)] px-3 py-1 text-xs font-semibold text-white">
              {formatPrice(event.price_per_photo_cents)} / foto
            </span>
            {photoCount !== undefined && photoCount > 0 && (
              <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/85">
                {photoCount.toLocaleString("es-AR")} fotos
              </span>
            )}
          </div>
          {event.description && (
            <p className="mt-4 max-w-2xl text-sm text-white/70 md:text-base">{event.description}</p>
          )}
        </div>
      </div>
    </section>
  );
}
