"use client";

import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getDisplayPreviewUrl } from "@/lib/preview-url";
import type { PhotoWithNumbers } from "@/lib/types";

type Props = {
  photos: PhotoWithNumbers[];
  index: number;
  isSelected: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onToggleSelect: () => void;
  onToggleFavorite: () => void;
};

export function PhotoLightbox({
  photos,
  index,
  isSelected,
  isFavorite,
  onClose,
  onNavigate,
  onToggleSelect,
  onToggleFavorite,
}: Props) {
  const photo = photos[index];
  const touchStartX = useRef<number | null>(null);
  const dorsal = photo?.photo_numbers?.[0]?.number;

  const goPrev = useCallback(() => {
    if (index > 0) onNavigate(index - 1);
  }, [index, onNavigate]);

  const goNext = useCallback(() => {
    if (index < photos.length - 1) onNavigate(index + 1);
  }, [index, photos.length, onNavigate]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  if (!photo) return null;

  return (
    <div className="buyer-lightbox" role="dialog" aria-modal aria-label="Vista ampliada">
      <div
        className="buyer-lightbox__stage"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          const end = e.changedTouches[0]?.clientX;
          if (start == null || end == null) return;
          const delta = end - start;
          if (delta > 60) goPrev();
          if (delta < -60) goNext();
          touchStartX.current = null;
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="buyer-lightbox__close !text-white"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </Button>

        {index > 0 && (
          <button type="button" className="buyer-lightbox__nav buyer-lightbox__nav--prev" onClick={goPrev} aria-label="Anterior">
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div className="buyer-lightbox__image-wrap">
          <img
            src={getDisplayPreviewUrl(photo)}
            alt={dorsal ? `Número ${dorsal}` : "Foto"}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        {index < photos.length - 1 && (
          <button type="button" className="buyer-lightbox__nav buyer-lightbox__nav--next" onClick={goNext} aria-label="Siguiente">
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      <aside className="buyer-lightbox__sidebar">
        <div>
          <p className="ds-overline">Foto {index + 1} de {photos.length}</p>
          {dorsal && (
            <p className="ds-h3 mt-2">#{dorsal}</p>
          )}
          {photo.bike_color && (
            <p className="ds-caption mt-2">Color principal: {photo.bike_color}</p>
          )}
          {photo.rider_color && (
            <p className="ds-caption">Color secundario: {photo.rider_color}</p>
          )}
        </div>

        <div className="buyer-lightbox__sidebar-actions">
          <Button type="button" variant={isSelected ? "secondary" : "primary"} onClick={onToggleSelect}>
            {isSelected ? "Quitar de la compra" : "Agregar a la compra"}
          </Button>
          <Button type="button" variant="outline" onClick={onToggleFavorite}>
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-pink-400" : ""}`} aria-hidden />
            {isFavorite ? "En favoritos" : "Favorito"}
          </Button>
        </div>

        <p className="buyer-lightbox__sidebar-note">
          Vista previa con marca de agua. La descarga HD es sin marca después del pago.
        </p>

        {dorsal && <Badge tone="info">#{dorsal}</Badge>}
      </aside>
    </div>
  );
}
