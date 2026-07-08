import { Calendar, Camera, ExternalLink, ImageIcon, Pause, Tags, Trash2 } from "lucide-react";
import { EventSharePanel } from "@/components/photographer/onboarding/EventSharePanel";
import { EventStatusBadge } from "@/components/photographer/EventStatusBadge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody } from "@/components/ui/Card";
import { formatDate, formatPrice } from "@/lib/format";
import { formatSportLabel } from "@/lib/platform";
import type { EventRow } from "@/types/event";

type Props = {
  event: EventRow;
  active: boolean;
  onSelect: () => void;
  onUpload: () => void;
  onTag: () => void;
  onPause?: () => void;
  onDelete?: () => void;
};

export function DashboardEventCard({
  event,
  active,
  onSelect,
  onUpload,
  onTag,
  onPause,
  onDelete,
}: Props) {
  return (
    <Card className={`ds-dash-event-card ds-hover-lift ${active ? "ds-dash-event-card--active" : ""}`}>
      <div className="ds-dash-event-card__cover">
        {event.cover_url ? (
          <img src={event.cover_url} alt="" />
        ) : (
          <div className="ds-dash-event-card__cover-placeholder">
            <ImageIcon className="h-8 w-8" aria-hidden />
          </div>
        )}
        <div className="ds-dash-event-card__badges">
          <EventStatusBadge event={event} />
          <span className="ds-badge">{formatSportLabel(event.sport)}</span>
        </div>
      </div>
      <CardBody className="ds-dash-event-card__body">
        <h3 className="ds-h4">{event.title}</h3>
        <div className="ds-dash-event-card__meta">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {formatDate(event.event_date)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Camera className="h-3.5 w-3.5" aria-hidden />
            {event.photoCount} fotos
          </span>
          <span>{formatPrice(event.price_per_photo_cents)} / foto</span>
        </div>
        <div className="ds-dash-event-card__actions">
          <Button type="button" variant={active ? "primary" : "secondary"} size="sm" onClick={onSelect}>
            {active ? "Activo" : "Activar"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onUpload}>
            Subir
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onTag}>
            <Tags className="h-3.5 w-3.5" aria-hidden />
            Etiquetar
          </Button>
          {event.is_published && (
            <ButtonLink href={`/eventos/${event.slug}`} variant="outline" size="sm">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Ver
            </ButtonLink>
          )}
        </div>
        <div className="ds-dash-event-card__manage">
          {event.is_published && onPause && (
            <Button type="button" variant="ghost" size="sm" onClick={onPause}>
              <Pause className="h-3.5 w-3.5" aria-hidden />
              Pausar
            </Button>
          )}
          {onDelete && (
            <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Eliminar
            </Button>
          )}
        </div>
        {event.is_published && (
          <EventSharePanel eventTitle={event.title} slug={event.slug} embedded />
        )}
      </CardBody>
    </Card>
  );
}
