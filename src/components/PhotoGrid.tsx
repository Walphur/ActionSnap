"use client";

import { useMemo, useState } from "react";
import { ContactHelp } from "@/components/ContactHelp";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { formatPrice } from "@/lib/format";
import { getDisplayPreviewUrl } from "@/lib/preview-url";
import type { PhotoWithNumbers } from "@/lib/types";

type Props = {
  photos: PhotoWithNumbers[];
  priceCents: number;
  eventSlug: string;
  eventTitle: string;
  packDiscountPercent?: number;
  filterDorsal?: string;
  paymentLabel?: string | null;
};

export function PhotoGrid({
  photos,
  priceCents,
  eventSlug,
  eventTitle,
  packDiscountPercent = 20,
  filterDorsal,
  paymentLabel = "Mercado Pago",
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [packMode, setPackMode] = useState(false);
  const [checkoutLabel, setCheckoutLabel] = useState(paymentLabel ?? "Mercado Pago");

  const lightboxPhoto = photos.find((p) => p.id === lightboxId);

  const packPhotos = useMemo(() => {
    if (!filterDorsal) return [];
    return photos.filter(
      (p) =>
        p.ai_status === "manual" &&
        p.photo_numbers?.some((n) => n.number === filterDorsal)
    );
  }, [photos, filterDorsal]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectPack() {
    setPackMode(true);
    setSelected(new Set(packPhotos.map((p) => p.id)));
  }

  const count = selected.size;
  const subtotal = priceCents * count;
  const discount =
    packMode && count === packPhotos.length && count > 1
      ? Math.round((subtotal * packDiscountPercent) / 100)
      : 0;
  const total = subtotal - discount;

  async function checkout() {
    if (count === 0) return;
    if (!email.trim() || !email.includes("@")) {
      setShowCheckout(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoIds: Array.from(selected),
          eventSlug,
          email: email.trim(),
          packDiscount: discount > 0 ? packDiscountPercent : 0,
        }),
      });
      const data = await res.json();
      if (data.url) {
        if (data.providerLabel) setCheckoutLabel(data.providerLabel);
        window.location.href = data.url;
      } else alert(data.error ?? "Error al iniciar el pago");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Tocá una foto para verla grande. Seleccioná las que quieras comprar. Vista previa con
        marca de agua; la descarga en HD es sin marca.
      </p>

      {filterDorsal && packPhotos.length > 1 && (
        <div className="card mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm">
            <strong className="text-[var(--accent)]">Pack dorsal #{filterDorsal}</strong> —{" "}
            {packPhotos.length} fotos con {packDiscountPercent}% off
          </p>
          <button type="button" onClick={selectPack} className="btn-primary !py-2 !text-sm">
            Seleccionar todas ({formatPrice(
              Math.round(packPhotos.length * priceCents * (1 - packDiscountPercent / 100))
            )})
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => {
          const primary =
            photo.ai_status === "manual" ? photo.photo_numbers?.[0]?.number : undefined;
          const isSelected = selected.has(photo.id);
          return (
            <div
              key={photo.id}
              className={`group relative overflow-hidden rounded-[var(--radius-lg)] border transition ${
                isSelected
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]"
                  : "border-[var(--border)]"
              }`}
            >
              <button
                type="button"
                className="relative block w-full aspect-[4/3]"
                onClick={() => setLightboxId(photo.id)}
              >
                <img
                  src={getDisplayPreviewUrl(photo)}
                  alt={primary ? `Dorsal ${primary}` : "Foto"}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </button>
              <button
                type="button"
                onClick={() => toggle(photo.id)}
                className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  isSelected
                    ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                    : "border-white/70 bg-black/50 text-white"
                }`}
                aria-label={isSelected ? "Quitar" : "Seleccionar"}
              >
                {isSelected ? "✓" : "+"}
              </button>
              {primary && (
                <span className="absolute left-2 top-2 rounded bg-[var(--accent)] px-2 py-0.5 text-xs font-bold text-black">
                  #{primary}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <ContactHelp eventTitle={eventTitle} />

      {lightboxPhoto && (
        <PhotoLightbox
          photo={lightboxPhoto}
          onClose={() => setLightboxId(null)}
          onToggleSelect={() => {
            toggle(lightboxPhoto.id);
          }}
          isSelected={selected.has(lightboxPhoto.id)}
        />
      )}

      {showCheckout && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowCheckout(false)}
        >
          <div className="card max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display mb-2 text-lg font-bold">Antes de pagar</h3>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Tu email para enviarte el link de descarga. Pago seguro con {checkoutLabel}.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="mb-4 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3"
            />
            <p className="mb-4 text-xs text-[var(--muted)]">
              ¿Preferís pagar por WhatsApp o transferencia? Usá el botón de contacto abajo.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowCheckout(false);
                checkout();
              }}
              disabled={loading || !email.includes("@")}
              className="btn-primary w-full"
            >
              Ir a pagar con {checkoutLabel} — {formatPrice(total)}
            </button>
          </div>
        </div>
      )}

      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] glass px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-[var(--muted)]">Tu selección</p>
              <p className="font-display text-lg font-bold sm:text-xl">
                {count} foto{count > 1 ? "s" : ""}{" "}
                {discount > 0 && (
                  <span className="text-sm font-normal text-[var(--muted)] line-through">
                    {formatPrice(subtotal)}{" "}
                  </span>
                )}
                <span className="text-[var(--accent)]">{formatPrice(total)}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="hidden min-w-[180px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm sm:block"
              />
              <button
                type="button"
                onClick={() => (email.includes("@") ? checkout() : setShowCheckout(true))}
                disabled={loading}
                className="btn-primary flex-1 sm:flex-none"
              >
                {loading ? "…" : `Pagar con ${checkoutLabel}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {count > 0 && <div className="h-28" aria-hidden />}
    </>
  );
}
