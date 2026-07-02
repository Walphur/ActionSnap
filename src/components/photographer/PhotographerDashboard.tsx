"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminCard, AdminField } from "@/components/admin/AdminCard";
import { AdminStats } from "@/components/admin/AdminStats";
import { BulkTagger } from "@/components/BulkTagger";
import { EditEventPanel } from "@/components/admin/EditEventPanel";
import { EventCoverPanel } from "@/components/EventCoverPanel";
import { PhotographerShell } from "@/components/photographer/PhotographerShell";
import { WatermarkSettings } from "@/components/photographer/WatermarkSettings";
import { usePhotographerDashboard } from "@/hooks/usePhotographerDashboard";
import { formatDate, formatPrice } from "@/lib/format";
import { formatSportLabel, PLATFORM } from "@/lib/platform";
import type { DashboardOverview, EventRow } from "@/types/event";

const SPORT_OPTIONS = [
  { value: "motocross", label: "Motocross" },
  { value: "natacion", label: "Natación" },
  { value: "triatlon", label: "Triatlón" },
  { value: "ciclismo", label: "Ciclismo" },
  { value: "otros", label: "Otros" },
] as const;

type Tab = "overview" | "events" | "upload" | "settings";

export function PhotographerDashboard() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("overview");
  const [status, setStatus] = useState<string | null>(null);
  const [statusOk, setStatusOk] = useState(true);

  const notify = useCallback((msg: string, ok: boolean) => {
    setStatus(msg);
    setStatusOk(ok);
  }, []);

  const {
    events,
    overview,
    activeSlug,
    mpReceiverId,
    mpSaving,
    uploading,
    uploadProgress,
    setActiveSlug,
    setMpReceiverId,
    loadData,
    createEvent,
    uploadPhotos,
    saveMpReceiverId,
  } = usePhotographerDashboard(notify);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab === "settings" || requestedTab === "overview" || requestedTab === "events" || requestedTab === "upload") {
      setTab(requestedTab);
    }

    const mpStatus = searchParams.get("mp");
    if (mpStatus === "connected") {
      notify("Mercado Pago vinculado correctamente.", true);
      loadData();
    } else if (mpStatus === "error") {
      const reason = searchParams.get("reason") ?? "desconocido";
      notify(`No se pudo vincular Mercado Pago (${reason}).`, false);
    }
  }, [searchParams, loadData, notify]);

  async function onCreateEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await createEvent(new FormData(e.currentTarget));
    if (result.ok) {
      setTab("upload");
    }
  }

  async function onUploadPhotos(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const files = fd.getAll("photos") as File[];
    await uploadPhotos(files);
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
              <form onSubmit={onCreateEvent} className="space-y-3">
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
              <AdminCard title="Etiquetar dorsales" description={`Evento: ${activeSlug || "—"} · dorsal y color a mano`}>
                <BulkTagger defaultSlug={activeSlug} />
              </AdminCard>
            </div>
            <div className="xl:col-span-5 space-y-6">
              <AdminCard title="Subir fotos" description="4 archivos en paralelo · marca de agua automática">
                <form onSubmit={onUploadPhotos} className="space-y-4">
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
            <AdminCard title="Mercado Pago Connect" description={`Split ${PLATFORM.commissionPercent}% plataforma / ${PLATFORM.photographerSharePercent}% tuyo.`}>
              <p className="text-sm text-white/70">
                {mpReceiverId
                  ? `Cuenta vinculada · Collector ID: ${mpReceiverId}`
                  : "Conectá tu cuenta de Mercado Pago para recibir pagos con split automático."}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <a href="/api/mercadopago/auth" className="btn-primary text-center">
                  {mpReceiverId ? "Reconectar Mercado Pago" : "Conectar Mercado Pago"}
                </a>
                <button
                  type="button"
                  disabled={mpSaving}
                  className="btn-secondary"
                  onClick={saveMpReceiverId}
                >
                  {mpSaving ? "Guardando…" : "Guardar ID manual"}
                </button>
              </div>
              <AdminField
                label="Receiver ID (manual)"
                name="mp"
                value={mpReceiverId}
                onChange={(e) => setMpReceiverId(e.target.value)}
                placeholder="Se completa al conectar OAuth"
              />
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
