"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { COLOR_FILTER_OPTIONS } from "@/lib/color-options";

type PhotoRow = {
  id: string;
  preview_url: string;
  ai_status: string;
  bike_color: string | null;
  rider_color: string | null;
  photo_numbers: { number: string }[];
};

const COLORS = COLOR_FILTER_OPTIONS.filter((c) => c !== "todos");

export function BulkTagger() {
  const [slug, setSlug] = useState("prueba2026-sanluis");
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [index, setIndex] = useState(0);
  const [dorsal, setDorsal] = useState("");
  const [bikeColor, setBikeColor] = useState("");
  const [riderColor, setRiderColor] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = photos[index];
  const tagged = photos.filter((p) => p.ai_status === "manual").length;

  const load = useCallback(async () => {
    setMsg(null);
    const res = await fetch(`/api/admin/photos?eventSlug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Error");
      return;
    }
    setPhotos(data.photos ?? []);
    setIndex(0);
    const first = (data.photos ?? [])[0] as PhotoRow | undefined;
    if (first) {
      setDorsal(first.photo_numbers?.[0]?.number ?? "");
      setBikeColor(first.bike_color ?? "");
      setRiderColor(first.rider_color ?? "");
    }
    setMsg(`${data.photos?.length ?? 0} fotos — etiquetá el dorsal que ves en la imagen`);
  }, [slug]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [index]);

  async function save(andNext: boolean) {
    if (!current) return;
    const num = dorsal.trim().replace(/\D/g, "");
    if (!num) {
      setMsg("Escribí el dorsal visible (ej. 27)");
      return;
    }

    const res = await fetch("/api/admin/tag-numbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photoId: current.id,
        dorsal: num,
        bike_color: bikeColor || null,
        rider_color: riderColor || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Error al guardar");
      return;
    }

    const updated = photos.map((p) =>
      p.id === current.id
        ? {
            ...p,
            ai_status: "manual",
            bike_color: bikeColor || null,
            rider_color: riderColor || null,
            photo_numbers: [{ number: num }],
          }
        : p
    );
    setPhotos(updated);
    const done = updated.filter((p) => p.ai_status === "manual").length;

    if (andNext && index < photos.length - 1) {
      const next = updated[index + 1];
      setIndex(index + 1);
      setDorsal(
        next.ai_status === "manual" ? (next.photo_numbers?.[0]?.number ?? "") : ""
      );
      setBikeColor(next.ai_status === "manual" ? (next.bike_color ?? "") : "");
      setRiderColor(next.ai_status === "manual" ? (next.rider_color ?? "") : "");
      setMsg(`Guardado #${num} — siguiente (${done}/${updated.length})`);
    } else {
      setMsg(`Guardado #${num} — ${done}/${updated.length} listas`);
    }
  }

  async function clearBadTags() {
    if (!confirm("¿Borrar todos los dorsales/colores automáticos de este evento?")) return;
    setMsg("Limpiando…");
    const res = await fetch("/api/admin/reset-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventSlug: slug }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Error");
      return;
    }
    await load();
    setMsg("Etiquetas incorrectas borradas — cargá cada dorsal a mano");
  }

  function go(delta: number) {
    const next = index + delta;
    if (next < 0 || next >= photos.length) return;
    const p = photos[next];
    setIndex(next);
    setDorsal(p.ai_status === "manual" ? (p.photo_numbers?.[0]?.number ?? "") : "");
    setBikeColor(p.ai_status === "manual" ? (p.bike_color ?? "") : "");
    setRiderColor(p.ai_status === "manual" ? (p.rider_color ?? "") : "");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      save(true);
    }
  }

  return (
    <section className="rounded-xl border-2 border-[var(--accent)] bg-[var(--surface)] p-6">
      <h2 className="mb-1 text-xl font-bold">Etiquetar dorsales (recomendado)</h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        El OCR automático falla en estas fotos. Acá ves cada foto grande, ponés el número
        real y <strong>Enter</strong> pasa a la siguiente. Es lo más rápido y 100% correcto.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
          placeholder="slug carrera"
        />
        <button
          type="button"
          onClick={load}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-black"
        >
          Cargar fotos
        </button>
        <button
          type="button"
          onClick={clearBadTags}
          className="rounded-lg border border-amber-500/60 px-4 py-2 text-sm text-amber-200"
        >
          Limpiar etiquetas incorrectas
        </button>
      </div>

      {photos.length > 0 && current && (
        <>
          <p className="mb-2 text-sm text-[var(--accent)]">
            Foto {index + 1} de {photos.length} · {tagged} etiquetadas
          </p>
          <div className="mb-4 overflow-hidden rounded-lg border border-[var(--border)]">
            <img
              src={current.preview_url}
              alt="Foto actual"
              className="max-h-[420px] w-full object-contain bg-black"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="mb-1 block text-sm font-medium">Dorsal visible</label>
              <input
                ref={inputRef}
                value={dorsal}
                onChange={(e) => setDorsal(e.target.value.replace(/\D/g, "").slice(0, 3))}
                onKeyDown={onKeyDown}
                placeholder="27"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-2xl font-bold outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Color moto</label>
              <select
                value={bikeColor}
                onChange={(e) => setBikeColor(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3"
              >
                <option value="">—</option>
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm">Color piloto</label>
              <select
                value={riderColor}
                onChange={(e) => setRiderColor(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3"
              >
                <option value="">—</option>
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              className="rounded-lg border border-[var(--border)] px-4 py-2 disabled:opacity-40"
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={() => save(true)}
              className="rounded-lg bg-[var(--accent)] px-6 py-2 font-bold text-black"
            >
              Guardar y siguiente (Enter)
            </button>
            <button
              type="button"
              onClick={() => save(false)}
              className="rounded-lg border border-[var(--border)] px-4 py-2"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index >= photos.length - 1}
              className="rounded-lg border border-[var(--border)] px-4 py-2 disabled:opacity-40"
            >
              Saltar →
            </button>
          </div>
        </>
      )}

      {msg && <p className="mt-4 text-sm text-[var(--muted)]">{msg}</p>}
    </section>
  );
}
