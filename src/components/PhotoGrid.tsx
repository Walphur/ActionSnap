"use client";

import { useMemo, useState } from "react";
import { ContactHelp } from "@/components/ContactHelp";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { TurnstileWidget, turnstileEnabled } from "@/components/TurnstileWidget";
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const needsCaptcha = turnstileEnabled();

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
      if (needsCaptcha && !turnstileToken) {
        setShowCheckout(true);
        alert("Completá la verificación anti-robot antes de pagar.");
        return;
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoIds: Array.from(selected),
          eventSlug,
          email: email.trim(),
          packDiscount: discount > 0 ? packDiscountPercent : 0,
          turnstileToken: turnstileToken ?? undefined,
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

      <div className="photo-masonry">
        {photos.map((photo) => {
          const primary =
            photo.ai_status === "manual" ? photo.photo_numbers?.[0]?.number : undefined;
          const isSelected = selected.has(photo.id);
          return (
            <div key={photo.id} className="photo-masonry-item">
              <div
                className={`photo-card group ${
                  isSelected ? "border-[var(--accent)] ring-2 ring-[var(--accent)]" : ""
                }`}
              >
                <button
                  type="button"
                  className="photo-card-media"
                  onClick={() => setLightboxId(photo.id)}
                >
                  <img
                    src={getDisplayPreviewUrl(photo)}
                    alt={primary ? `Dorsal ${primary}` : "Foto"}
                    loading="lazy"
                    draggable={false}
                  />
                  <span className="photo-card-overlay" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => toggle(photo.id)}
                  className={`absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "photo-card-glass text-white"
                  }`}
                  aria-label={isSelected ? "Quitar" : "Seleccionar"}
                >
                  {isSelected ? "✓" : "+"}
                </button>
                {primary && (
                  <span className="photo-card-glass absolute left-2 top-2 z-10 rounded-full px-2.5 py-1 text-xs font-bold text-white">
                    #{primary}
                  </span>
                )}
                <div className="photo-card-overlay pointer-events-none absolute bottom-0 left-0 right-0 z-[1] p-3 opacity-0 transition group-hover:opacity-100">
                  <p className="text-xs text-white/90">Tocá para ampliar</p>
                </div>
              </div>
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
            <TurnstileWidget onToken={setTurnstileToken} className="mb-4 flex justify-center" />
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
        <div className="checkout-bar fixed bottom-0 left-0 right-0 z-50 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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
                className="btn-primary cta-pulse flex-1 sm:flex-none"
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
