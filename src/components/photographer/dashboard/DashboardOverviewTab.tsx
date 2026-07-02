import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DashboardActivity } from "@/components/photographer/dashboard/DashboardActivity";
import { DashboardChecklist } from "@/components/photographer/dashboard/DashboardChecklist";
import { DashboardHero } from "@/components/photographer/dashboard/DashboardHero";
import { DashboardKpiGrid } from "@/components/photographer/dashboard/DashboardKpiGrid";
import { DashboardMpCard } from "@/components/photographer/dashboard/DashboardMpCard";
import { DashboardQuickActions } from "@/components/photographer/dashboard/DashboardQuickActions";
import { DashboardEventCard } from "@/components/photographer/dashboard/DashboardEventCard";
import { formatPrice } from "@/lib/format";
import type { DashboardOverview, EventRow } from "@/types/event";
import { CalendarDays, FolderUp, ShoppingBag } from "lucide-react";

type Tab = "overview" | "events" | "upload" | "settings";

type Props = {
  overview: DashboardOverview | null;
  events: EventRow[];
  photographerName: string;
  mpReceiverId: string;
  mpSaving: boolean;
  activeSlug: string;
  uploading: boolean;
  uploadProgress: { done: number; total: number };
  onNavigate: (tab: Tab) => void;
  onSelectEvent: (slug: string, title: string) => void;
  onSaveMpManual: () => void;
  onMpIdChange: (value: string) => void;
};

export function DashboardOverviewTab({
  overview,
  events,
  photographerName,
  mpReceiverId,
  mpSaving,
  activeSlug,
  uploading,
  uploadProgress,
  onNavigate,
  onSelectEvent,
  onSaveMpManual,
  onMpIdChange,
}: Props) {
  const previewEvents = events.slice(0, 3);

  return (
    <div className="ds-dashboard">
      <DashboardHero name={photographerName} overview={overview} />

      <DashboardChecklist overview={overview} events={events} mpReceiverId={mpReceiverId} />

      <section className="ds-dash-section">
        <div className="ds-dash-section__head">
          <div>
            <p className="ds-overline">Resumen del día</p>
            <h2 className="ds-h3 mt-1">Métricas clave</h2>
          </div>
        </div>
        <DashboardKpiGrid overview={overview} />
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
            <DashboardActivity overview={overview} events={events} />
          </CardBody>
        </Card>
      </section>

      <section className="ds-dash-section ds-dash-reveal" aria-labelledby="events-preview-title">
        <div className="ds-dash-section__head">
          <div>
            <p className="ds-overline">Eventos</p>
            <h2 id="events-preview-title" className="ds-h3 mt-1">
              Tus coberturas
            </h2>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate("events")}>
            Ver todos →
          </Button>
        </div>
        {previewEvents.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Sin eventos todavía"
            description="Creá tu primer evento para empezar a subir y vender fotos."
            action={
              <Button type="button" variant="primary" onClick={() => onNavigate("events")}>
                Crear evento
              </Button>
            }
          />
        ) : (
          <div className="ds-dash-events-grid">
            {previewEvents.map((ev) => (
              <DashboardEventCard
                key={ev.id}
                event={ev}
                active={activeSlug === ev.slug}
                onSelect={() => onSelectEvent(ev.slug, ev.title)}
                onUpload={() => {
                  onSelectEvent(ev.slug, ev.title);
                  onNavigate("upload");
                }}
                onTag={() => {
                  onSelectEvent(ev.slug, ev.title);
                  onNavigate("upload");
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="ds-dash-section ds-dash-reveal">
        <div className="ds-dash-section__head">
          <div>
            <p className="ds-overline">Ventas</p>
            <h2 className="ds-h3 mt-1">Últimas ventas</h2>
          </div>
        </div>
        <Card>
          <CardHeader>
            <p className="ds-caption">Compras confirmadas en tus eventos</p>
          </CardHeader>
          <CardBody>
            {!overview || overview.recentSales.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Todavía no hay ventas"
                description="Cuando un piloto compre, aparecerá acá al instante."
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

      <section className="ds-dash-section ds-dash-reveal">
        <div className="ds-dash-section__head">
          <div>
            <p className="ds-overline">Subidas</p>
            <h2 className="ds-h3 mt-1">Estado de subidas</h2>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => onNavigate("upload")}>
            Ir a subir
          </Button>
        </div>
        <Card>
          <CardBody>
            {uploading ? (
              <div className="space-y-3">
                <p className="ds-body">
                  Subiendo {uploadProgress.done}/{uploadProgress.total} fotos…
                </p>
                <div className="ds-dash-progress">
                  <div
                    className="ds-dash-progress__bar"
                    style={{
                      width: `${uploadProgress.total ? (uploadProgress.done / uploadProgress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <EmptyState
                icon={FolderUp}
                title={overview?.photoCount ? `${overview.photoCount} fotos en plataforma` : "Sin fotos subidas"}
                description={
                  activeSlug
                    ? `Evento activo: ${activeSlug}`
                    : "Elegí un evento y subí tu primer lote."
                }
                action={
                  <Button type="button" variant="primary" onClick={() => onNavigate("upload")}>
                    Subir fotos
                  </Button>
                }
              />
            )}
          </CardBody>
        </Card>
      </section>

      <DashboardQuickActions onNavigate={onNavigate} />

      <DashboardMpCard
        mpConnected={overview?.mpConnected ?? false}
        mpReceiverId={mpReceiverId}
        mpSaving={mpSaving}
        onSaveManual={onSaveMpManual}
        onMpIdChange={onMpIdChange}
        onOpenSettings={() => onNavigate("settings")}
        compact
      />
    </div>
  );
}
