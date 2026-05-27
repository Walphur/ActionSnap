import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import type { EventWithCover } from "@/lib/event-cover";

export function EventCard({ event }: { event: EventWithCover }) {
  const imageUrl = event.displayCoverUrl;

  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group card block overflow-hidden transition hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--border)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[var(--surface)] to-[#1a1008] px-6 text-center">
            <span className="text-xs uppercase tracking-widest text-[var(--muted)]">
              Sin portada aún
            </span>
            <span className="text-sm text-[var(--muted)]">Galería en preparación</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold text-black">
          Ver galería →
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-bold group-hover:text-[var(--accent)]">
          {event.title}
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {formatDate(event.event_date)}
          {event.location ? ` · ${event.location}` : ""}
        </p>
        <p className="mt-3 text-sm font-medium text-[var(--text)]">
          Desde {formatPrice(event.price_per_photo_cents)} por foto
        </p>
      </div>
    </Link>
  );
}
