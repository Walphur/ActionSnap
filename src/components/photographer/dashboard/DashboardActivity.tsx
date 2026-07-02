import { CalendarDays, CreditCard, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatPrice } from "@/lib/format";
import type { DashboardOverview, EventRow } from "@/types/event";

type Tab = "overview" | "events" | "upload" | "settings";

type ActivityItem = {
  id: string;
  type: "sale" | "event";
  title: string;
  subtitle: string;
  time: string;
};

function buildActivity(overview: DashboardOverview | null, events: EventRow[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const sale of overview?.recentSales ?? []) {
    items.push({
      id: `sale-${sale.id}`,
      type: "sale",
      title: `Venta confirmada · ${formatPrice(sale.amountCents)}`,
      subtitle: sale.email,
      time: sale.createdAt,
    });
  }

  for (const ev of events.slice(0, 5)) {
    items.push({
      id: `event-${ev.id}`,
      type: "event",
      title: ev.title,
      subtitle: `${ev.photoCount} fotos · ${ev.is_published ? "Publicado" : "Borrador"}`,
      time: ev.event_date,
    });
  }

  return items
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);
}

const ICONS = {
  sale: CreditCard,
  event: CalendarDays,
} as const;

type Props = {
  overview: DashboardOverview | null;
  events: EventRow[];
  onNavigate?: (tab: Tab) => void;
};

export function DashboardActivity({ overview, events, onNavigate }: Props) {
  const activity = buildActivity(overview, events);
  const hasSales = (overview?.recentSales.length ?? 0) > 0;

  if (activity.length === 0) {
    const publishedEvent = events.find((e) => e.is_published);

    return (
      <EmptyState
        icon={ImageIcon}
        title="Sin actividad reciente"
        description={
          events.length === 0
            ? "Creá tu primer evento para empezar."
            : hasSales
              ? "Subí fotos o creá eventos para ver actividad acá."
              : publishedEvent
                ? "Compartí tu evento publicado para generar ventas."
                : "Subí fotos y publicá tu evento para empezar a vender."
        }
        action={
          onNavigate ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() =>
                onNavigate(events.length === 0 ? "events" : publishedEvent ? "events" : "upload")
              }
            >
              {events.length === 0
                ? "Crear mi primer evento"
                : publishedEvent
                  ? "Ver eventos"
                  : "Subir fotos"}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <ul className="ds-dash-activity__list">
      {activity.map((item) => {
        const Icon = ICONS[item.type];
        return (
          <li key={item.id} className="ds-dash-activity__item">
            <span className="ds-dash-activity__icon">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="ds-dash-activity__meta">
              <p className="ds-body font-medium">{item.title}</p>
              <p className="ds-caption">{item.subtitle}</p>
            </div>
            <time className="ds-dash-activity__time" dateTime={item.time}>
              {formatDate(item.time)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
