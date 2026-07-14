"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Ban,
  Camera,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  ExternalLink,
  RefreshCw,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import { PLATFORM } from "@/lib/platform";

type Metrics = {
  photographers: number;
  publishedEvents: number;
  totalPhotos: number;
  totalSalesCents: number;
  platformRevenueCents: number;
  commissionOwedCents: number;
  bankTransferSalesCount: number;
  commissionPercent: number;
  labels: {
    totalSales: string;
    platformRevenue: string;
    commissionOwed: string;
  };
};

type PhotographerEvent = {
  slug: string;
  title: string;
  isPublished: boolean;
  eventDate: string;
};

type PhotographerRow = {
  id: string;
  fullName: string | null;
  email: string | null;
  mpConnected: boolean;
  eventsCount: number;
  events: PhotographerEvent[];
  isActive: boolean;
  createdAt: string;
  salesCount: number;
  grossSalesCents: number;
  sellerTotalCents: number;
  platformFeeCents: number;
  commissionOwedCents: number;
};

export function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [photographers, setPhotographers] = useState<PhotographerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [metricsRes, photographersRes] = await Promise.all([
      fetch("/api/admin/metrics"),
      fetch("/api/admin/photographers"),
    ]);

    const metricsData = await metricsRes.json();
    const photographersData = await photographersRes.json();

    if (!metricsRes.ok) {
      setError(metricsData.error ?? "No se pudieron cargar las métricas");
      setLoading(false);
      return;
    }

    if (!photographersRes.ok) {
      setError(photographersData.error ?? "No se pudieron cargar los fotógrafos");
      setLoading(false);
      return;
    }

    setMetrics(metricsData);
    setPhotographers(photographersData.photographers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = photographers.find((p) => p.id === selectedId) ?? null;

  async function togglePhotographer(id: string, nextActive: boolean) {
    setActionId(id);
    const res = await fetch(`/api/admin/photographers/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: nextActive }),
    });
    const data = await res.json();
    setActionId(null);

    if (!res.ok) {
      setError(data.error ?? "No se pudo actualizar el fotógrafo");
      return;
    }

    setPhotographers((rows) =>
      rows.map((row) => (row.id === id ? { ...row, isActive: nextActive } : row))
    );
  }

  async function settleCommission(id: string, name: string, owedCents: number) {
    const label = name || "este fotógrafo";
    if (
      !window.confirm(
        `¿Marcar como cobrada la comisión de ${formatPrice(owedCents)} de ${label}? Solo hacelo cuando te transfirió tu ${PLATFORM.commissionPercent}%.`
      )
    ) {
      return;
    }

    setActionId(id);
    const res = await fetch(`/api/admin/photographers/${id}/settle-commission`, {
      method: "POST",
    });
    const data = await res.json();
    setActionId(null);

    if (!res.ok) {
      setError(data.error ?? "No se pudo liquidar la comisión");
      return;
    }

    await load();
  }

  async function deletePhotographer(id: string, name: string) {
    const label = name || "este fotógrafo";
    if (!window.confirm(`¿Eliminar ${label} y todos sus eventos? Esta acción no se puede deshacer.`)) {
      return;
    }

    setActionId(id);
    const res = await fetch(`/api/admin/photographers/${id}`, { method: "DELETE" });
    const data = await res.json();
    setActionId(null);

    if (!res.ok) {
      setError(data.error ?? "No se pudo eliminar el fotógrafo");
      return;
    }

    setPhotographers((rows) => rows.filter((row) => row.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="admin-dashboard mx-auto w-full max-w-[1600px] px-3 py-6 sm:px-4 md:px-6 md:py-10">
      <header className="admin-dashboard-header">
        <div>
          <p className="admin-dashboard-kicker">Super Admin · {PLATFORM.name}</p>
          <h1 className="ds-h2 admin-dashboard-title">Panel de plataforma</h1>
          <p className="admin-dashboard-subtitle">
            Métricas de negocio, fotógrafos y comisiones ({PLATFORM.commissionPercent}% plataforma).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Actualizar
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => void logout()}>
            Salir
          </Button>
        </div>
      </header>

      {error && (
        <Alert tone="danger" className="mb-6">
          {error}
        </Alert>
      )}

      <section className="admin-metrics-grid">
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          label="Fotógrafos"
          value={loading ? "…" : String(metrics?.photographers ?? 0)}
        />
        <MetricCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Eventos publicados"
          value={loading ? "…" : String(metrics?.publishedEvents ?? 0)}
        />
        <MetricCard
          icon={<Camera className="h-5 w-5" />}
          label="Fotos totales"
          value={loading ? "…" : String(metrics?.totalPhotos ?? 0)}
        />
        <MetricCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Ventas aprobadas"
          value={loading ? "…" : metrics?.labels.totalSales ?? formatPrice(0)}
          highlight
        />
        <MetricCard
          icon={<Wallet className="h-5 w-5" />}
          label={`Ganancia plataforma (${PLATFORM.commissionPercent}%)`}
          value={loading ? "…" : metrics?.labels.platformRevenue ?? formatPrice(0)}
          accent
        />
        <MetricCard
          icon={<Wallet className="h-5 w-5" />}
          label="Comisión a cobrar (transferencias)"
          value={loading ? "…" : metrics?.labels.commissionOwed ?? formatPrice(0)}
          highlight
        />
      </section>

      <section className="admin-table-card">
        <div className="admin-table-header">
          <h2 className="ds-h3">Fotógrafos</h2>
          <p className="text-sm text-[var(--muted)]">
            Tocá un fotógrafo para ver ventas, eventos y acciones.
          </p>
        </div>

        <div className="admin-photographer-layout">
          <div className="admin-photographer-list" role="list">
            {loading ? (
              <p className="admin-table-empty">Cargando fotógrafos…</p>
            ) : photographers.length === 0 ? (
              <p className="admin-table-empty">Todavía no hay fotógrafos registrados.</p>
            ) : (
              photographers.map((row) => {
                const active = selectedId === row.id;
                return (
                  <button
                    key={row.id}
                    type="button"
                    role="listitem"
                    className={`admin-photographer-row${active ? " admin-photographer-row--active" : ""}`}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <div className="admin-photographer-row__main">
                      <p className="admin-photographer-row__name">{row.fullName || "Sin nombre"}</p>
                      <p className="admin-photographer-row__email">{row.email ?? "—"}</p>
                    </div>
                    <div className="admin-photographer-row__meta">
                      {row.mpConnected ? (
                        <span className="admin-badge admin-badge--ok">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                          MP
                        </span>
                      ) : (
                        <span className="admin-badge admin-badge--muted">Sin MP</span>
                      )}
                      {!row.isActive && (
                        <span className="admin-badge admin-badge--danger">Suspendido</span>
                      )}
                      {row.commissionOwedCents > 0 && (
                        <span className="admin-badge admin-badge--danger">
                          Deuda {formatPrice(row.commissionOwedCents)}
                        </span>
                      )}
                      <span className="admin-photographer-row__sales">
                        {row.salesCount} venta{row.salesCount === 1 ? "" : "s"}
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-60" aria-hidden />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="admin-photographer-detail">
            {!selected ? (
              <div className="admin-photographer-detail__empty">
                <p className="ds-h4">Detalle</p>
                <p className="ds-caption mt-2 text-[var(--muted)]">
                  Elegí un fotógrafo de la lista para ver ingresos, eventos y acciones.
                </p>
              </div>
            ) : (
              <div className="admin-photographer-detail__body">
                <div className="admin-photographer-detail__head">
                  <div>
                    <h3 className="ds-h3">{selected.fullName || "Sin nombre"}</h3>
                    <p className="ds-caption mt-1">{selected.email ?? "Sin email"}</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                    Cerrar
                  </Button>
                </div>

                <dl className="admin-photographer-stats">
                  <div>
                    <dt>Mercado Pago</dt>
                    <dd>{selected.mpConnected ? "Conectado" : "Pendiente"}</dd>
                  </div>
                  <div>
                    <dt>Estado</dt>
                    <dd>{selected.isActive ? "Activo" : "Suspendido"}</dd>
                  </div>
                  <div>
                    <dt>Ventas</dt>
                    <dd>{selected.salesCount}</dd>
                  </div>
                  <div>
                    <dt>Bruto</dt>
                    <dd>{formatPrice(selected.grossSalesCents)}</dd>
                  </div>
                  <div>
                    <dt>Ingreso fotógrafo</dt>
                    <dd>{formatPrice(selected.sellerTotalCents)}</dd>
                  </div>
                  <div>
                    <dt>Comisión plataforma</dt>
                    <dd>{formatPrice(selected.platformFeeCents)}</dd>
                  </div>
                  <div>
                    <dt>Deuda (transferencias)</dt>
                    <dd>
                      {selected.commissionOwedCents > 0
                        ? formatPrice(selected.commissionOwedCents)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt>Eventos</dt>
                    <dd>{selected.eventsCount}</dd>
                  </div>
                </dl>

                {selected.events.length > 0 && (
                  <div className="admin-photographer-events">
                    <p className="ds-caption font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Eventos
                    </p>
                    <ul className="admin-events-list">
                      {selected.events.map((event) => (
                        <li key={event.slug}>
                          <Link href={`/eventos/${event.slug}`} target="_blank" rel="noopener noreferrer">
                            {event.title}
                            <ExternalLink className="ml-1 inline h-3 w-3" aria-hidden />
                          </Link>
                          <span className="admin-events-list__meta">
                            {event.eventDate}
                            {event.isPublished ? " · Publicado" : " · Borrador"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="admin-photographer-actions">
                  {selected.commissionOwedCents > 0 && (
                    <Button
                      type="button"
                      variant="primary"
                      disabled={actionId === selected.id}
                      loading={actionId === selected.id}
                      onClick={() =>
                        void settleCommission(
                          selected.id,
                          selected.fullName ?? "",
                          selected.commissionOwedCents
                        )
                      }
                    >
                      Cobró comisión ({formatPrice(selected.commissionOwedCents)})
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant={selected.isActive ? "secondary" : "primary"}
                    disabled={actionId === selected.id}
                    loading={actionId === selected.id}
                    onClick={() => void togglePhotographer(selected.id, !selected.isActive)}
                  >
                    {selected.isActive ? (
                      <>
                        <Ban className="h-3.5 w-3.5" aria-hidden />
                        Suspender
                      </>
                    ) : (
                      "Reactivar"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={actionId === selected.id}
                    onClick={() => void deletePhotographer(selected.id, selected.fullName ?? "")}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Eliminar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">
          Ver sitio público
        </Link>
      </p>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  highlight = false,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  accent?: boolean;
}) {
  return (
    <article
      className={[
        "admin-metric-card",
        highlight ? "admin-metric-card--highlight" : "",
        accent ? "admin-metric-card--accent" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="admin-metric-icon">{icon}</div>
      <p className="admin-metric-label">{label}</p>
      <p className="admin-metric-value">{value}</p>
    </article>
  );
}
