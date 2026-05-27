"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TurnstileWidget, turnstileEnabled } from "@/components/TurnstileWidget";
import { formatPrice } from "@/lib/format";
import { getDisplayPreviewUrl } from "@/lib/preview-url";
import type { PhotoWithNumbers } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  photos: PhotoWithNumbers[];
  selectedIds: Set<string>;
  email: string;
  onEmailChange: (v: string) => void;
  subtotal: number;
  discount: number;
  total: number;
  count: number;
  eventTitle: string;
  checkoutLabel: string;
  loading: boolean;
  error: string | null;
  paymentAvailable: boolean;
  onPay: () => void;
  turnstileToken: string | null;
  onTurnstileToken: (t: string | null) => void;
};

export function CheckoutDrawer({
  open,
  onClose,
  photos,
  selectedIds,
  email,
  onEmailChange,
  subtotal,
  discount,
  total,
  count,
  eventTitle,
  checkoutLabel,
  loading,
  error,
  paymentAvailable,
  onPay,
  turnstileToken,
  onTurnstileToken,
}: Props) {
  const selectedPhotos = photos.filter((p) => selectedIds.has(p.id));
  const needsCaptcha = turnstileEnabled();
  const canPay =
    paymentAvailable &&
    email.includes("@") &&
    count > 0 &&
    (!needsCaptcha || Boolean(turnstileToken));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="checkout-backdrop"
            onClick={onClose}
          />
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="checkout-drawer"
            role="dialog"
            aria-labelledby="checkout-title"
          >
            <div className="checkout-drawer-handle" aria-hidden />
            <header className="checkout-drawer-header">
              <div>
                <p className="trust-kicker">Pago</p>
                <h2 id="checkout-title" className="font-display text-2xl uppercase text-white">
                  Tu selección
                </h2>
                <p className="text-sm text-[var(--muted)]">{eventTitle}</p>
              </div>
              <button type="button" onClick={onClose} className="checkout-close" aria-label="Cerrar">
                ×
              </button>
            </header>

            <ul className="checkout-items">
              {selectedPhotos.map((photo) => {
                const dorsal = photo.photo_numbers?.[0]?.number;
                return (
                  <li key={photo.id} className="checkout-item">
                    <img
                      src={getDisplayPreviewUrl(photo)}
                      alt=""
                      className="checkout-item-thumb"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {dorsal ? `Dorsal #${dorsal}` : "Foto deportiva"}
                      </p>
                      <p className="text-xs text-[var(--muted)]">Preview con marca de agua</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="checkout-summary">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">{count} foto{count !== 1 ? "s" : ""}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Descuento pack</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-3">
                <span className="font-semibold text-white">Total</span>
                <span className="font-display text-2xl text-[var(--accent)]">{formatPrice(total)}</span>
              </div>
            </div>

            <label className="checkout-email-label">
              Email para la descarga HD
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                className="field-input field-input--search mt-1.5 w-full"
              />
            </label>

            {needsCaptcha && (
              <TurnstileWidget onToken={onTurnstileToken} className="my-4 flex justify-center" />
            )}

            {!paymentAvailable && (
              <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                Pagos no configurados en el servidor. Contactá al organizador.
              </p>
            )}

            {error && (
              <p className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={onPay}
              disabled={loading || !canPay}
              className="btn-hero btn-hero--primary w-full"
            >
              {loading ? "Procesando…" : `Pagar con ${checkoutLabel} — ${formatPrice(total)}`}
            </button>

            <p className="mt-3 text-center text-xs text-[var(--muted)]">
              Pago seguro · Descarga instantánea en HD sin marca de agua
            </p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
