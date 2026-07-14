"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Ban,
  Camera,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  DollarSign,
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    if (expandedId === id) setExpandedId(null);
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="admin-dashboard mx-auto max-w-6xl px-4 py-6 md:py-10">
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
            Gestioná cuentas, Mercado Pago y suspensiones.
          </p>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>MP</th>
                <th>Ventas</th>
                <th>Ingreso fotografo</th>
                <th>Deuda comisión</th>
                <th>Eventos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="admin-table-empty">
                    Cargando fotógrafos…
                  </td>
                </tr>
              ) : photographers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="admin-table-empty">
                    Todavía no hay fotógrafos registrados.
                  </td>
                </tr>
              ) : (
                photographers.map((row) => (
                  <Fragment key={row.id}>
                    <tr>
                      <td data-label="Nombre">{row.fullName || "Sin nombre"}</td>
                      <td data-label="Email">{row.email ?? "—"}</td>
                      <td data-label="MP">
                        {row.mpConnected ? (
                          <span className="admin-badge admin-badge--ok">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                            Conectado
                          </span>
                        ) : (
                          <span className="admin-badge admin-badge--muted">Pendiente</span>
                        )}
                      </td>
                      <td data-label="Ventas">{row.salesCount}</td>
                      <td data-label="Ingreso fotografo">
                        {formatPrice(row.sellerTotalCents)}
                      </td>
                      <td data-label="Deuda comisión">
                        {row.commissionOwedCents > 0 ? (
                          <span className="admin-badge admin-badge--danger">
                            {formatPrice(row.commissionOwedCents)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td data-label="Eventos">
                        {row.eventsCount > 0 ? (
                          <button
                            type="button"
                            className="admin-events-toggle"
                            onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                            aria-expanded={expandedId === row.id}
                          >
                            {expandedId === row.id ? (
                              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                            )}
                            {row.eventsCount}
                          </button>
                        ) : (
                          "0"
                        )}
                      </td>
                      <td data-label="Estado">
                        {row.isActive ? (
                          <span className="admin-badge admin-badge--ok">Activo</span>
                        ) : (
                          <span className="admin-badge admin-badge--danger">Suspendido</span>
                        )}
                      </td>
                      <td data-label="Acciones">
                        <div className="admin-table-actions">
                          {row.commissionOwedCents > 0 && (
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              disabled={actionId === row.id}
                              loading={actionId === row.id}
                              onClick={() =>
                                void settleCommission(
                                  row.id,
                                  row.fullName ?? "",
                                  row.commissionOwedCents
                                )
                              }
                            >
                              Cobró comisión
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant={row.isActive ? "secondary" : "primary"}
                            size="sm"
                            disabled={actionId === row.id}
                            loading={actionId === row.id}
                            onClick={() => void togglePhotographer(row.id, !row.isActive)}
                          >
                            {row.isActive ? (
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
                            size="sm"
                            disabled={actionId === row.id}
                            onClick={() => void deletePhotographer(row.id, row.fullName ?? "")}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === row.id && row.events.length > 0 && (
                      <tr className="admin-table-events-row">
                        <td colSpan={9}>
                          <ul className="admin-events-list">
                            {row.events.map((event) => (
                              <li key={event.slug}>
                                <Link href={`/eventos/${event.slug}`} target="_blank" rel="noopener noreferrer">
                                  {event.title}
                                </Link>
                                <span className="admin-events-list__meta">
                                  {event.eventDate}
                                  {event.isPublished ? " · Publicado" : " · Borrador"}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
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
