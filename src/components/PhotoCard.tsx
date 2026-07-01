"use client";

import { getDisplayPreviewUrl } from "@/lib/preview-url";
import type { PhotoWithNumbers } from "@/lib/types";

type Props = {
  photo: PhotoWithNumbers;
  isSelected: boolean;
  onOpen: () => void;
  onToggleSelect: () => void;
};

export function PhotoCard({ photo, isSelected, onOpen, onToggleSelect }: Props) {
  const primary = photo.photo_numbers?.[0]?.number;

  return (
    <div
      className={`photo-card group ${
        isSelected ? "border-[var(--accent)] ring-2 ring-[var(--accent)]" : ""
      }`}
    >
      <button type="button" className="photo-card-media" onClick={onOpen}>
        <img
          src={getDisplayPreviewUrl(photo)}
          alt={primary ? `Dorsal ${primary}` : "Foto"}
          loading="lazy"
          draggable={false}
          className="pointer-events-none select-none"
        />
        <div
          className="absolute inset-0 z-10"
          aria-hidden
          onContextMenu={(e) => e.preventDefault()}
        />
        <span className="photo-card-overlay" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onToggleSelect}
        className={`absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
          isSelected
            ? "border-[var(--accent)] bg-[var(--accent)] text-white"
            : "photo-card-glass text-white"
        }`}
        aria-label={isSelected ? "Quitar" : "Seleccionar"}
      >
        {isSelected ? "✓" : "+"}
      </button>
      {primary && (
        <span className="photo-card-glass absolute left-2 top-2 z-20 rounded-full px-2.5 py-1 text-xs font-bold text-white">
          #{primary}
        </span>
      )}
    </div>
  );
}
