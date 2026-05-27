"use client";

import { useEffect, useState } from "react";
import { getDisplayPreviewUrl } from "@/lib/preview-url";

type PhotoRow = {
  id: string;
  preview_url: string;
  original_url: string;
  cloudinary_public_id: string;
  ai_status: string;
  photo_numbers: { number: string }[];
};

export function TagNumbersPanel({ defaultSlug = "" }: { defaultSlug?: string }) {
  const [slug, setSlug] = useState(defaultSlug);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (defaultSlug) setSlug(defaultSlug);
  }, [defaultSlug]);

  async function loadPhotos() {
    setLoading(true);
    setStatus(null);
    const res = await fetch(
      `/api/photographer/photos?eventSlug=${encodeURIComponent(slug)}`
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setStatus(data.error ?? "Error al cargar");
      return;
    }
    setPhotos(data.photos ?? []);
    const withNumbers = (data.photos ?? []).filter(
      (p: PhotoRow) => (p.photo_numbers?.length ?? 0) > 0
    ).length;
    setStatus(
      `${data.photos?.length ?? 0} fotos · ${withNumbers} ya tienen dorsal`
    );
  }

  async function saveNumber(photoId: string, raw: string) {
    const numbers = raw
      .split(/[,;\s]+/)
      .map((n) => n.replace(/\D/g, ""))
      .filter((n) => n.length > 0 && n.length <= 3);
    if (numbers.length === 0) {
      setStatus("Escribí al menos un número (ej. 9)");
      return;
    }
    const res = await fetch("/api/photographer/tag-numbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, numbers }),
    });
    const data = await res.json();
    if (res.ok) {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? {
                ...p,
                ai_status: "manual",
                photo_numbers: numbers.map((number) => ({ number })),
              }
            : p
        )
      );
      setStatus(`Guardado #${numbers.join(", ")}`);
    } else {
      setStatus(data.error ?? "Error al guardar");
    }
  }

  async function resetAndAnalyze() {
    setLoading(true);
    setStatus("Borrando dorsales viejos…");
    const reset = await fetch("/api/photographer/reset-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventSlug: slug }),
    });
    const rd = await reset.json();
    if (!reset.ok) {
      setStatus(rd.error ?? "Error al limpiar");
      setLoading(false);
      return;
    }
    setStatus(`Limpiados ${rd.cleared} fotos. Re-analizando…`);
    await analyzeAllWithAI();
  }

  async function analyzeAllWithAI() {
    setLoading(true);
    setProgress(0);
    setStatus("Iniciando análisis en lote…");
    let remaining = 1;
    let totalTagged = 0;
    let processed = 0;
    let rounds = 0;

    while (remaining > 0 && rounds < 500) {
      const res = await fetch("/api/photographer/analyze-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug: slug, onlyPending: true, limit: 25 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`${data.error}${data.hint ? ` — ${data.hint}` : ""}`);
        setLoading(false);
        return;
      }
      processed += data.processed ?? 0;
      totalTagged += data.tagged ?? 0;
      remaining = data.remaining ?? 0;
      setProgress(
        data.pendingTotal
          ? Math.round(((data.pendingTotal - remaining) / data.pendingTotal) * 100)
          : 100
      );
      setStatus(data.message ?? `Procesando… quedan ${remaining}`);
      rounds++;
    }

    setLoading(false);
    setProgress(100);
    setStatus(
      `Terminado: ~${totalTagged} fotos con dorsal (procesadas ${processed} en esta corrida). Recargá la lista.`
    );
    await loadPhotos();
  }

  const pending = photos.filter((p) => !(p.photo_numbers?.length ?? 0)).length;

  return (
    <section className="space-y-4 rounded-xl border border-[var(--border)] p-6">
      <h2 className="font-semibold text-[var(--muted)]">OCR automático (experimental)</h2>
      <p className="text-sm text-[var(--muted)]">
        Suele fallar en fotos de motocross. Usá <strong>Etiquetar dorsales</strong> arriba.
        Si probás OCR: <strong>Limpiar y re-analizar</strong> primero.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug de la carrera"
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
        />
        <button
          type="button"
          onClick={loadPhotos}
          disabled={loading}
          className="rounded-lg border border-[var(--border)] px-4 py-2 hover:border-[var(--accent)]"
        >
          Ver estado
        </button>
        <button
          type="button"
          onClick={resetAndAnalyze}
          disabled={loading}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Procesando…" : "Limpiar y re-analizar"}
        </button>
        <button
          type="button"
          onClick={analyzeAllWithAI}
          disabled={loading}
          className="rounded-lg border border-[var(--border)] px-4 py-2 hover:border-[var(--accent)]"
        >
          Solo analizar pendientes
        </button>
      </div>

      {loading && progress > 0 && (
        <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full bg-[var(--accent)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {pending > 0 && photos.length > 0 && (
        <p className="text-sm text-amber-400/90">
          {pending} fotos sin dorsal — usá &quot;Analizar todas con IA&quot; o corregí
          solo las que fallen abajo.
        </p>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer text-[var(--muted)] hover:text-[var(--text)]">
          Corrección manual (solo las que la IA no detecte)
        </summary>
        <div className="mt-4 space-y-4">
          {photos.length > 0 ? (
            <ul className="grid max-h-96 gap-3 overflow-y-auto sm:grid-cols-2">
              {photos
                .filter((p) => !(p.photo_numbers?.length ?? 0))
                .slice(0, 12)
                .map((photo) => (
                  <li
                    key={photo.id}
                    className="overflow-hidden rounded-lg border border-[var(--border)]"
                  >
                    <img
                      src={getDisplayPreviewUrl(photo)}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                    <div className="p-2">
                      <TagForm onSave={(v) => saveNumber(photo.id, v)} />
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-[var(--muted)]">Cargá fotos primero con &quot;Ver estado&quot;.</p>
          )}
        </div>
      </details>

      {status && <p className="text-sm text-[var(--muted)]">{status}</p>}
    </section>
  );
}

function TagForm({ onSave }: { onSave: (value: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ej. 98"
        className="flex-1 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-sm"
      />
      <button
        type="button"
        onClick={() => onSave(value)}
        className="rounded bg-[var(--accent)] px-2 py-1 text-xs font-bold text-black"
      >
        OK
      </button>
    </div>
  );
}
