"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/format";

export function AdminStats({ defaultSlug = "" }: { defaultSlug?: string }) {
  const [slug, setSlug] = useState(defaultSlug);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    photos: number;
    tagged: number;
    soldPhotos: number;
    revenueCents: number;
  } | null>(null);

  useEffect(() => {
    if (defaultSlug) setSlug(defaultSlug);
  }, [defaultSlug]);

  async function load() {
    if (!slug.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/photographer/stats?eventSlug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    setLoading(false);
    if (res.ok) setStats(data);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" aria-hidden />
        <div>
          <h3 className="ds-h4">Estadísticas del evento</h3>
          <p className="ds-caption mt-1">Fotos, etiquetado y ventas de la cobertura activa.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Input
          label="Slug del evento"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug del evento"
          className="flex-1"
        />
        <Button type="button" variant="secondary" loading={loading} onClick={() => void load()}>
          Ver estadísticas
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Fotos" value={String(stats.photos)} />
          <Stat label="Etiquetadas" value={String(stats.tagged)} />
          <Stat label="Vendidas" value={String(stats.soldPhotos)} />
          <Stat label="Ingresos" value={formatPrice(stats.revenueCents)} />
        </div>
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
