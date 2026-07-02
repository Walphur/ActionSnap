import { BulkTagger } from "@/components/BulkTagger";
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
            <p className="ds-overline">Subidas</p>
            <h2 className="ds-h3 mt-1">Subir y etiquetar</h2>
            <p className="ds-caption mt-1">
              Evento activo: <strong>{activeSlug || "—"}</strong>
            </p>
          </div>
        </div>
      </section>

      <div className="ds-dash-upload-grid">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="ds-h4">Etiquetar dorsales</h2>
              <p className="ds-caption mt-1">Dorsal y color a mano</p>
            </CardHeader>
            <CardBody>
              <BulkTagger defaultSlug={activeSlug} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="ds-h4">Subir fotos</h2>
              <p className="ds-caption mt-1">4 archivos en paralelo · marca de agua automática</p>
            </CardHeader>
            <CardBody>
              <form onSubmit={onUploadPhotos} className="space-y-4">
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
                <Button type="submit" variant="primary" loading={uploading} className="w-full">
                  {uploading
                    ? `Subiendo ${uploadProgress.done}/${uploadProgress.total}…`
                    : "Subir lote"}
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <EventCoverPanel defaultSlug={activeSlug} />
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <EditEventPanel defaultSlug={activeSlug} />
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <AdminStats defaultSlug={activeSlug} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
