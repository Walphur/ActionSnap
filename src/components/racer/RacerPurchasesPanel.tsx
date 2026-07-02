"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Camera,
  Download,
  ExternalLink,
  Flag,
  LogOut,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { RacerAuthForm } from "@/components/racer/RacerAuthForm";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
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
      setError(e instanceof Error ? e.message : "No pudimos cargar tus compras. Revisá tu conexión e intentá de nuevo.");
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
      <div className="buyer-purchases mx-auto max-w-lg">
        <Skeleton className="h-40 w-full rounded-[var(--ds-radius-lg)]" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="buyer-purchases mx-auto max-w-lg">
        <header className="buyer-purchases__head buyer-purchases__head--center">
          <p className="ds-overline">Galería personal</p>
          <h1 className="ds-h2 mt-2">Mis compras</h1>
          <p className="ds-body-lg mt-3 text-[var(--color-text-secondary)]">
            Accedé con el mismo email que usaste al pagar. Tus fotos en HD, siempre disponibles.
          </p>
        </header>
        <RacerAuthForm urlError={urlError} />
      </div>
    );
  }

  return (
    <div className="buyer-purchases mx-auto max-w-2xl pb-8">
      <header className="buyer-purchases__head">
        <div>
          <p className="ds-overline">Galería personal</p>
          <h1 className="ds-h2 mt-1">Mis compras</h1>
          {data?.email && (
            <p className="ds-caption mt-2 text-[var(--color-text-secondary)]">{data.email}</p>
          )}
        </div>
        <div className="buyer-purchases__toolbar">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={loading}
            onClick={() => void loadPurchases()}
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            {loading ? "Actualizando…" : "Actualizar"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" aria-hidden />
            Salir
          </Button>
        </div>
      </header>

      {error && (
        <Alert tone="danger" className="mb-6">
          {error}
        </Alert>
      )}

      {loading && !data && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-[var(--ds-radius-lg)]" />
          ))}
        </div>
      )}

      {!loading && data && data.totalPhotos === 0 && (
        <EmptyState
          icon={ShoppingBag}
          title="Todavía no hay compras"
          description="Cuando compres fotos en un evento, aparecerán acá organizadas por carrera para que las descargues cuando quieras."
          action={
            <ButtonLink href="/explorar" variant="primary">
              Explorar eventos
            </ButtonLink>
          }
        />
      )}

      {data && data.events.length > 0 && (
        <div className="buyer-purchases__groups">
          <p className="ds-caption">
            {data.totalPhotos} foto{data.totalPhotos !== 1 ? "s" : ""} en {data.events.length}{" "}
            evento{data.events.length !== 1 ? "s" : ""}
          </p>

          {data.events.map((group) => (
            <Card key={group.eventId} className="buyer-purchases__group">
              <CardHeader className="buyer-purchases__group-head">
                {group.coverUrl ? (
                  <img
                    src={group.coverUrl}
                    alt=""
                    className="buyer-purchases__group-cover"
                  />
                ) : (
                  <div className="buyer-purchases__group-cover buyer-purchases__group-cover--empty">
                    <Flag className="h-6 w-6" aria-hidden />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="ds-h4 truncate">{group.label}</h2>
                  <p className="ds-caption mt-1">
                    {group.photos.length} foto{group.photos.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <ButtonLink
                  href={`/eventos/${group.eventSlug}`}
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Ver evento
                </ButtonLink>
              </CardHeader>

              <CardBody className="buyer-purchases__group-list">
                <ul className="buyer-purchases__photos">
                  {group.photos.map((photo) => (
                    <li key={photo.photoId} className="buyer-purchases__photo">
                      <div className="buyer-purchases__photo-thumb">
                        <img
                          src={photo.previewUrl}
                          alt={photo.dorsal ? `Dorsal ${photo.dorsal}` : "Foto comprada"}
                          loading="lazy"
                          draggable={false}
                          className="pointer-events-none h-full w-full select-none object-cover"
                        />
                        <div className="buyer-purchases__photo-shield" aria-hidden />
                        {photo.dorsal && (
                          <Badge className="buyer-purchases__photo-badge">#{photo.dorsal}</Badge>
                        )}
                      </div>

                      <div className="buyer-purchases__photo-meta">
                        <p className="ds-body font-medium">
                          {photo.dorsal ? `Dorsal #${photo.dorsal}` : "Foto HD"}
                        </p>
                        <p className="ds-caption mt-1">
                          <Camera className="inline h-3.5 w-3.5" aria-hidden /> Vista previa con
                          marca de agua
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        loading={downloadingId === photo.photoId}
                        className="buyer-purchases__photo-dl"
                        onClick={() => void downloadHd(photo.photoId, photo.fileName)}
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        {downloadingId === photo.photoId ? "Preparando…" : "Descargar HD"}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <ButtonLink href="/explorar" variant="secondary" className="mt-10">
        Explorar más eventos
      </ButtonLink>
    </div>
  );
}
