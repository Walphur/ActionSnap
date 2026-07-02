import {
  Calendar,
  CreditCard,
  ImageIcon,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { DashboardOverview } from "@/types/event";

type Props = {
  overview: DashboardOverview | null;
};

export function DashboardKpiGrid({ overview }: Props) {
  if (!overview) {
    return (
      <div className="ds-dash-kpis">
        {Array.from({ length: 6 }).map((_, i) => (
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

  const items: {
    label: string;
    value: string | number | null;
    icon: typeof ShoppingBag;
    placeholder?: string;
    accent?: boolean;
  }[] = [
    { label: "Ventas", value: overview.salesCount, icon: ShoppingBag },
    { label: "Eventos", value: overview.eventsCount, icon: Calendar },
    { label: "Fotos", value: overview.photoCount, icon: ImageIcon },
    {
      label: "Compradores",
      value: overview.recentSales.length > 0 ? overview.recentSales.length : null,
      placeholder: "Sin compradores aún",
      icon: Users,
    },
    { label: "Ingresos", value: overview.sellerTotalLabel, icon: Wallet, accent: true },
    {
      label: "Mercado Pago",
      value: overview.mpConnected ? "Conectado" : "Pendiente",
      icon: CreditCard,
      accent: overview.mpConnected,
    },
  ];

  return (
    <div className="ds-dash-kpis ds-dash-reveal">
      {items.map(({ label, value, icon: Icon, placeholder, accent }) => (
        <Card key={label} className="ds-dash-kpi ds-hover-lift">
          <CardBody>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-[var(--color-text-secondary)]" aria-hidden />
              <p className="ds-dash-kpi__label">{label}</p>
            </div>
            {value !== null && value !== undefined ? (
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
      ))}
    </div>
  );
}
