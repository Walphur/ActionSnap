import { EventCard } from "@/components/EventCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import type { EventWithCover } from "@/lib/event-cover";
import { PLATFORM } from "@/lib/platform";
import { CalendarDays } from "lucide-react";

type Props = {
  events: EventWithCover[];
};

export function LandingEvents({ events }: Props) {
  const featuredEvents = events.slice(0, 4);

  return (
    <section id="eventos" className="landing__section" aria-labelledby="events-heading">
      <div className="landing__container">
        <div className="landing__section-head landing__section-head--row landing-reveal">
          <div>
            <p className="landing__kicker ds-overline">Eventos en vivo</p>
            <h2 id="events-heading" className="ds-h2">
              Coberturas recientes en {PLATFORM.name}
            </h2>
          </div>
          <ButtonLink
            href="/explorar"
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Ver todos →
          </ButtonLink>
        </div>

        {featuredEvents.length > 0 ? (
          <div className="landing-events__grid">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="Próximamente nuevas coberturas"
            description="Los fotógrafos ya están subiendo eventos. Volvé pronto o creá el tuyo primero."
            action={
              <ButtonLink href="/fotografos/registro" variant="primary">
                Publicar mi evento
              </ButtonLink>
            }
          />
        )}

        <div className="mt-8 flex justify-center sm:hidden">
          <ButtonLink href="/explorar" variant="secondary">
            Ver todos los eventos
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
