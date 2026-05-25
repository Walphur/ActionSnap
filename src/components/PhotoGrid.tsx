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

  const total = priceCents * selected.size;

  return (
    <>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Tocá las fotos para seleccionarlas. Vista previa con marca de agua; la descarga en HD
        es sin marca después del pago.
      </p>

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
              className={`group relative overflow-hidden rounded-[var(--radius-lg)] border text-left transition duration-200 ${
                isSelected
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]"
                  : "border-[var(--border)] hover:border-[var(--muted)]/50"
              }`}
            >
              <div className="relative aspect-[4/3] bg-[var(--surface)]">
                <img
                  src={photo.preview_url}
                  alt={primary ? `Dorsal ${primary}` : "Foto de carrera"}
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div
                  className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.18]"
                  aria-hidden
                >
                  <span className="rotate-[-18deg] select-none font-display text-2xl font-extrabold tracking-widest text-white md:text-3xl">
                    MOTOFOTOS
                  </span>
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {primary && (
                <span className="absolute left-3 top-3 rounded-md bg-[var(--accent)] px-2.5 py-1 font-display text-sm font-bold text-black shadow-lg">
                  #{primary}
                </span>
              )}

              {photo.ai_status === "manual" && (photo.bike_color || photo.rider_color) && (
                <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-xs capitalize text-white/90 backdrop-blur-sm">
                  {photo.bike_color && `Moto ${photo.bike_color}`}
                  {photo.bike_color && photo.rider_color && " · "}
                  {photo.rider_color && `Piloto ${photo.rider_color}`}
                </span>
              )}

              <span
                className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                  isSelected
                    ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                    : "border-white/60 bg-black/40 text-transparent group-hover:border-white"
                }`}
              >
                {isSelected && (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] glass px-4 py-4 shadow-2xl">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--muted)]">Tu selección</p>
              <p className="font-display text-xl font-bold">
                {selected.size} foto{selected.size > 1 ? "s" : ""}{" "}
                <span className="text-[var(--accent)]">{formatPrice(total)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={checkout}
              disabled={loading}
              className="btn-primary min-w-[200px] disabled:opacity-60"
            >
              {loading ? "Redirigiendo al pago…" : "Pagar y descargar"}
            </button>
          </div>
        </div>
      )}

      {selected.size > 0 && <div className="h-24" aria-hidden />}
    </>
  );
}
