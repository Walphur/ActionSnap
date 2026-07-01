"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminCard, AdminField } from "@/components/admin/AdminCard";
import { AdminStats } from "@/components/admin/AdminStats";
import { BulkTagger } from "@/components/BulkTagger";
import { EditEventPanel } from "@/components/admin/EditEventPanel";
import { EventCoverPanel } from "@/components/EventCoverPanel";
import { TagNumbersPanel } from "@/components/TagNumbersPanel";
import { PhotographerShell } from "@/components/photographer/PhotographerShell";
import { WatermarkSettings } from "@/components/photographer/WatermarkSettings";
import { formatDate, formatPrice } from "@/lib/format";
import { formatSportLabel, PLATFORM } from "@/lib/platform";
import { uploadFilesParallel } from "@/lib/upload-batch";

const SPORT_OPTIONS = [
  { value: "motocross", label: "Motocross" },
  { value: "natacion", label: "Natación" },
  { value: "triatlon", label: "Triatlón" },
  { value: "ciclismo", label: "Ciclismo" },
  { value: "otros", label: "Otros" },
] as const;

type Tab = "overview" | "events" | "upload" | "settings";

type EventRow = {
  id: string;
  slug: string;
  title: string;
  sport: string;
  event_date: string;
  is_published: boolean;
  photoCount: number;
  price_per_photo_cents: number;
};

type Overview = {
  eventsCount: number;
  photoCount: number;
  salesCount: number;
  sellerTotalLabel: string;
  totalRevenueLabel: string;
  mpConnected: boolean;
  recentSales: { id: string; email: string; amountCents: number; createdAt: string }[];
};

