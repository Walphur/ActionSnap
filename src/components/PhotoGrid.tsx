"use client";

import { useMemo, useState } from "react";
import { CheckoutDrawer } from "@/components/checkout/CheckoutDrawer";
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
  paymentLabel = null,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [packMode, setPackMode] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const paymentAvailable = paymentLabel != null && paymentLabel.length > 0;
  const checkoutLabel = paymentLabel ?? "Mercado Pago";

  const lightboxPhoto = photos.find((p) => p.id === lightboxId);

  const packPhotos = useMemo(() => {
    if (!filterDorsal) return [];
    return photos.filter((p) =>
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

  function openCheckout() {
    setCheckoutError(null);
    setDrawerOpen(true);
  }

  async function pay() {
    if (count === 0) return;
    if (!email.trim() || !email.includes("@")) {
      setCheckoutError("Ingresá un email válido.");
      return;
    }
    if (!paymentAvailable) {
      setCheckoutError("Los pagos no están disponibles en este momento.");
      return;
    }

    setLoading(true);
    setCheckoutError(null);
    try {
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
        window.location.href = data.url;
        return;
      }
      setCheckoutError(data.error ?? "No se pudo iniciar el pago.");
    } catch {
      setCheckoutError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Tocá una foto para ampliar. Seleccioná las que quieras comprar. Vista previa con marca de
        agua; la descarga en HD es sin marca.
      </p>

      {filterDorsal && packPhotos.length > 1 && (
        <div className="glass-panel mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm">
            <strong className="text-[var(--accent)]">Pack dorsal #{filterDorsal}</strong> —{" "}
            {packPhotos.length} fotos con {packDiscountPercent}% off
          </p>
          <button type="button" onClick={selectPack} className="btn-primary !py-2 !text-sm">
            Seleccionar todas (
            {formatPrice(
              Math.round(packPhotos.length * priceCents * (1 - packDiscountPercent / 100))
            )}
            )
          </button>
        </div>
      )}

      <div className="photo-masonry">
        {photos.map((photo) => {
          const primary = photo.photo_numbers?.[0]?.number;
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
                  className={`absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
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
          onToggleSelect={() => toggle(lightboxPhoto.id)}
          isSelected={selected.has(lightboxPhoto.id)}
        />
      )}

      <CheckoutDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        photos={photos}
        selectedIds={selected}
        email={email}
        onEmailChange={setEmail}
        subtotal={subtotal}
        discount={discount}
        total={total}
        count={count}
        eventTitle={eventTitle}
        checkoutLabel={checkoutLabel}
        loading={loading}
        error={checkoutError}
        paymentAvailable={paymentAvailable}
        onPay={pay}
        turnstileToken={turnstileToken}
        onTurnstileToken={setTurnstileToken}
      />

      {count > 0 && (
        <div className="checkout-bar fixed bottom-0 left-0 right-0 z-50 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={openCheckout}
            className="checkout-bar-btn mx-auto flex w-full max-w-lg items-center justify-between gap-4 rounded-2xl border border-white/15 bg-black/90 px-5 py-4 backdrop-blur-xl"
          >
            <div className="text-left">
              <p className="text-xs text-[var(--muted)]">
                {count} foto{count > 1 ? "s" : ""} seleccionada{count > 1 ? "s" : ""}
              </p>
              <p className="font-display text-xl text-[var(--accent)]">{formatPrice(total)}</p>
            </div>
            <span className="btn-hero btn-hero--primary !py-2.5 !text-sm">Ir a pagar →</span>
          </button>
        </div>
      )}

      {count > 0 && <div className="h-28" aria-hidden />}
    </>
  );
}
