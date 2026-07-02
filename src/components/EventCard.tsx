import Link from "next/link";
import { ArrowRight, Calendar, Camera, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { formatDate, formatPrice } from "@/lib/format";
import type { EventWithCover } from "@/lib/event-cover";
import { formatSportLabel } from "@/lib/platform";

export function EventCard({ event }: { event: EventWithCover }) {
  const imageUrl = event.displayCoverUrl;

  return (
    <Link href={`/eventos/${event.slug}`} className="ds-event-card-link ds-hover-lift">
      <Card className="ds-event-card">
        <div className="ds-event-card__cover">
          {imageUrl ? (
            <img src={imageUrl} alt="" loading="lazy" />
          ) : (
            <div className="ds-event-card__cover-placeholder">
              <ImageIcon className="h-8 w-8" aria-hidden />
              <span className="ds-caption">Galería en preparación</span>
            </div>
          )}
          <div className="ds-event-card__overlay" aria-hidden />
          <div className="ds-event-card__badges">
            <Badge>{formatSportLabel(event.sport)}</Badge>
          </div>
        </div>
        <CardBody className="ds-event-card__body">
          <h3 className="ds-h4 ds-event-card__title">{event.title}</h3>
          <p className="ds-caption ds-event-card__date">
            <Calendar className="inline h-3.5 w-3.5 shrink-0" aria-hidden />
            {formatDate(event.event_date)}
            {event.location ? ` · ${event.location}` : ""}
          </p>
          <p className="ds-caption ds-event-card__stats">
            <Camera className="inline h-3.5 w-3.5 shrink-0" aria-hidden />
            {event.photoCount.toLocaleString("es-AR")} fotos · Desde{" "}
            {formatPrice(event.price_per_photo_cents)}
          </p>
          <span className="ds-event-card__cta">
            Ver galería
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </CardBody>
      </Card>
    </Link>
  );
}
