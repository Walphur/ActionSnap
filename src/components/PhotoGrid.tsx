"use client";

import { useMemo, useState } from "react";
import { CheckSquare2, ShoppingCart } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { CheckoutDrawer } from "@/components/checkout/CheckoutDrawer";
import { ContactHelp } from "@/components/ContactHelp";
import { PhotoCard } from "@/components/PhotoCard";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { Button } from "@/components/ui/Button";
import { formatCheckoutError } from "@/lib/checkout-errors";
import { formatPrice } from "@/lib/format";
import { sortPhotos, type PhotoSortOrder } from "@/lib/sort-photos";
import type { PhotoWithNumbers } from "@/lib/types";

type Props = {
  photos: PhotoWithNumbers[];
  priceCents: number;
  eventSlug: string;
  eventTitle: string;
  packDiscountPercent?: number;
  filterDorsal?: string;
  paymentLabel?: string | null;
  sortOrder?: PhotoSortOrder;
};

export function PhotoGrid({
  photos,
  priceCents,
  eventSlug,
  eventTitle,
  packDiscountPercent = 20,
  filterDorsal,
  paymentLabel = null,
  sortOrder = "default",
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [packMode, setPackMode] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const sortedPhotos = useMemo(() => sortPhotos(photos, sortOrder), [photos, sortOrder]);

  const paymentAvailable = paymentLabel != null && paymentLabel.length > 0;
  const checkoutLabel = paymentLabel ?? "Mercado Pago";

  const packPhotos = useMemo(() => {
    if (!filterDorsal) return [];
    return sortedPhotos.filter((p) =>
      p.photo_numbers?.some((n) => n.number === filterDorsal)
    );
  }, [sortedPhotos, filterDorsal]);

  function openCheckout() {
    setCheckoutError(null);
    setDrawerOpen(true);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        toast.success("Foto agregada al carrito");
      }
      return next;
    });
  }

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(sortedPhotos.map((p) => p.id)));
  }

  function clearSelection() {
    setSelected(new Set());
    setPackMode(false);
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
      setCheckoutError(formatCheckoutError(data, res.status));
    } catch {
      setCheckoutError("No pudimos conectar con el servidor. Revisá tu internet e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const lightboxPhoto = lightboxIndex != null ? sortedPhotos[lightboxIndex] : null;

  return (
    <>
      <div className="buyer-toolbar">
        <div className="buyer-toolbar__group">
          <span className="ds-caption">
            {sortedPhotos.length} foto{sortedPhotos.length !== 1 ? "s" : ""}
            {count > 0 && ` · ${count} seleccionada${count > 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="buyer-toolbar__group">
          {count > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
              Limpiar
            </Button>
          ) : (
            <button
              type="button"
              className="buyer-toolbar__select-btn"
              onClick={selectAllVisible}
            >
              <CheckSquare2 className="h-3.5 w-3.5" aria-hidden />
              Seleccionar visibles
            </button>
          )}
          {count > 0 && (
            <Button type="button" variant="primary" size="sm" onClick={openCheckout}>
              <ShoppingCart className="h-4 w-4" aria-hidden />
              Checkout
            </Button>
          )}
        </div>
      </div>

      {filterDorsal && packPhotos.length > 1 && (
        <div className="buyer-pack-banner ds-animate-fade-in">
          <p className="ds-body">
            <strong className="text-[var(--color-primary)]">Pack #{filterDorsal}</strong>
            {" "}— {packPhotos.length} fotos con {packDiscountPercent}% off
          </p>
          <Button type="button" variant="primary" size="sm" onClick={selectPack}>
            Seleccionar pack (
            {formatPrice(
              Math.round(packPhotos.length * priceCents * (1 - packDiscountPercent / 100))
            )}
            )
          </Button>
        </div>
      )}

      <div className="buyer-gallery">
        {sortedPhotos.map((photo, i) => (
          <div key={photo.id} className="buyer-gallery__item">
            <PhotoCard
              photo={photo}
              isSelected={selected.has(photo.id)}
              isFavorite={favorites.has(photo.id)}
              onOpen={() => setLightboxIndex(i)}
              onToggleSelect={() => toggle(photo.id)}
              onToggleFavorite={() => toggleFavorite(photo.id)}
            />
          </div>
        ))}
      </div>

      <ContactHelp eventTitle={eventTitle} />

      {lightboxPhoto && lightboxIndex != null && (
        <PhotoLightbox
          photos={sortedPhotos}
          index={lightboxIndex}
          isSelected={selected.has(lightboxPhoto.id)}
          isFavorite={favorites.has(lightboxPhoto.id)}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onToggleSelect={() => toggle(lightboxPhoto.id)}
          onToggleFavorite={() => toggleFavorite(lightboxPhoto.id)}
        />
      )}

      <CheckoutDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        photos={sortedPhotos}
        selectedIds={selected}
        email={email}
        onEmailChange={setEmail}
        subtotal={subtotal}
        discount={discount}
        total={total}
        count={count}
        unitPriceCents={count > 0 ? Math.round(total / count) : priceCents}
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
        <div className="buyer-cart-bar">
          <div className="buyer-cart-bar__inner">
            <div className="buyer-cart-bar__badge" aria-hidden>
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div className="buyer-cart-bar__summary">
              <p className="buyer-cart-bar__count">
                {count} foto{count > 1 ? "s" : ""} · {eventTitle}
              </p>
              <p className="buyer-cart-bar__total">
                Total <strong>{formatPrice(total)}</strong>
              </p>
            </div>
            <Button type="button" variant="primary" size="sm" className="buyer-cart-bar__cta" onClick={openCheckout}>
              Ir a pagar
            </Button>
          </div>
        </div>
      )}

      {count > 0 && <div className="buyer-cart-bar__spacer" aria-hidden />}
    </>
  );
}
