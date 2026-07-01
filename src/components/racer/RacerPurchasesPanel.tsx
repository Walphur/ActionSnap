"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RacerAuthForm } from "@/components/racer/RacerAuthForm";
import type { RacerEventGroup } from "@/lib/racer-purchases";

type PurchasesResponse = {
  email: string;
  fullName: string | null;
  events: RacerEventGroup[];
  totalPhotos: number;
  error?: string;
};

export function RacerPurchasesPanel({ urlError }: { urlError?: string | null }) {
  const supabase = useMemo(() => createClient(), []);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PurchasesResponse | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/racer/purchases", { cache: "no-store" });
      const json = (await res.json()) as PurchasesResponse;

      if (res.status === 401) {
        setIsLoggedIn(false);
        setData(null);
        return;
      }

      if (!res.ok) {
        throw new Error(json.error ?? "No se pudieron cargar tus compras");
      }

      setIsLoggedIn(true);
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: session }) => {
      setIsLoggedIn(Boolean(session.session));
      setAuthChecked(true);
      if (session.session) {
        void loadPurchases();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
      if (session) {
        void loadPurchases();
      } else {
        setData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadPurchases]);

  async function signOut() {
    await supabase.auth.signOut();
    setData(null);
    setIsLoggedIn(false);
  }

  async function downloadHd(photoId: string, fileName: string) {
    setDownloadingId(photoId);
    setError(null);
    try {
      const res = await fetch("/api/racer/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, fileName }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "No se pudo descargar");
      }

      const anchor = document.createElement("a");
      anchor.href = json.downloadUrl;
      anchor.download = json.fileName ?? fileName;
      anchor.rel = "noopener";
      anchor.target = "_blank";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al descargar");
    } finally {
      setDownloadingId(null);
    }
  }

  if (!authChecked) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card h-40 animate-pulse bg-[var(--surface)]" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Galería personal
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold">Mis compras</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Accedé con el mismo email que usaste al pagar. Tus fotos en HD, siempre
            disponibles.
          </p>
        </header>
        <RacerAuthForm urlError={urlError} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Galería personal
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold">Mis compras</h1>
          {data?.email && (
            <p className="mt-2 text-sm text-[var(--muted)]">{data.email}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadPurchases()}
            disabled={loading}
            className="btn-secondary !py-2 !text-sm"
          >
            {loading ? "Actualizando…" : "Actualizar"}
          </button>
          <button type="button" onClick={() => void signOut()} className="btn-ghost !py-2 !text-sm">
            Salir
          </button>
        </div>
      </header>

      {error && (
        <div className="card mb-6 border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="card h-48 animate-pulse bg-[var(--surface)]" />
          ))}
        </div>
      )}

      {!loading && data && data.totalPhotos === 0 && (
        <div className="card px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-3xl">
            📷
          </div>
          <h2 className="font-display text-xl font-bold">Todavía no hay compras</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--muted)]">
            Cuando compres fotos en un evento, aparecerán acá organizadas por carrera para
            que las descargues cuando quieras.
          </p>
          <Link href="/" className="btn-primary mt-8 inline-flex">
            Explorar eventos
          </Link>
        </div>
      )}

      {data && data.events.length > 0 && (
        <div className="space-y-8">
          <p className="text-sm text-[var(--muted)]">
            {data.totalPhotos} foto{data.totalPhotos !== 1 ? "s" : ""} en{" "}
            {data.events.length} evento{data.events.length !== 1 ? "s" : ""}
          </p>

          {data.events.map((group) => (
            <section key={group.eventId} className="card overflow-hidden">
              <div className="flex items-center gap-4 border-b border-[var(--border)] p-4">
                {group.coverUrl ? (
                  <img
                    src={group.coverUrl}
                    alt=""
                    className="h-14 w-20 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg">
                    🏁
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-display truncate text-lg font-bold">{group.label}</h2>
                  <p className="text-xs text-[var(--muted)]">
                    {group.photos.length} foto{group.photos.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Link
                  href={`/eventos/${group.eventSlug}`}
                  className="btn-ghost shrink-0 !py-2 !text-xs"
                >
                  Ver evento
                </Link>
              </div>

              <ul className="divide-y divide-[var(--border)]">
                {group.photos.map((photo) => (
                  <li
                    key={photo.photoId}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-32 sm:aspect-auto">
                      <img
                        src={photo.previewUrl}
                        alt={photo.dorsal ? `Dorsal ${photo.dorsal}` : "Foto comprada"}
                        loading="lazy"
                        draggable={false}
                        className="pointer-events-none h-full w-full select-none object-cover"
                      />
                      <div
                        className="absolute inset-0 z-10"
                        aria-hidden
                        onContextMenu={(e) => e.preventDefault()}
                      />
                      {photo.dorsal && (
                        <span className="absolute left-2 top-2 z-20 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white">
                          #{photo.dorsal}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {photo.dorsal ? `Dorsal #${photo.dorsal}` : "Foto HD"}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Comprada · vista previa con marca de agua
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={downloadingId === photo.photoId}
                      onClick={() => void downloadHd(photo.photoId, photo.fileName)}
                      className="btn-primary w-full shrink-0 !py-2.5 !text-sm sm:w-auto"
                    >
                      {downloadingId === photo.photoId
                        ? "Preparando…"
                        : "Descargar HD original"}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Link href="/" className="btn-secondary mt-10 inline-flex">
        Explorar más eventos
      </Link>
    </div>
  );
}
