"use client";

import { Check, Heart, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getDisplayPreviewUrl } from "@/lib/preview-url";
import type { PhotoWithNumbers } from "@/lib/types";

type Props = {
  photo: PhotoWithNumbers;
  isSelected: boolean;
  isFavorite: boolean;
  onOpen: () => void;
  onToggleSelect: () => void;
  onToggleFavorite: () => void;
};

export function PhotoCard({
  photo,
  isSelected,
  isFavorite,
  onOpen,
  onToggleSelect,
  onToggleFavorite,
}: Props) {
  const primary = photo.photo_numbers?.[0]?.number;

  return (
    <article className={`buyer-photo ds-hover-lift ${isSelected ? "buyer-photo--selected" : ""}`}>
      <button type="button" className="buyer-photo__media" onClick={onOpen} aria-label="Ampliar foto">
        <img
          src={getDisplayPreviewUrl(photo)}
          alt={primary ? `Número ${primary}` : "Foto"}
          loading="lazy"
          draggable={false}
          className="pointer-events-none select-none"
        />
        <span className="buyer-photo__overlay" aria-hidden />
      </button>

      <div className="buyer-photo__actions">
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`buyer-photo__action ${isFavorite ? "buyer-photo__action--favorite-active" : ""}`}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          title="Favoritos (próximamente sincronizado)"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onToggleSelect}
          className={`buyer-photo__action ${isSelected ? "buyer-photo__action--selected" : ""}`}
          aria-label={isSelected ? "Quitar de la compra" : "Agregar a la compra"}
        >
          {isSelected ? <Check className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
        </button>
      </div>

      {primary && (
        <div className="buyer-photo__badge">
          <Badge>#{primary}</Badge>
        </div>
      )}
    </article>
  );
}
