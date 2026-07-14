import { BulkTagger } from "@/components/BulkTagger";
import { EditEventPanel } from "@/components/admin/EditEventPanel";
import { AdminStats } from "@/components/admin/AdminStats";
import { EventCoverPanel } from "@/components/EventCoverPanel";
import { EventPublishPanel } from "@/components/photographer/EventPublishPanel";
import { PhotoUploader } from "@/components/photographer/PhotoUploader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { OnboardingTip } from "@/components/photographer/onboarding/OnboardingTip";
import type { EventRow } from "@/types/event";

import { CalendarPlus, FolderUp, Tags } from "lucide-react";

type Props = {
  events: EventRow[];
  activeSlug: string;
  mpConnected: boolean;
  uploading: boolean;
  uploadProgress: { done: number; total: number };
  uploadAllSucceeded?: boolean;
  showUploadTip: boolean;
  showTaggingTip: boolean;
  onDismissUploadTip: () => void;
  onDismissTaggingTip: () => void;
  onNavigateEvents: () => void;
  onActiveSlugChange: (slug: string) => void;
  onUploadFiles: (files: File[]) => void | Promise<void>;
  onRefresh?: () => void;
};

export function DashboardUploadTab({
  events,
  activeSlug,
  mpConnected,
  uploading,
  uploadProgress,
  uploadAllSucceeded,
  showUploadTip,
  showTaggingTip,
  onDismissUploadTip,
  onDismissTaggingTip,
  onNavigateEvents,
  onActiveSlugChange,
  onUploadFiles,
  onRefresh,
}: Props) {
  const activeEvent = events.find((e) => e.slug === activeSlug);

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

      {activeSlug && (
        <Card>
          <CardBody>
            <AdminStats defaultSlug={activeSlug} hideSlugInput />
          </CardBody>
        </Card>
      )}

      {showUploadTip && (
        <OnboardingTip title="Subidas" onDismiss={onDismissUploadTip}>
          Elegí el evento activo y subí lotes de fotos. Se aplica marca de agua automáticamente en
          las previews.
        </OnboardingTip>
      )}

      <Card id="dash-upload-section" className="scroll-mt-24">
        <CardHeader>
          <h2 className="ds-h4">1. Subir fotos</h2>
          <p className="ds-caption mt-1">
            Marca de agua en preview · HD directo a Cloudflare
          </p>
        </CardHeader>
        <CardBody>
          <Select
            label="Evento activo"
            value={activeSlug}
            onChange={(e) => onActiveSlugChange(e.target.value)}
            required
            className="mb-6"
          >
            <option value="">Seleccionar</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.slug}>
                {ev.title}
              </option>
            ))}
          </Select>

          <PhotoUploader
            disabled={!activeSlug}
            uploading={uploading}
            uploadProgress={uploadProgress}
            uploadAllSucceeded={uploadAllSucceeded}
            onUpload={onUploadFiles}
          />

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
          Asigná número y colores a cada foto con atajos de teclado y selección múltiple. Es el paso
          clave para que cada persona encuentre sus imágenes.
        </OnboardingTip>
      )}

      <Card className="ds-bulk-tagger-card">
        <CardHeader>
          <h2 className="ds-h4">2. Etiquetar fotos (manual)</h2>
          <p className="ds-caption mt-1">
            Atajos de teclado, multiselección y aplicación en lote — optimizado para cientos de fotos.
          </p>
        </CardHeader>
        <CardBody>
          {activeEvent && activeEvent.photoCount === 0 ? (
            <EmptyState
              icon={Tags}
              title="Sin fotos para etiquetar"
              description="Subí fotos en el paso 1 y volvé acá para etiquetarlas manualmente."
              action={
                <Button type="button" variant="secondary" size="sm" onClick={() => {
                  document.getElementById("dash-upload-section")?.scrollIntoView({ behavior: "smooth" });
                }}>
                  Ir a subir fotos
                </Button>
              }
            />
          ) : (
            <BulkTagger
              defaultSlug={activeSlug}
              refreshToken={`${activeSlug}-${activeEvent?.photoCount ?? 0}`}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="ds-h4">3. Publicar evento</h2>
          <p className="ds-caption mt-1">Revisá el resumen, completá el checklist y publicá</p>
        </CardHeader>
        <CardBody className="space-y-6">
          <EventCoverPanel defaultSlug={activeSlug} onSaved={onRefresh} />
          <EditEventPanel
            defaultSlug={activeSlug}
            event={activeEvent}
            onSaved={onRefresh}
          />
          <EventPublishPanel
            event={activeEvent}
            mpConnected={mpConnected}
            onPublished={onRefresh}
          />
        </CardBody>
      </Card>
    </div>
  );
}
