import { BulkTagger } from "@/components/BulkTagger";
import { TagNumbersPanel } from "@/components/TagNumbersPanel";
import { EditEventPanel } from "@/components/admin/EditEventPanel";
import { AdminStats } from "@/components/admin/AdminStats";
import { EventCoverPanel } from "@/components/EventCoverPanel";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { OnboardingTip } from "@/components/photographer/onboarding/OnboardingTip";
import { EventSharePanel } from "@/components/photographer/onboarding/EventSharePanel";
import type { EventRow } from "@/types/event";
import { CalendarPlus, FolderUp, Tags } from "lucide-react";

type Props = {
  events: EventRow[];
  activeSlug: string;
  uploading: boolean;
  uploadProgress: { done: number; total: number };
  showUploadTip: boolean;
  showTaggingTip: boolean;
  onDismissUploadTip: () => void;
  onDismissTaggingTip: () => void;
  onNavigateEvents: () => void;
  onActiveSlugChange: (slug: string) => void;
  onUploadPhotos: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function DashboardUploadTab({
  events,
  activeSlug,
  uploading,
  uploadProgress,
  showUploadTip,
  showTaggingTip,
  onDismissUploadTip,
  onDismissTaggingTip,
  onNavigateEvents,
  onActiveSlugChange,
  onUploadPhotos,
}: Props) {
  const activeEvent = events.find((e) => e.slug === activeSlug);
  const publishedActive = activeEvent?.is_published ?? false;

  if (events.length === 0) {
    return (
      <div className="ds-dashboard">
        <EmptyState
          icon={CalendarPlus}
          title="No tenés eventos"
          description="Creá un evento antes de subir fotos."
          action={
            <Button type="button" variant="primary" onClick={onNavigateEvents}>
              Crear mi primer evento
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="ds-dashboard">
      <section className="ds-dash-section">
        <div className="ds-dash-section__head">
          <div>
            <p className="ds-overline">Flujo de publicación</p>
            <h2 className="ds-h3 mt-1">Subir → Etiquetar → Publicar</h2>
            <p className="ds-caption mt-1">
              Evento activo: <strong>{activeSlug || "—"}</strong> · El etiquetado manual es el paso
              oficial antes de publicar.
            </p>
          </div>
        </div>
      </section>

      {showUploadTip && (
        <OnboardingTip title="Subidas" onDismiss={onDismissUploadTip}>
          Elegí el evento activo y subí lotes de fotos. Se aplica marca de agua automáticamente en
          las previews.
        </OnboardingTip>
      )}

      <Card id="dash-upload-section" className="scroll-mt-24">
        <CardHeader>
          <h2 className="ds-h4">1. Subir fotos</h2>
          <p className="ds-caption mt-1">4 archivos en paralelo · marca de agua automática</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={onUploadPhotos} className="ds-dash-upload-form">
            <Select
              label="Evento activo"
              value={activeSlug}
              onChange={(e) => onActiveSlugChange(e.target.value)}
              required
            >
              <option value="">Seleccionar</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.slug}>
                  {ev.title}
                </option>
              ))}
            </Select>
            <input
              type="file"
              name="photos"
              accept="image/jpeg,image/png,image/webp"
              multiple
              required
              className="ds-dash-file-input"
            />
            {uploading && (
              <div className="ds-dash-progress">
                <div
                  className="ds-dash-progress__bar"
                  style={{
                    width: `${uploadProgress.total ? (uploadProgress.done / uploadProgress.total) * 100 : 0}%`,
                  }}
                />
              </div>
            )}
            <Button type="submit" variant="primary" loading={uploading} className="w-full sm:w-auto">
              {uploading
                ? `Subiendo ${uploadProgress.done}/${uploadProgress.total}…`
                : "Subir lote"}
            </Button>
          </form>

          {activeEvent && activeEvent.photoCount === 0 && !uploading && (
            <div className="mt-6 border-t border-[var(--color-border)] pt-6">
              <EmptyState
                icon={FolderUp}
                title="No hay fotos en este evento"
                description="Elegí archivos arriba y tocá Subir lote para cargar tu primer lote."
              />
            </div>
          )}
        </CardBody>
      </Card>

      {showTaggingTip && (
        <OnboardingTip title="Etiquetado manual" onDismiss={onDismissTaggingTip}>
          Asigná dorsales a cada foto con atajos de teclado y selección múltiple. Es el paso clave
          para que los pilotos encuentren sus imágenes.
        </OnboardingTip>
      )}

      <Card className="ds-bulk-tagger-card">
        <CardHeader>
          <h2 className="ds-h4">2. Etiquetar dorsales (manual)</h2>
          <p className="ds-caption mt-1">
            Atajos de teclado, multiselección y aplicación en lote — optimizado para cientos de fotos.
          </p>
        </CardHeader>
        <CardBody>
          {activeEvent && activeEvent.photoCount === 0 ? (
            <EmptyState
              icon={Tags}
              title="Sin fotos para etiquetar"
              description="Subí fotos en el paso 1 y volvé acá para asignar dorsales manualmente."
              action={
                <Button type="button" variant="secondary" size="sm" onClick={() => {
                  document.querySelector<HTMLInputElement>('input[name="photos"]')?.focus();
                  document.getElementById("dash-upload-section")?.scrollIntoView({ behavior: "smooth" });
                }}>
                  Ir a subir fotos
                </Button>
              }
            />
          ) : (
            <BulkTagger defaultSlug={activeSlug} />
          )}
        </CardBody>
      </Card>

      <div className="ds-dash-upload-grid">
        <Card>
          <CardHeader>
            <h2 className="ds-h4">3. Publicar evento</h2>
            <p className="ds-caption mt-1">Portada, precio y visibilidad</p>
          </CardHeader>
          <CardBody className="space-y-6">
            <EventCoverPanel defaultSlug={activeSlug} />
            <EditEventPanel defaultSlug={activeSlug} />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <AdminStats defaultSlug={activeSlug} />
          </CardBody>
        </Card>
      </div>

      {publishedActive && activeEvent && (
        <EventSharePanel eventTitle={activeEvent.title} slug={activeEvent.slug} />
      )}

      <TagNumbersPanel defaultSlug={activeSlug} />
    </div>
  );
}
