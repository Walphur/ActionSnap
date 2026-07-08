import { EventCard } from "@/components/EventCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { attachEventCovers, type EventWithCover } from "@/lib/event-cover";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";
import { CalendarDays, Compass } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explorar eventos — Action Snap",
  description: "Todas las galerías de eventos disponibles para comprar.",
};

export default async function ExplorarPage() {
  let list: EventWithCover[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("event_date", { ascending: false });
      list = await attachEventCovers(supabase, (events ?? []) as Event[]);
    }
  } catch {
    list = [];
  }

  return (
    <section className="buyer-explore" aria-labelledby="explore-heading">
      <div className="buyer-explore__inner">
        <header className="buyer-explore__head">
          <p className="ds-overline">
            <Compass className="inline h-4 w-4" aria-hidden />
            Explorar
          </p>
          <h1 id="explore-heading" className="ds-h1">
            Todos los eventos
          </h1>
          <p className="ds-body-lg buyer-explore__lead">
            Elegí una galería y buscá tu número o color con los filtros de cada evento.
          </p>
        </header>

        {list.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No hay eventos publicados aún"
            description="Volvé pronto: los fotógrafos están subiendo nuevas coberturas."
            action={
              <ButtonLink href="/" variant="secondary">
                Volver al inicio
              </ButtonLink>
            }
          />
        ) : (
          <div className="landing-events__grid">
            {list.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
