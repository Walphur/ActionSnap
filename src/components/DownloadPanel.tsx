import Link from "next/link";
import { createDownloadToken } from "@/lib/download-token";
import type { PurchasePhoto } from "@/lib/purchase-downloads";

type Props = {
  purchaseId: string;
  photos: PurchasePhoto[];
};

export async function DownloadPanel({ purchaseId, photos }: Props) {
  const zipToken = await createDownloadToken(purchaseId);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        {photos.length > 1 && (
          <a
            href={`/api/download/zip?token=${encodeURIComponent(zipToken)}`}
            className="btn-primary inline-flex !py-2.5 !text-sm"
          >
            Descargar todo en ZIP ({photos.length} fotos)
          </a>
        )}
        <Link href="/mis-compras" className="btn-secondary inline-flex !py-2.5 !text-sm">
          Mis compras
        </Link>
      </div>

      <ul className="space-y-4">
        {photos.map((photo) => (
          <li
            key={photo.photoId}
            className="card flex items-center justify-between gap-4 p-4"
          >
            <img
              src={photo.previewUrl}
              alt=""
              className="h-20 w-28 rounded-lg object-cover"
            />
            <a
              href={photo.downloadUrl}
              download={photo.fileName}
              className="btn-primary shrink-0 !py-2.5 !text-sm"
            >
              Descargar HD
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
