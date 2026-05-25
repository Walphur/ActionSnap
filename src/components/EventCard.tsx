import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import type { Event } from "@/lib/types";

export function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group card block overflow-hidden transition hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--border)]">
        {event.cover_url ? (
          <img
            src={event.cover_url}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--surface)] to-[#1a1008]">
            <span className="font-display text-4xl font-bold text-[var(--accent)]/30">MX</span>
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
