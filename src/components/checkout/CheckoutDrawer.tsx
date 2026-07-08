"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck, X } from "lucide-react";
import { TurnstileWidget, turnstileEnabled } from "@/components/TurnstileWidget";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
  unitPriceCents: number;
  eventTitle: string;
  checkoutLabel: string;
  loading: boolean;
  error: string | null;
  paymentAvailable: boolean;
  onPay: () => void;
  turnstileToken: string | null;
  onTurnstileToken: (t: string | null) => void;
  turnstileResetSignal?: number;
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
  unitPriceCents,
  eventTitle,
  checkoutLabel,
  loading,
  error,
  paymentAvailable,
  onPay,
  turnstileToken,
  onTurnstileToken,
  turnstileResetSignal = 0,
}: Props) {
  const selectedPhotos = photos.filter((p) => selectedIds.has(p.id));
  const needsCaptcha = turnstileEnabled();
  const canPay =
    paymentAvailable &&
    email.includes("@") &&
    count > 0 &&
    (!needsCaptcha || Boolean(turnstileToken));

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="buyer-checkout-backdrop"
            onClick={onClose}
          />
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="buyer-checkout-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            <div className="buyer-checkout-drawer__handle" aria-hidden />

            <header className="buyer-checkout-drawer__header">
              <div>
                <p className="ds-overline">Checkout seguro</p>
                <h2 id="checkout-title" className="ds-h3 mt-1">
                  Tu selección
                </h2>
                <p className="ds-caption mt-1">{eventTitle}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar">
                <X className="h-5 w-5" />
              </Button>
            </header>

            {count === 0 ? (
              <Alert tone="info" title="Carrito vacío">
                Seleccioná al menos una foto para continuar.
              </Alert>
            ) : (
              <>
                <ul className="buyer-checkout-items">
                  {selectedPhotos.map((photo) => {
                    const dorsal = photo.photo_numbers?.[0]?.number;
                    return (
                      <li key={photo.id} className="buyer-checkout-item">
                        <img
                          src={getDisplayPreviewUrl(photo)}
                          alt=""
                          className="buyer-checkout-item__thumb"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="ds-body truncate font-medium">
                            {dorsal ? `#${dorsal}` : "Foto"}
                          </p>
                          <p className="ds-caption">Preview con marca de agua</p>
                        </div>
                        <span className="ds-body shrink-0 font-medium tabular-nums">
                          {formatPrice(unitPriceCents)}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="buyer-checkout-summary">
                  <div className="flex justify-between ds-caption">
                    <span>{count} foto{count !== 1 ? "s" : ""}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between ds-caption text-[var(--color-success)]">
                      <span>Descuento pack</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="buyer-checkout-summary__total">
                    <span className="ds-body font-semibold">Total</span>
                    <span className="ds-display text-2xl text-[var(--color-primary)]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <Input
                  label="Email para la descarga HD"
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  hint="Te enviamos el link de descarga al confirmar el pago."
                />

                {needsCaptcha && (
                  <TurnstileWidget
                    onToken={onTurnstileToken}
                    resetSignal={turnstileResetSignal}
                    className="my-4 flex justify-center"
                  />
                )}

                {!paymentAvailable && (
                  <Alert tone="warning" title="Pagos no disponibles" className="my-4">
                    Contactá al organizador del evento.
                  </Alert>
                )}

                {error && (
                  <Alert tone="danger" title="No se pudo iniciar el pago" className="my-4">
                    {error}
                  </Alert>
                )}

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  disabled={!canPay}
                  onClick={onPay}
                >
                  Pagar con {checkoutLabel} — {formatPrice(total)}
                </Button>

                <div className="buyer-checkout-trust">
                  <span className="inline-flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5" aria-hidden />
                    Pago seguro
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                    Descarga HD instantánea
                  </span>
                  <Badge tone="info">{checkoutLabel}</Badge>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
