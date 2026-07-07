import { Calendar, MapPin } from "lucide-react";
import { EventHeroShare } from "@/components/event/EventHeroShare";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { formatDate, formatPrice } from "@/lib/format";
import { formatSportLabel } from "@/lib/platform";

type Props = {
  event: {
    slug: string;
    title: string;
    description: string | null;
    event_date: string;
    location: string | null;
    sport?: string | null;
    price_per_photo_cents: number;
    cover_url?: string | null;
  };
  photoCount?: number;
  coverUrl?: string | null;
  photographerName?: string;
  pilotCount?: number | null;
  shareUrl: string;
};

const FALLBACK = "/banner-upload-motocross.png";

export function EventHero({ event, coverUrl, shareUrl }: Props) {
  const imageUrl = coverUrl ?? event.cover_url ?? FALLBACK;

  return (
    <section className="buyer-hero" aria-labelledby="event-hero-title">
      <div className="buyer-hero__cover">
        <img src={imageUrl} alt="" fetchPriority="high" decoding="async" />
        <div className="buyer-hero__overlay" />

        <div className="buyer-hero__back">
          <ButtonLink href="/explorar" variant="ghost" size="sm" className="!text-white/80 !border-white/15">
            ← Eventos
          </ButtonLink>
        </div>

        <div className="buyer-hero__actions-top">
          <EventHeroShare title={event.title} url={shareUrl} />
        </div>

        <div className="buyer-hero__content">
          <span className="buyer-hero__sport">{formatSportLabel(event.sport)}</span>
          <h1 id="event-hero-title" className="ds-h1 buyer-hero__title">
            {event.title}
          </h1>

          <div className="buyer-hero__meta">
            <Badge className="!bg-black/40 !border-white/15 !text-white">
              <Calendar className="h-3 w-3" aria-hidden />
              {formatDate(event.event_date)}
            </Badge>
            {event.location && (
              <Badge className="!bg-black/40 !border-white/15 !text-white">
                <MapPin className="h-3 w-3" aria-hidden />
                {event.location}
              </Badge>
            )}
            <Badge tone="warning" className="buyer-hero__price">
              {formatPrice(event.price_per_photo_cents)} / foto
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
