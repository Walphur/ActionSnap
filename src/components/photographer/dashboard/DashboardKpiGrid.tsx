import {
  CalendarCheck,
  ImageIcon,
  ShoppingBag,
  Tags,
  Wallet,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { DashboardOverview, EventRow } from "@/types/event";

type Props = {
  overview: DashboardOverview | null;
  events: EventRow[];
};

export function DashboardKpiGrid({ overview, events }: Props) {
  if (!overview) {
    return (
      <div className="ds-dash-kpis">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardBody>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-7 w-16" />
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  const publishedCount = events.filter((e) => e.is_published).length;

  const items = [
    { label: "Eventos publicados", value: publishedCount, icon: CalendarCheck },
    { label: "Fotos subidas", value: overview.photoCount, icon: ImageIcon },
    { label: "Fotos etiquetadas", value: overview.taggedPhotoCount, icon: Tags },
    { label: "Ventas confirmadas", value: overview.salesCount, icon: ShoppingBag },
    {
      label: "Tu ingreso (bruto MP)",
      value: overview.sellerTotalLabel,
      icon: Wallet,
      accent: true,
    },
  ] as const;

  return (
    <div className="ds-dash-kpis ds-dash-reveal">
      {items.map(({ label, value, icon: Icon, ...rest }) => (
        <Card key={label} className="ds-dash-kpi ds-hover-lift">
          <CardBody>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" aria-hidden />
              <p className="ds-dash-kpi__label">{label}</p>
            </div>
            <p
              className={`ds-dash-kpi__value ${"accent" in rest && rest.accent ? "ds-dash-kpi__value--accent" : ""}`}
            >
              {value}
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
