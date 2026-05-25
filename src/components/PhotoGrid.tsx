"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { PhotoWithNumbers } from "@/lib/types";

type Props = {
  photos: PhotoWithNumbers[];
  priceCents: number;
  eventSlug: string;
};

export function PhotoGrid({ photos, priceCents, eventSlug }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function checkout() {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoIds: Array.from(selected),
          eventSlug,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Error al iniciar el pago");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => {
          const primary =
            photo.ai_status === "manual" ? photo.photo_numbers?.[0]?.number : undefined;
          const isSelected = selected.has(photo.id);
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => toggle(photo.id)}
              className={`relative overflow-hidden rounded-lg border text-left transition ${
                isSelected
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]"
                  : "border-[var(--border)] hover:border-[var(--muted)]"
              }`}
            >
              <div className="relative aspect-[4/3] bg-[var(--surface)]">
                {/* img nativo: evita bloqueo de next/image con URLs de Supabase Storage */}
                <img
                  src={photo.preview_url}
                  alt={primary ? `Dorsal ${primary}` : "Foto de carrera"}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              {primary ? (
                <span className="absolute left-2 top-2 rounded bg-[var(--accent)] px-2.5 py-1 text-lg font-black text-black">
                  #{primary}
                </span>
              ) : (
                <span className="absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-xs text-[var(--muted)]">
                  Pendiente
                </span>
              )}
              {photo.ai_status === "manual" && (photo.bike_color || photo.rider_color) && (
                <span className="absolute bottom-2 left-2 rounded bg-black/75 px-2 py-0.5 text-xs capitalize text-white">
                  {photo.bike_color && `Moto ${photo.bike_color}`}
                  {photo.bike_color && photo.rider_color && " · "}
                  {photo.rider_color && `Piloto ${photo.rider_color}`}
                </span>
              )}
              {isSelected && (
                <span className="absolute right-2 bottom-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-black">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--surface)] p-4 shadow-lg">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <p>
              {selected.size} foto{selected.size > 1 ? "s" : ""} ·{" "}
              <strong>{formatPrice(priceCents * selected.size)}</strong>
            </p>
            <button
              type="button"
              onClick={checkout}
              disabled={loading}
              className="rounded-lg bg-[var(--accent)] px-6 py-2 font-semibold text-black hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {loading ? "Redirigiendo…" : "Pagar y descargar"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
