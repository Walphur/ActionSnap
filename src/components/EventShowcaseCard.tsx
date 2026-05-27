"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
  index?: number;
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
  index = 0,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
    >
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
        <div className="event-showcase-blur" />
        <div className="event-showcase-content">
          <span className="badge-sport">{formatSportLabel(sport)}</span>
          <h3 className="event-showcase-title font-display">{title}</h3>
          <p className="event-showcase-meta">
            {formatDate(eventDate)}
            {location ? ` · ${location}` : ""}
          </p>
          <p className="event-showcase-meta">
            {photoCount.toLocaleString("es-AR")} fotos · Desde {formatPrice(priceCents)}
          </p>
          <span className="event-showcase-cta btn-card-cta">Ver galería</span>
        </div>
      </Link>
    </motion.div>
  );
}
