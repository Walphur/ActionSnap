"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Ban,
  Camera,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  LogOut,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import { PLATFORM } from "@/lib/platform";

type Metrics = {
  photographers: number;
  publishedEvents: number;
  totalPhotos: number;
  totalSalesCents: number;
  platformRevenueCents: number;
  commissionPercent: number;
  labels: {
    totalSales: string;
    platformRevenue: string;
  };
};

type PhotographerRow = {
  id: string;
  fullName: string | null;
  email: string | null;
  mpConnected: boolean;
  eventsCount: number;
  isActive: boolean;
  createdAt: string;
};

export function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [photographers, setPhotographers] = useState<PhotographerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

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
          <h1 className="font-display admin-dashboard-title">Panel de plataforma</h1>
          <p className="admin-dashboard-subtitle">
            Métricas de negocio, fotógrafos y comisiones ({PLATFORM.commissionPercent}% plataforma).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void load()} className="btn-secondary">
            <RefreshCw className="h-4 w-4" aria-hidden />
            Actualizar
          </button>
          <button type="button" onClick={() => void logout()} className="btn-ghost">
            <LogOut className="h-4 w-4" aria-hidden />
            Salir
          </button>
        </div>
      </header>

      {error && <p className="admin-dashboard-error">{error}</p>}

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
      </section>

      <section className="admin-table-card">
        <div className="admin-table-header">
          <h2 className="font-display text-xl font-bold uppercase">Fotógrafos</h2>
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
                <th>Eventos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="admin-table-empty">
                    Cargando fotógrafos…
                  </td>
                </tr>
              ) : photographers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-table-empty">
                    Todavía no hay fotógrafos registrados.
                  </td>
                </tr>
              ) : (
                photographers.map((row) => (
                  <tr key={row.id}>
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
                    <td data-label="Eventos">{row.eventsCount}</td>
                    <td data-label="Estado">
                      {row.isActive ? (
                        <span className="admin-badge admin-badge--ok">Activo</span>
                      ) : (
                        <span className="admin-badge admin-badge--danger">Suspendido</span>
                      )}
                    </td>
                    <td data-label="Acciones">
                      <button
                        type="button"
                        disabled={actionId === row.id}
                        className={row.isActive ? "btn-secondary !py-2 !text-xs" : "btn-primary !py-2 !text-xs"}
                        onClick={() => void togglePhotographer(row.id, !row.isActive)}
                      >
                        {actionId === row.id ? (
                          "Guardando…"
                        ) : row.isActive ? (
                          <>
                            <Ban className="h-3.5 w-3.5" aria-hidden />
                            Suspender
                          </>
                        ) : (
                          "Reactivar"
                        )}
                      </button>
                    </td>
                  </tr>
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
