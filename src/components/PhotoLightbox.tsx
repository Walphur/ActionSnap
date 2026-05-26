"use client";

import { getDisplayPreviewUrl } from "@/lib/preview-url";
import type { PhotoWithNumbers } from "@/lib/types";

type Props = {
  photo: PhotoWithNumbers;
  onClose: () => void;
  onToggleSelect: () => void;
  isSelected: boolean;
};

export function PhotoLightbox({ photo, onClose, onToggleSelect, isSelected }: Props) {
  const dorsal = photo.photo_numbers?.[0]?.number;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4"
      role="dialog"
      aria-modal
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
      >
        Cerrar ✕
      </button>
      <div
        className="relative max-h-[85vh] max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={getDisplayPreviewUrl(photo)}
          alt={dorsal ? `Dorsal ${dorsal}` : "Foto"}
          className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
          draggable={false}
        />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {dorsal && (
            <span className="rounded-md bg-[var(--accent)] px-3 py-1 font-bold text-black">
              #{dorsal}
            </span>
          )}
          <button type="button" onClick={onToggleSelect} className="btn-primary">
            {isSelected ? "Quitar de la selección" : "Agregar a la compra"}
          </button>
        </div>
      </div>
    </div>
  );
}
