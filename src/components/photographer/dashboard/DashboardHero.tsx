import { Hand } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { DashboardOverview } from "@/types/event";

type Props = {
  name: string;
  overview: DashboardOverview | null;
};

function KpiTile({
  label,
  value,
  accent,
  placeholder,
}: {
  label: string;
  value: string | number | null;
  accent?: boolean;
  placeholder?: string;
}) {
  return (
    <Card className="ds-dash-kpi ds-hover-lift">
      <CardBody>
        <p className="ds-dash-kpi__label">{label}</p>
        {value !== null ? (
          <p className={`ds-dash-kpi__value ${accent ? "ds-dash-kpi__value--accent" : ""}`}>
            {value}
          </p>
        ) : (
          <>
            <p className="ds-dash-kpi__value ds-dash-kpi__placeholder">—</p>
            {placeholder && <p className="ds-dash-kpi__hint">{placeholder}</p>}
          </>
        )}
      </CardBody>
    </Card>
  );
}

export function DashboardHero({ name, overview }: Props) {
  const greeting = name.trim() || "Fotógrafo";
  const loading = !overview;

  return (
    <section className="ds-dash-hero ds-dash-reveal" aria-labelledby="dash-hero-title">
      <div className="ds-dash-hero__welcome">
        <p className="ds-dash-hero__greeting ds-overline">
          <Hand className="h-4 w-4" aria-hidden />
          Bienvenida
        </p>
        <h1 id="dash-hero-title" className="ds-h2 ds-dash-hero__title">
          Hola, {greeting}
        </h1>
        <p className="ds-body-lg ds-dash-hero__subtitle">
          Tu centro de operaciones: ventas, eventos y próximos pasos en un solo lugar.
        </p>
      </div>

      <div className="ds-dash-hero__summary">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-3 h-8 w-24" />
              </CardBody>
            </Card>
          ))
        ) : (
          <>
            <KpiTile label="Tu ingreso" value={overview.sellerTotalLabel} accent />
            <KpiTile label="Eventos" value={overview.eventsCount} />
            <KpiTile label="Fotos" value={overview.photoCount} />
            <KpiTile label="Ventas recientes" value={overview.salesCount} />
          </>
        )}
      </div>
    </section>
  );
}
