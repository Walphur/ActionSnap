import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DashboardEventCard } from "@/components/photographer/dashboard/DashboardEventCard";
import type { EventRow } from "@/types/event";

const SPORT_OPTIONS = [
  { value: "motocross", label: "Motocross" },
  { value: "natacion", label: "Natación" },
  { value: "triatlon", label: "Triatlón" },
  { value: "ciclismo", label: "Ciclismo" },
  { value: "otros", label: "Otros" },
] as const;

type Tab = "upload";

type Props = {
  events: EventRow[];
  activeSlug: string;
  onSelectEvent: (slug: string, title: string) => void;
  onNavigateUpload: () => void;
  onCreateEvent: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function DashboardEventsTab({
  events,
  activeSlug,
  onSelectEvent,
  onNavigateUpload,
  onCreateEvent,
}: Props) {
  return (
    <div className="ds-dashboard">
      <section className="ds-dash-section">
        <div className="ds-dash-section__head">
          <div>
            <p className="ds-overline">Eventos</p>
            <h2 className="ds-h3 mt-1">Todas tus coberturas</h2>
          </div>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="Creá tu primer evento"
            description="Publicá una cobertura para empezar a subir fotos y vender."
          />
        ) : (
          <div className="ds-dash-events-grid">
            {events.map((ev) => (
              <DashboardEventCard
                key={ev.id}
                event={ev}
                active={activeSlug === ev.slug}
                onSelect={() => onSelectEvent(ev.slug, ev.title)}
                onUpload={() => {
                  onSelectEvent(ev.slug, ev.title);
                  onNavigateUpload();
                }}
                onTag={() => {
                  onSelectEvent(ev.slug, ev.title);
                  onNavigateUpload();
                }}
              />
            ))}
          </div>
        )}
      </section>

      <Card className="ds-dash-reveal">
        <CardHeader>
          <h2 className="ds-h4">Nuevo evento</h2>
          <p className="ds-caption mt-1">Aparece en Action Snap al publicar.</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={onCreateEvent} className="grid gap-4 sm:grid-cols-2">
            <Input label="Título" name="title" required />
            <Input label="Slug URL" name="slug" placeholder="gp-sanluis-2026" required />
            <Select label="Deporte" name="sport" defaultValue="motocross">
              {SPORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Input label="Fecha" name="event_date" type="date" required />
            <Input label="Precio $" name="price" type="number" defaultValue="5" required />
            <Input label="Lugar" name="location" className="sm:col-span-2" />
            <Checkbox label="Publicar al crear" name="publish" defaultChecked className="sm:col-span-2" />
            <Button type="submit" variant="primary" className="sm:col-span-2">
              Crear evento
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
