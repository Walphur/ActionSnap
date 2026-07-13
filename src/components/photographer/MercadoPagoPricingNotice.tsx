import { PLATFORM } from "@/lib/platform";

type Props = {
  priceCents?: number;
  className?: string;
};

/** Estimacion orientativa; MP cobra segun provincia y medio de pago. */
function estimateMpFeeCents(grossCents: number) {
  return Math.round(grossCents * 0.08);
}

export function MercadoPagoPricingNotice({ priceCents, className = "" }: Props) {
  const hasPrice = typeof priceCents === "number" && priceCents > 0;
  const platformFee = hasPrice
    ? Math.round(priceCents * (PLATFORM.commissionPercent / 100))
    : 0;
  const afterPlatform = hasPrice ? Math.max(0, priceCents - platformFee) : 0;
  const mpEstimate = hasPrice ? estimateMpFeeCents(afterPlatform) : 0;
  const netEstimate = hasPrice ? Math.max(0, afterPlatform - mpEstimate) : 0;

  return (
    <div
      className={`rounded-[var(--ds-radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm leading-relaxed text-[var(--color-text-secondary)] ${className}`}
    >
      <p>
        El comprador paga el precio que cargues. Action Snap descuenta{" "}
        <strong className="text-[var(--color-text-primary)]">{PLATFORM.commissionPercent}%</strong>{" "}
        por venta. Mercado Pago ademas cobra su comision e impuestos (varian segun provincia y
        medio de pago).
      </p>
      {hasPrice && (
        <p className="mt-2 text-[var(--color-text-primary)]">
          Ejemplo con ${(priceCents / 100).toFixed(0)} por foto: recibis aprox. $
          {(netEstimate / 100).toFixed(0)} neto en MP (estimado).
        </p>
      )}
    </div>
  );
}
