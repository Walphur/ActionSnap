import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DashboardActivity } from "@/components/photographer/dashboard/DashboardActivity";
import { DashboardChecklist } from "@/components/photographer/dashboard/DashboardChecklist";
import { DashboardHero } from "@/components/photographer/dashboard/DashboardHero";
import { DashboardKpiGrid } from "@/components/photographer/dashboard/DashboardKpiGrid";
import { DashboardMpCard } from "@/components/photographer/dashboard/DashboardMpCard";
import { DashboardQuickActions } from "@/components/photographer/dashboard/DashboardQuickActions";
import { OnboardingTip } from "@/components/photographer/onboarding/OnboardingTip";
import { EventSharePanel } from "@/components/photographer/onboarding/EventSharePanel";
import { formatPrice } from "@/lib/format";
import type { DashboardOverview, EventRow } from "@/types/event";
import { Share2, ShoppingBag } from "lucide-react";

type Tab = "overview" | "events" | "upload" | "settings";

type Props = {
  overview: DashboardOverview | null;
  events: EventRow[];
  photographerName: string;
  mpReceiverId: string;
  showSalesTip: boolean;
  onDismissSalesTip: () => void;
  onNavigate: (tab: Tab) => void;
};

export function DashboardOverviewTab({
  overview,
  events,
  photographerName,
  mpReceiverId,
  showSalesTip,
  onDismissSalesTip,
  onNavigate,
}: Props) {
  const mpConnected = overview?.mpConnected ?? false;
  const publishedEvent = events.find((e) => e.is_published);
  const hasPhotos = (overview?.photoCount ?? 0) > 0;

  return (
    <div className="ds-dashboard">
      {!mpConnected && (
        <DashboardMpCard
          mpConnected={mpConnected}
          mpReceiverId={mpReceiverId}
          onOpenSettings={() => onNavigate("settings")}
          highlight
        />
      )}

      <DashboardHero name={photographerName} overview={overview} />

      <DashboardChecklist
        overview={overview}
        events={events}
        mpReceiverId={mpReceiverId}
        photographerName={photographerName}
      />

      <section className="ds-dash-section">
        <div className="ds-dash-section__head">
          <div>
            <p className="ds-overline">Resumen del día</p>
            <h2 className="ds-h3 mt-1">Métricas clave</h2>
          </div>
        </div>
        <DashboardKpiGrid overview={overview} events={events} />
      </section>

      <section className="ds-dash-section ds-dash-reveal">
        <div className="ds-dash-section__head">
          <div>
            <p className="ds-overline">Actividad</p>
            <h2 className="ds-h3 mt-1">Actividad reciente</h2>
          </div>
        </div>
        <Card>
          <CardBody>
            <DashboardActivity
              overview={overview}
              events={events}
              onNavigate={onNavigate}
            />
          </CardBody>
        </Card>
      </section>

      <section className="ds-dash-section ds-dash-reveal">
        <div className="ds-dash-section__head">
          <div>
            <p className="ds-overline">Ventas</p>
            <h2 className="ds-h3 mt-1">Últimas ventas</h2>
          </div>
        </div>

        {showSalesTip && (
          <OnboardingTip title="Ventas" onDismiss={onDismissSalesTip}>
            Cuando alguien compre tus fotos, la venta aparece acá al instante. Compartí tu evento
            para acelerar las primeras compras.
          </OnboardingTip>
        )}

        <Card>
          <CardHeader>
            <p className="ds-caption">Compras confirmadas en tus eventos</p>
          </CardHeader>
          <CardBody>
            {!overview || overview.recentSales.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No tenés ventas todavía"
                description={
                  publishedEvent
                    ? "Compartí tu evento publicado para que las personas encuentren sus fotos."
                    : "Publicá un evento con fotos etiquetadas para empezar a vender."
                }
                action={
                  publishedEvent ? (
                    <div className="flex flex-col items-center gap-3">
                      <EventSharePanel
                        eventTitle={publishedEvent.title}
                        slug={publishedEvent.slug}
                        compact
                      />
                      {!hasPhotos && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate("upload")}>
                          Subir fotos primero
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button type="button" variant="primary" onClick={() => onNavigate("events")}>
                      {events.length === 0 ? "Crear mi primer evento" : "Ir a publicar"}
                    </Button>
                  )
                }
              />
            ) : (
              <ul className="ds-dash-sales__list">
                {overview.recentSales.map((s) => (
                  <li key={s.id} className="ds-dash-sales__item">
                    <span className="ds-caption">{s.email}</span>
                    <span className="ds-body font-semibold">{formatPrice(s.amountCents)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>

      {publishedEvent && (
        <section className="ds-dash-section ds-dash-reveal">
          <div className="ds-dash-section__head">
            <div>
              <p className="ds-overline">Difusión</p>
              <h2 className="ds-h3 mt-1">Compartí tu cobertura</h2>
            </div>
            <Share2 className="h-5 w-5 text-[var(--color-text-secondary)]" aria-hidden />
          </div>
          <EventSharePanel eventTitle={publishedEvent.title} slug={publishedEvent.slug} />
        </section>
      )}

      <DashboardQuickActions onNavigate={onNavigate} />

      {mpConnected && (
        <DashboardMpCard
          mpConnected={mpConnected}
          mpReceiverId={mpReceiverId}
          onOpenSettings={() => onNavigate("settings")}
          compact
        />
      )}
    </div>
  );
}
