"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminCard, AdminField } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStats } from "@/components/admin/AdminStats";
import { EditEventPanel } from "@/components/admin/EditEventPanel";
import { BulkTagger } from "@/components/BulkTagger";
import { EventCoverPanel } from "@/components/EventCoverPanel";
import { TagNumbersPanel } from "@/components/TagNumbersPanel";

type SetupStatus = {
  ready: boolean;
  missing: string[];
};

export default function AdminPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [statusOk, setStatusOk] = useState(true);
  const [setup, setSetup] = useState<SetupStatus | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lastSlug, setLastSlug] = useState("");
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    fetch("/api/setup/status")
      .then((r) => r.json())
      .then(setSetup)
      .catch(() => null);
  }, []);

  async function createEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        slug: fd.get("slug"),
        event_date: fd.get("event_date"),
        location: fd.get("location"),
        description: fd.get("description"),
        price_per_photo_cents: Number(fd.get("price")) * 100,
        publish: fd.get("publish") === "on",
        cover_url: (fd.get("cover_url") as string) || "",
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setLastSlug(data.slug);
      setStatusOk(true);
      setStatus(`Carrera creada → /eventos/${data.slug}`);
    } else {
      setStatusOk(false);
      const hint = data.hint ? ` ${data.hint}` : "";
      setStatus(`${data.error ?? "Error"}${hint}`);
    }
  }

  async function uploadPhotos(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    const files = fd.getAll("photos") as File[];
    const eventSlug = fd.get("eventSlug") as string;

    const errors: string[] = [];
    let ok = 0;
    setUploadProgress({ done: 0, total: files.length });
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const body = new FormData();
      body.append("file", file);
      body.append("eventSlug", eventSlug);
      const res = await fetch("/api/upload", { method: "POST", body });
      let errMsg = `Error ${res.status}`;
      try {
        const data = await res.json();
        if (data.error) errMsg = data.error;
        if (data.hint) errMsg += ` — ${data.hint}`;
      } catch {
        const text = await res.text();
        if (text) errMsg = text.slice(0, 120);
      }
      if (res.ok) ok++;
      else errors.push(`${file.name}: ${errMsg}`);
      setUploadProgress({ done: i + 1, total: files.length });
    }
    setUploading(false);
    setUploadProgress({ done: 0, total: 0 });

    if (ok > 0 && autoAnalyze) {
      setAnalyzing(true);
      setStatus("Subiendo OK. Analizando dorsales…");
      let remaining = 1;
      let totalTagged = 0;
      let rounds = 0;
      while (remaining > 0 && rounds < 200) {
        const ar = await fetch("/api/admin/analyze-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventSlug, onlyPending: true, limit: 25 }),
        });
        const ad = await ar.json();
        if (!ar.ok) {
          setStatusOk(false);
          setStatus(`${ok} subidas, IA falló: ${ad.error}`);
          setAnalyzing(false);
          return;
        }
        totalTagged += ad.tagged ?? 0;
        remaining = ad.remaining ?? 0;
        rounds++;
      }
      setAnalyzing(false);
      setStatusOk(true);
      setStatus(`${ok} fotos subidas · ${totalTagged} con dorsal (IA)`);
      return;
    }

    setStatusOk(ok === files.length);
    if (ok === files.length) {
      setStatus(`${ok} fotos subidas con marca de agua. Etiquetá dorsales en el paso 1.`);
    } else if (ok > 0) {
      setStatus(`${ok}/${files.length} subidas.\n${errors.slice(0, 3).join("\n")}`);
    } else {
      setStatus(`Error:\n${errors.slice(0, 5).join("\n")}`);
    }
  }

  const galleryLink = lastSlug ? `/eventos/${lastSlug}` : null;

  return (
    <AdminShell>
    <div className="space-y-6">
      {status && (
        <div
          className={`card whitespace-pre-wrap p-4 text-sm ${
            statusOk
              ? "border-green-500/40 bg-green-500/10 text-green-100"
              : "border-red-500/40 bg-red-500/10 text-red-100"
          }`}
        >
          {status}
          {galleryLink && statusOk && (
            <p className="mt-2">
              <Link href={galleryLink} className="font-semibold text-[var(--accent)] hover:underline">
                Abrir galería pública →
              </Link>
            </p>
          )}
        </div>
      )}

      {setup && !setup.ready && (
        <div className="card border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-semibold">Falta configurar Supabase</p>
          <p className="mt-1">En .env.local: {setup.missing.join(", ")}</p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <BulkTagger />
        </div>

        <div className="space-y-6 xl:col-span-5">
          <AdminCard
            step="2"
            title="Nueva carrera"
            description="Creá el evento y publicalo para que aparezca en el inicio."
          >
            <form onSubmit={createEvent} className="space-y-4">
              <AdminField label="Título" name="title" required />
              <AdminField
                label="URL (slug)"
                name="slug"
                placeholder="gp-sanluis-2026"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Fecha" name="event_date" type="date" required />
                <AdminField label="Precio ($)" name="price" type="number" defaultValue="5" required />
              </div>
              <AdminField label="Lugar" name="location" placeholder="San Luis" />
              <AdminField label="Descripción" name="description" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="publish" defaultChecked className="accent-[var(--accent)]" />
                Publicar en el sitio
              </label>
              <button type="submit" className="btn-primary w-full">
                Crear carrera
              </button>
            </form>
          </AdminCard>

          <AdminCard
            step="3"
            title="Subir fotos"
            description="Lote JPG/PNG. Se aplica marca de agua automática."
          >
            <form onSubmit={uploadPhotos} className="space-y-4">
              <AdminField
                label="Slug de la carrera"
                name="eventSlug"
                defaultValue={lastSlug}
                placeholder={lastSlug || "prueba2026-sanluis"}
                required
              />
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Archivos
                </label>
                <input
                  type="file"
                  name="photos"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  required
                  className="w-full rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--bg)] px-3 py-6 text-sm file:mr-3 file:rounded file:border-0 file:bg-[var(--accent)] file:px-3 file:py-1 file:font-semibold file:text-black"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={autoAnalyze}
                  onChange={(e) => setAutoAnalyze(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
                Probar OCR al subir (experimental)
              </label>
              {uploading && uploadProgress.total > 0 && (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                    <span>Subiendo…</span>
                    <span>
                      {uploadProgress.done}/{uploadProgress.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full bg-[var(--accent)] transition-all"
                      style={{
                        width: `${(uploadProgress.done / uploadProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={uploading || analyzing}
                className="btn-primary w-full disabled:opacity-50"
              >
                {uploading ? "Subiendo…" : analyzing ? "Analizando…" : "Subir fotos"}
              </button>
            </form>
          </AdminCard>

          <EventCoverPanel defaultSlug={lastSlug} />
          <EditEventPanel defaultSlug={lastSlug} />
          <AdminStats defaultSlug={lastSlug} />
        </div>
      </div>

      <details className="card group">
        <summary className="cursor-pointer list-none p-6 font-display font-bold marker:content-none">
          <span className="text-[var(--muted)]">Opcional · </span>
          OCR automático y corrección manual
        </summary>
        <div className="border-t border-[var(--border)] px-6 pb-6 pt-4">
          <TagNumbersPanel />
        </div>
      </details>
    </div>
    </AdminShell>
  );
}