export function PhotographerDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [status, setStatus] = useState<string | null>(null);
  const [statusOk, setStatusOk] = useState(true);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [activeSlug, setActiveSlug] = useState("");
  const [mpReceiverId, setMpReceiverId] = useState("");
  const [mpSaving, setMpSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  const notify = useCallback((msg: string, ok: boolean) => {
    setStatus(msg);
    setStatusOk(ok);
  }, []);

  const loadData = useCallback(async () => {
    const [evRes, ovRes, profRes] = await Promise.all([
      fetch("/api/photographer/events"),
      fetch("/api/photographer/overview"),
      fetch("/api/photographer/profile"),
    ]);
    const evData = await evRes.json();
    const ovData = await ovRes.json();
    const profData = await profRes.json();

    if (evRes.ok && evData.events) {
      setEvents(evData.events);
      setActiveSlug((prev) => prev || evData.events[0]?.slug || "");
    }
    if (ovRes.ok) setOverview(ovData);
    if (profRes.ok && !profData.error) {
      setMpReceiverId(profData.mp_receiver_id ?? "");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function createEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/photographer/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        slug: fd.get("slug"),
        sport: fd.get("sport"),
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
      setActiveSlug(data.slug);
      notify(`Evento creado → /eventos/${data.slug}`, true);
      loadData();
      setTab("upload");
    } else {
      notify(data.error ?? "Error", false);
    }
  }

  async function uploadPhotos(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const slug = activeSlug.trim();
    if (!slug) {
      notify("Elegí o creá un evento primero.", false);
      return;
    }

    const fd = new FormData(e.currentTarget);
    const files = fd.getAll("photos") as File[];
    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });

    const errors: string[] = [];
    let ok = 0;
    let done = 0;

    await uploadFilesParallel(files, 4, async (file) => {
      const body = new FormData();
      body.append("file", file);
      body.append("eventSlug", slug);
      const res = await fetch("/api/photographer/upload", { method: "POST", body });
      let errMsg = `Error ${res.status}`;
      try {
        const data = await res.json();
        if (data.error) errMsg = data.error;
      } catch {
        /* ignore */
      }
      if (res.ok) ok++;
      else errors.push(`${file.name}: ${errMsg}`);
      done++;
      setUploadProgress({ done, total: files.length });
    });

    setUploading(false);
    loadData();

    if (ok === files.length) {
      notify(`${ok} fotos subidas a Supabase Storage con marca de agua.`, true);
    } else if (ok > 0) {
      notify(`${ok}/${files.length} subidas. ${errors[0] ?? ""}`, false);
    } else {
      notify(errors.join("\n") || "Error al subir", false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Resumen" },
    { id: "events", label: "Eventos" },
    { id: "upload", label: "Subir" },
    { id: "settings", label: "Ajustes" },
  ];

  return (
    <PhotographerShell
      tabs={tabs}
      activeTab={tab}
      onTabChange={(id) => setTab(id as Tab)}
    >
      <div className="photographer-dashboard space-y-6">
        {status && (
          <div
            className={`dashboard-toast whitespace-pre-wrap ${
              statusOk ? "dashboard-toast--ok" : "dashboard-toast--err"
            }`}
          >
            {status}
            {statusOk && activeSlug && (
              <p className="mt-2">
                <Link href={`/eventos/${activeSlug}`} className="text-[var(--accent)] hover:underline">
                  Ver galería pública →
                </Link>
              </p>
            )}
          </div>
        )}

        {tab === "overview" && overview && (
          <div className="space-y-6">
            <div className="dashboard-stats">
              <div className="dashboard-stat glass-panel">
                <p className="dashboard-stat-label">Eventos</p>
                <p className="font-display dashboard-stat-value">{overview.eventsCount}</p>
              </div>
              <div className="dashboard-stat glass-panel">
                <p className="dashboard-stat-label">Fotos</p>
                <p className="font-display dashboard-stat-value">{overview.photoCount}</p>
              </div>
              <div className="dashboard-stat glass-panel">
                <p className="dashboard-stat-label">Ventas</p>
                <p className="font-display dashboard-stat-value">{overview.salesCount}</p>
              </div>
              <div className="dashboard-stat glass-panel">
                <p className="dashboard-stat-label">Tu ingreso</p>
                <p className="font-display dashboard-stat-value text-[var(--accent)]">
                  {overview.sellerTotalLabel}
                </p>
              </div>
            </div>

            {!overview.mpConnected && (
              <div className="glass-panel border-amber-500/30 p-4 text-sm text-amber-100">
                Conectá tu Mercado Pago en <button type="button" className="underline" onClick={() => setTab("settings")}>Ajustes</button> para cobrar el {PLATFORM.photographerSharePercent}% de cada venta.
              </div>
            )}

            <AdminCard title="Últimas ventas" description="Compras confirmadas en tus eventos.">
              {overview.recentSales.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">Todavía no hay ventas.</p>
              ) : (
                <ul className="space-y-2">
                  {overview.recentSales.map((s) => (
                    <li key={s.id} className="flex justify-between text-sm border-b border-white/5 py-2">
                      <span className="text-[var(--muted)]">{s.email}</span>
                      <span className="font-medium text-white">{formatPrice(s.amountCents)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCard>
          </div>
        )}

        {tab === "events" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <AdminCard title="Mis eventos" description="Tocá un evento para trabajar con él.">
              {events.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">Creá tu primer evento abajo.</p>
              ) : (
                <ul className="space-y-2">
                  {events.map((ev) => (
                    <li key={ev.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSlug(ev.slug);
                          notify(`Evento activo: ${ev.slug}`, true);
                        }}
                        className={`event-picker w-full text-left ${
                          activeSlug === ev.slug ? "event-picker--active" : ""
                        }`}
                      >
                        <span className="badge-sport">{formatSportLabel(ev.sport)}</span>
                        <p className="mt-1 font-semibold text-white">{ev.title}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {formatDate(ev.event_date)} · {ev.photoCount} fotos ·{" "}
                          {ev.is_published ? "Publicado" : "Borrador"}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCard>

            <AdminCard title="Nuevo evento" description="Aparece en Action Snap al publicar.">
              <form onSubmit={createEvent} className="space-y-3">
                <AdminField label="Título" name="title" required />
                <AdminField label="Slug URL" name="slug" placeholder="gp-sanluis-2026" required />
                <label className="block text-sm">
                  <span className="text-[var(--muted)]">Deporte</span>
                  <select name="sport" defaultValue="motocross" className="field-input mt-1 w-full">
                    {SPORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <AdminField label="Fecha" name="event_date" type="date" required />
                  <AdminField label="Precio $" name="price" type="number" defaultValue="5" required />
                </div>
                <AdminField label="Lugar" name="location" />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="publish" defaultChecked className="accent-[var(--accent)]" />
                  Publicar
                </label>
                <button type="submit" className="btn-primary w-full">
                  Crear evento
                </button>
              </form>
            </AdminCard>
          </div>
        )}

        {tab === "upload" && (
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-7 space-y-6">
              <AdminCard title="Etiquetar dorsales" description={`Evento: ${activeSlug || "—"}`}>
                <BulkTagger defaultSlug={activeSlug} />
              </AdminCard>
              <details className="glass-panel">
                <summary className="cursor-pointer p-4 font-semibold">OCR avanzado</summary>
                <div className="border-t border-white/10 p-4">
                  <TagNumbersPanel defaultSlug={activeSlug} />
                </div>
              </details>
            </div>
            <div className="xl:col-span-5 space-y-6">
              <AdminCard title="Subir fotos" description="4 archivos en paralelo · marca de agua automática">
                <form onSubmit={uploadPhotos} className="space-y-4">
                  <label className="block text-sm">
                    <span className="text-[var(--muted)]">Evento activo</span>
                    <select
                      value={activeSlug}
                      onChange={(e) => setActiveSlug(e.target.value)}
                      className="field-input mt-1 w-full"
                      required
                    >
                      <option value="">Seleccionar</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.slug}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    type="file"
                    name="photos"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    required
                    className="w-full rounded-xl border border-dashed border-white/15 bg-black/30 px-3 py-8 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:font-semibold file:text-white"
                  />
                  {uploading && (
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-[var(--accent)] transition-all"
                        style={{
                          width: `${uploadProgress.total ? (uploadProgress.done / uploadProgress.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  )}
                  <button type="submit" disabled={uploading} className="btn-hero btn-hero--primary w-full">
                    {uploading
                      ? `Subiendo ${uploadProgress.done}/${uploadProgress.total}…`
                      : "Subir lote"}
                  </button>
                </form>
              </AdminCard>
              <EventCoverPanel defaultSlug={activeSlug} />
              <EditEventPanel defaultSlug={activeSlug} />
              <AdminStats defaultSlug={activeSlug} />
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <AdminCard title="Mercado Pago" description={`Split ${PLATFORM.commissionPercent}% plataforma / ${PLATFORM.photographerSharePercent}% tuyo.`}>
              <AdminField
                label="Receiver ID"
                name="mp"
                value={mpReceiverId}
                onChange={(e) => setMpReceiverId(e.target.value)}
                placeholder="MP-MKT-…"
              />
              <button
                type="button"
                disabled={mpSaving}
                className="btn-primary mt-3 w-full"
                onClick={async () => {
                  setMpSaving(true);
                  const res = await fetch("/api/photographer/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mp_receiver_id: mpReceiverId.trim() || null }),
                  });
                  const data = await res.json();
                  setMpSaving(false);
                  notify(res.ok ? "Mercado Pago guardado." : data.error ?? "Error", res.ok);
                  loadData();
                }}
              >
                {mpSaving ? "Guardando…" : "Guardar Mercado Pago"}
              </button>
            </AdminCard>
            <AdminCard title="Marca de agua" description="Personalizá el texto en las previews.">
              <WatermarkSettings onStatus={notify} />
            </AdminCard>
          </div>
        )}
      </div>
    </PhotographerShell>
  );
}
