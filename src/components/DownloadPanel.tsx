import { Download, Package, ShoppingBag } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { createDownloadToken } from "@/lib/download-token";
import type { PurchasePhoto } from "@/lib/purchase-downloads";

type Props = {
  purchaseId: string;
  photos: PurchasePhoto[];
};

export async function DownloadPanel({ purchaseId, photos }: Props) {
  if (photos.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No hay archivos disponibles"
        description="Si acabás de pagar, esperá unos segundos y recargá la página."
        action={
          <ButtonLink href="/mis-compras" variant="secondary">
            Ir a Mis compras
          </ButtonLink>
        }
      />
    );
  }

  const zipToken = await createDownloadToken(purchaseId);

  return (
    <div className="buyer-downloads__panel">
      <div className="buyer-downloads__actions">
        {photos.length > 1 && (
          <a
            href={`/api/download/zip?token=${encodeURIComponent(zipToken)}`}
            className="ds-btn ds-btn--primary ds-btn--sm ds-pressable"
          >
            <Package className="h-4 w-4" aria-hidden />
            Descargar todo en ZIP ({photos.length} fotos)
          </a>
        )}
        <ButtonLink href="/mis-compras" variant="secondary" size="sm">
          <ShoppingBag className="h-4 w-4" aria-hidden />
          Mis compras
        </ButtonLink>
      </div>

      <ul className="buyer-downloads__list">
        {photos.map((photo) => (
          <li key={photo.photoId}>
            <Card>
              <CardBody className="buyer-downloads__item">
                <img
                  src={photo.previewUrl}
                  alt=""
                  className="buyer-downloads__thumb"
                  loading="lazy"
                />
                <a
                  href={photo.downloadUrl}
                  download={photo.fileName}
                  className="ds-btn ds-btn--primary ds-btn--sm ds-pressable shrink-0"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Descargar HD
                </a>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
