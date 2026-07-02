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
import { OnboardingTip } from "@/components/photographer/onboarding/OnboardingTip";
import { EventSharePanel } from "@/components/photographer/onboarding/EventSharePanel";
import { formatPrice } from "@/lib/format";
import type { DashboardOverview, EventRow } from "@/types/event";
import { CalendarDays, FolderUp, Share2, ShoppingBag } from "lucide-react";

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
  showSalesTip: boolean;
  onDismissSalesTip: () => void;
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
  showSalesTip,
  onDismissSalesTip,
  onNavigate,
  onSelectEvent,
  onSaveMpManual,
  onMpIdChange,
}: Props) {
  const previewEvents = events.slice(0, 3);
  const mpConnected = overview?.mpConnected ?? false;
  const publishedEvent = events.find((e) => e.is_published);
  const hasPhotos = (overview?.photoCount ?? 0) > 0;

  return (
    <div className="ds-dashboard">
      {!mpConnected && (
        <DashboardMpCard
          mpConnected={mpConnected}
          mpReceiverId={mpReceiverId}
          mpSaving={mpSaving}
          onSaveManual={onSaveMpManual}
          onMpIdChange={onMpIdChange}
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

      <section className="ds-dash-section ds-dash-reveal" aria-labelledby="events-preview-title">
        <div className="ds-dash-section__head">
          <div>
            <p className="ds-overline">Eventos</p>
            <h2 id="events-preview-title" className="ds-h3 mt-1">
              Tus coberturas
            </h2>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate("events")}>
            Ver todos
          </Button>
        </div>
        {previewEvents.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No tenés eventos"
            description="Creá tu primer evento para empezar a subir y vender fotos."
            action={
              <Button type="button" variant="primary" onClick={() => onNavigate("events")}>
                Crear mi primer evento
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

        {showSalesTip && (
          <OnboardingTip title="Ventas" onDismiss={onDismissSalesTip}>
            Cuando un piloto compre tus fotos, la venta aparece acá al instante. Compartí tu evento
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
                    ? "Compartí tu evento publicado para que los pilotos encuentren sus fotos."
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
            ) : !hasPhotos ? (
              <EmptyState
                icon={FolderUp}
                title="No hay fotos"
                description={
                  events.length === 0
                    ? "Creá un evento y subí tu primer lote de fotos."
                    : "Subí tus primeras fotos al evento activo."
                }
                action={
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => onNavigate(events.length === 0 ? "events" : "upload")}
                  >
                    {events.length === 0 ? "Crear mi primer evento" : "Subir mis primeras fotos"}
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="ds-body">
                  <strong>{overview?.photoCount}</strong> fotos en plataforma
                  {activeSlug && (
                    <span className="ds-caption block mt-1">Evento activo: {activeSlug}</span>
                  )}
                </p>
                <Button type="button" variant="secondary" size="sm" onClick={() => onNavigate("upload")}>
                  Subir más fotos
                </Button>
              </div>
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
          mpSaving={mpSaving}
          onSaveManual={onSaveMpManual}
          onMpIdChange={onMpIdChange}
          onOpenSettings={() => onNavigate("settings")}
          compact
        />
      )}
    </div>
  );
}
