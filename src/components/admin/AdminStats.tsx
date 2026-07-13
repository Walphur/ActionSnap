"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/format";

export function AdminStats({
  defaultSlug = "",
  hideSlugInput = false,
}: {
  defaultSlug?: string;
  /** Oculta el editor de slug manual (útil cuando ya sigue al evento activo). */
  hideSlugInput?: boolean;
}) {
  const [slug, setSlug] = useState(defaultSlug);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    photos: number;
    tagged: number;
    soldPhotos: number;
    salesCount: number;
    revenueCents: number;
    grossRevenueCents: number;
    sellerRevenueCents: number;
  } | null>(null);

  const loadForSlug = useCallback(async (targetSlug: string) => {
    if (!targetSlug.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/photographer/stats?eventSlug=${encodeURIComponent(targetSlug)}`);
    const data = await res.json();
    setLoading(false);
    if (res.ok) setStats(data);
  }, []);

  useEffect(() => {
    if (defaultSlug) setSlug(defaultSlug);
  }, [defaultSlug]);

  useEffect(() => {
    if (!defaultSlug.trim()) return;
    void loadForSlug(defaultSlug);
  }, [defaultSlug, loadForSlug]);

  async function load() {
    await loadForSlug(slug);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" aria-hidden />
        <div>
          <h3 className="ds-h4">Estadisticas del evento</h3>
          <p className="ds-caption mt-1">
            Fotos, etiquetado y lo que te corresponde despues de la comision de Action Snap.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        {!hideSlugInput && (
          <Input
            label="Slug del evento"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug del evento"
            className="min-w-0 flex-1"
          />
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={loading}
          onClick={() => void load()}
          className={hideSlugInput ? "sm:ml-auto" : undefined}
        >
          Actualizar
        </Button>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Fotos" value={String(stats.photos)} />
            <Stat label="Etiquetadas" value={String(stats.tagged)} />
            <Stat label="Ventas" value={String(stats.salesCount ?? stats.soldPhotos)} />
            <Stat
              label="Tu ingreso"
              value={formatPrice(stats.sellerRevenueCents ?? stats.revenueCents)}
            />
          </div>
          <p className="ds-caption text-[var(--color-text-secondary)]">
            Mercado Pago descuenta ademas su comision e impuestos al acreditar en tu cuenta.
          </p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--ds-radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
      <p className="ds-caption">{label}</p>
      <p className="ds-h4 mt-1">{value}</p>
    </div>
  );
}
