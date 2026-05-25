import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import type { Event } from "@/lib/types";

type Props = {
  event: Event;
  photoCount?: number;
};

export function EventHero({ event, photoCount }: Props) {
  return (
    <section className="relative -mx-4 mb-10 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] md:-mx-0">
      <div className="relative aspect-[21/9] min-h-[200px] md:min-h-[280px]">
        {event.cover_url ? (
          <img
            src={event.cover_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a1810] to-[var(--bg)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <Link
            href="/"
            className="mb-4 inline-flex w-fit items-center gap-1 text-sm text-white/70 transition hover:text-white"
          >
            ← Todas las carreras
          </Link>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            {event.title}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80 md:text-base">
            <span>{formatDate(event.event_date)}</span>
            {event.location && (
              <>
                <span className="text-white/40">·</span>
                <span>{event.location}</span>
              </>
            )}
            <span className="text-white/40">·</span>
            <span className="font-medium text-[var(--accent)]">
              {formatPrice(event.price_per_photo_cents)} / foto
            </span>
            {photoCount !== undefined && photoCount > 0 && (
              <>
                <span className="text-white/40">·</span>
                <span>{photoCount} fotos</span>
              </>
            )}
          </p>
          {event.description && (
            <p className="mt-3 max-w-2xl text-sm text-white/65 md:text-base">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
