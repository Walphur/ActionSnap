"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";

export function AdminStats({ defaultSlug = "" }: { defaultSlug?: string }) {
  const [slug, setSlug] = useState(defaultSlug);
  const [stats, setStats] = useState<{
    photos: number;
    tagged: number;
    soldPhotos: number;
    revenueCents: number;
  } | null>(null);

  async function load() {
    if (!slug.trim()) return;
    const res = await fetch(`/api/photographer/stats?eventSlug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (res.ok) setStats(data);
  }

  return (
    <section className="card p-6">
      <h2 className="font-display mb-4 text-lg font-bold">Estadísticas</h2>
      <div className="mb-4 flex gap-2">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug carrera"
          className="flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
        />
        <button type="button" onClick={load} className="btn-secondary">
          Ver
        </button>
      </div>
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Fotos" value={String(stats.photos)} />
          <Stat label="Etiquetadas" value={String(stats.tagged)} />
          <Stat label="Vendidas" value={String(stats.soldPhotos)} />
          <Stat label="Ingresos" value={formatPrice(stats.revenueCents)} />
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--bg)] p-3 text-center">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="font-display text-lg font-bold">{value}</p>
    </div>
  );
}
