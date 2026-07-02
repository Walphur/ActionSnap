import { BulkTagger } from "@/components/BulkTagger";
import { TagNumbersPanel } from "@/components/TagNumbersPanel";
import { EditEventPanel } from "@/components/admin/EditEventPanel";
import { AdminStats } from "@/components/admin/AdminStats";
import { EventCoverPanel } from "@/components/EventCoverPanel";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import type { EventRow } from "@/types/event";

type Props = {
  events: EventRow[];
  activeSlug: string;
  uploading: boolean;
  uploadProgress: { done: number; total: number };
  onActiveSlugChange: (slug: string) => void;
  onUploadPhotos: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function DashboardUploadTab({
  events,
  activeSlug,
  uploading,
  uploadProgress,
  onActiveSlugChange,
  onUploadPhotos,
}: Props) {
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

      <Card>
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
        </CardBody>
      </Card>

      <Card className="ds-bulk-tagger-card">
        <CardHeader>
          <h2 className="ds-h4">2. Etiquetar dorsales (manual)</h2>
          <p className="ds-caption mt-1">
            Atajos de teclado, multiselección y aplicación en lote — optimizado para cientos de fotos.
          </p>
        </CardHeader>
        <CardBody>
          <BulkTagger defaultSlug={activeSlug} />
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

      <TagNumbersPanel defaultSlug={activeSlug} />
    </div>
  );
}
