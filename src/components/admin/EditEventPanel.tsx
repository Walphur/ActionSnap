"use client";

import { useState } from "react";

export function EditEventPanel({ defaultSlug = "" }: { defaultSlug?: string }) {
  const [slug, setSlug] = useState(defaultSlug);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("5");
  const [packDiscount, setPackDiscount] = useState("20");
  const [published, setPublished] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/photographer/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim(),
        title: title || undefined,
        price_per_photo_cents: price ? Math.round(Number(price) * 100) : undefined,
        pack_discount_percent: packDiscount ? Number(packDiscount) : undefined,
        is_published: published,
      }),
    });
    const data = await res.json();
    setMsg(res.ok ? "Carrera actualizada" : (data.error ?? "Error"));
  }

  return (
    <section className="card p-6">
      <h2 className="font-display mb-4 text-lg font-bold">Editar carrera</h2>
      <form onSubmit={save} className="space-y-3">
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Slug</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Título</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Precio ($)</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Descuento pack (%)</span>
          <input
            type="number"
            value={packDiscount}
            onChange={(e) => setPackDiscount(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Publicada
        </label>
        <button type="submit" className="btn-secondary w-full">
          Guardar cambios
        </button>
      </form>
      {msg && <p className="mt-3 text-sm text-[var(--muted)]">{msg}</p>}
    </section>
  );
}
