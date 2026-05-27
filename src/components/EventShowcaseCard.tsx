import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import { formatSportLabel } from "@/lib/platform";

type Props = {
  slug: string;
  title: string;
  sport?: string | null;
  eventDate: string;
  location: string | null;
  photoCount: number;
  priceCents: number;
  coverUrl: string | null;
  fallbackCover?: string;
  featured?: boolean;
};

export function EventShowcaseCard({
  slug,
  title,
  sport,
  eventDate,
  location,
  photoCount,
  priceCents,
  coverUrl,
  fallbackCover = "/banner-upload-motocross.png",
  featured = false,
}: Props) {
  return (
    <Link
      href={`/eventos/${slug}`}
      className={`event-showcase group ${featured ? "event-showcase--featured" : ""}`}
    >
      <img
        src={coverUrl ?? fallbackCover}
        alt=""
        className="event-showcase-media"
        loading="lazy"
      />
      <div className="event-showcase-overlay" />
      <div className="event-showcase-content">
        <span className="badge-sport">{formatSportLabel(sport)}</span>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-white">{title}</h3>
        <p className="mt-1.5 text-sm text-white/70">
          {formatDate(eventDate)}
          {location ? ` · ${location}` : ""}
        </p>
        <p className="mt-1 text-sm text-white/85">
          {photoCount.toLocaleString("es-AR")} fotos · Desde {formatPrice(priceCents)}
        </p>
        <span className="event-showcase-cta">Ver galería →</span>
      </div>
    </Link>
  );
}
