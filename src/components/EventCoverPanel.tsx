"use client";

import { useEffect, useState } from "react";

export function EventCoverPanel({ defaultSlug = "" }: { defaultSlug?: string }) {
  const [slug, setSlug] = useState(defaultSlug);

  useEffect(() => {
    if (defaultSlug) setSlug(defaultSlug);
  }, [defaultSlug]);
  const [coverUrl, setCoverUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function saveUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!slug.trim()) {
      setMsg("Escribí el slug de la carrera");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/photographer/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim(),
          cover_url: coverUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setMsg("Portada guardada");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function useFirstPhoto() {
    if (!slug.trim()) {
      setMsg("Escribí el slug de la carrera");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/photographer/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug.trim(), use_first_photo: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setCoverUrl(data.cover_url ?? "");
      setMsg("Portada = primera foto de la galería");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function uploadCover(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("coverFile") as File | null;
    if (!file?.size || !slug.trim()) {
      setMsg("Elegí slug y archivo (logo o foto)");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const body = new FormData();
      body.set("eventSlug", slug.trim());
      body.set("file", file);
      const res = await fetch("/api/photographer/event-cover", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setCoverUrl(data.cover_url ?? "");
      setMsg("Logo/portada subida");
      e.currentTarget.reset();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card space-y-4 p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-sm font-bold text-[var(--muted)]">
          4
        </span>
        <div>
          <h2 className="font-display text-lg font-bold">Portada de la carrera</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Logo del circuito o foto destacada en el inicio y la tarjeta del evento.
          </p>
        </div>
      </div>
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="slug (ej. prueba2026-sanluis)"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
      />

      <form onSubmit={saveUrl} className="space-y-2">
        <label className="block text-sm text-[var(--muted)]">URL de imagen (opcional)</label>
        <input
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
        >
          Guardar URL
        </button>
      </form>

      <button
        type="button"
        onClick={useFirstPhoto}
        disabled={loading}
        className="w-full rounded-lg border border-[var(--accent)]/50 py-2 text-sm text-[var(--accent)] disabled:opacity-50"
      >
        Usar primera foto subida como portada
      </button>

      <form onSubmit={uploadCover} className="space-y-2 border-t border-[var(--border)] pt-4">
        <label className="block text-sm text-[var(--muted)]">Subir logo o foto de portada</label>
        <input
          type="file"
          name="coverFile"
          accept="image/jpeg,image/png,image/webp"
          className="w-full text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--accent)] py-2 font-semibold text-black disabled:opacity-50"
        >
          Subir portada
        </button>
      </form>

      {coverUrl && (
        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
          <img src={coverUrl} alt="Vista previa portada" className="aspect-video w-full object-cover" />
        </div>
      )}
      {msg && <p className="text-sm text-[var(--muted)]">{msg}</p>}
    </section>
  );
}
