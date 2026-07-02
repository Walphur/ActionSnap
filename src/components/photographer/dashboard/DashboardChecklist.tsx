import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import type { DashboardOverview, EventRow } from "@/types/event";

type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

type Props = {
  overview: DashboardOverview | null;
  events: EventRow[];
  mpReceiverId: string;
};

function buildChecklist(
  overview: DashboardOverview | null,
  events: EventRow[],
  mpReceiverId: string
): ChecklistItem[] {
  return [
    {
      id: "mp",
      label: "Conectar Mercado Pago",
      done: Boolean(overview?.mpConnected || mpReceiverId),
    },
    { id: "event", label: "Crear primer evento", done: events.length > 0 },
    { id: "photos", label: "Subir fotos", done: (overview?.photoCount ?? 0) > 0 },
    {
      id: "tags",
      label: "Etiquetar dorsales",
      done:
        (overview?.photoCount ?? 0) > 0 &&
        (overview?.taggedPhotoCount ?? 0) >= (overview?.photoCount ?? 0),
    },
    {
      id: "cover",
      label: "Agregar portada",
      done: events.some((e) => Boolean(e.cover_url)),
    },
    { id: "publish", label: "Publicar evento", done: events.some((e) => e.is_published) },
    {
      id: "sale",
      label: "Realizar primera venta",
      done: (overview?.recentSales.length ?? 0) > 0,
    },
  ];
}

export function DashboardChecklist({ overview, events, mpReceiverId }: Props) {
  const items = buildChecklist(overview, events, mpReceiverId);
  const allDone = items.every((i) => i.done);
  const pending = items.filter((i) => !i.done);

  if (allDone) return null;

  return (
    <Card className="ds-dash-reveal">
      <CardHeader>
        <h2 className="ds-h4">Primeros pasos</h2>
        <p className="ds-caption mt-1">
          {pending.length} pendiente{pending.length === 1 ? "" : "s"} · desaparece al completar todo
        </p>
      </CardHeader>
      <CardBody>
        <ul className="ds-dash-checklist__items">
          {items.map((item) => (
            <li
              key={item.id}
              className={`ds-dash-checklist__item ${item.done ? "ds-dash-checklist__item--done" : ""}`}
            >
              {item.done ? (
                <CheckCircle2 className="ds-dash-checklist__icon h-5 w-5 shrink-0" aria-hidden />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-[var(--color-text-disabled)]" aria-hidden />
              )}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
