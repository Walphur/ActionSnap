"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { PhotoGrid } from "@/components/PhotoGrid";
import { PhotoGridSkeleton } from "@/components/PhotoGridSkeleton";
import type { PhotoWithNumbers } from "@/lib/types";

const PAGE_LIMIT = 24;

type Props = {
  eventSlug: string;
  eventTitle: string;
  priceCents: number;
  packDiscountPercent?: number;
  paymentLabel?: string | null;
  filterDorsal?: string;
  filterColor?: string;
  totalPhotos: number;
};

type PhotosResponse = {
  photos: PhotoWithNumbers[];
  page: number;
  limit: number;
  hasMore: boolean;
  total: number;
  taggedCount?: number;
  error?: string;
};

export function EventPhotoGallery({
  eventSlug,
  eventTitle,
  priceCents,
  packDiscountPercent = 20,
  paymentLabel = null,
  filterDorsal,
  filterColor,
  totalPhotos,
}: Props) {
  const [photos, setPhotos] = useState<PhotoWithNumbers[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(totalPhotos > 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taggedCount, setTaggedCount] = useState<number | null>(null);
  const [loadedTotal, setLoadedTotal] = useState(0);

  const fetchingRef = useRef(false);
  const pageRef = useRef(1);

  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: "240px 0px",
    threshold: 0,
  });

  const fetchPage = useCallback(
    async (targetPage: number, replace: boolean) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      if (replace) {
        setInitialLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          limit: String(PAGE_LIMIT),
        });
        if (filterDorsal) params.set("numero", filterDorsal);
        if (filterColor && filterColor !== "todos") params.set("color", filterColor);

        const res = await fetch(`/api/events/${eventSlug}/photos?${params.toString()}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as PhotosResponse;

        if (!res.ok) {
          throw new Error(data.error ?? "No se pudieron cargar las fotos");
        }

        setPhotos((prev) => {
          if (replace) return data.photos;
          const seen = new Set(prev.map((p) => p.id));
          const merged = [...prev];
          for (const photo of data.photos) {
            if (!seen.has(photo.id)) merged.push(photo);
          }
          return merged;
        });

        setHasMore(data.hasMore);
        setLoadedTotal(data.total);
        setTaggedCount(data.taggedCount ?? null);
        setPage(targetPage);
        pageRef.current = targetPage;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error de conexión");
      } finally {
        fetchingRef.current = false;
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [eventSlug, filterColor, filterDorsal]
  );

  useEffect(() => {
    if (totalPhotos === 0) {
      setPhotos([]);
      setHasMore(false);
      setInitialLoading(false);
      return;
    }

    pageRef.current = 1;
    setPage(1);
    setHasMore(true);
    void fetchPage(1, true);
  }, [eventSlug, filterDorsal, filterColor, totalPhotos, fetchPage]);

  useEffect(() => {
    if (!inView || !hasMore || initialLoading || loadingMore || fetchingRef.current) {
      return;
    }
    void fetchPage(pageRef.current + 1, false);
  }, [inView, hasMore, initialLoading, loadingMore, fetchPage]);

  if (totalPhotos === 0 && !initialLoading) {
    return (
      <div className="card px-8 py-14 text-center">
        <p className="font-display text-xl font-bold">Galería en preparación</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
          Todavía no hay fotos publicadas para este evento. Volvé pronto.
        </p>
        <Link href="/" className="btn-secondary mt-8 inline-flex">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (initialLoading) {
    return <PhotoGridSkeleton count={12} />;
  }

  if (error) {
    return (
      <div className="card px-8 py-10 text-center">
        <p className="text-red-300">{error}</p>
        <button
          type="button"
          className="btn-primary mt-4"
          onClick={() => void fetchPage(1, true)}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (photos.length === 0 && filterDorsal) {
    return (
      <div className="card px-8 py-14 text-center">
        <p className="font-display text-xl font-bold">
          No encontramos fotos con el dorsal #{filterDorsal}
        </p>
        {(taggedCount ?? 0) === 0 ? (
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
            Las fotos de este evento se están organizando con IA. Probá buscar en la galería
            completa o volvé más tarde.
          </p>
        ) : (
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
            Revisá que el número sea correcto o explorá todas las fotos del evento.
          </p>
        )}
        <Link href={`/eventos/${eventSlug}`} className="btn-primary mt-8 inline-flex">
          Ver galería completa
        </Link>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="card px-8 py-14 text-center">
        <p className="font-display text-xl font-bold">Sin fotos con estos filtros</p>
        <Link href={`/eventos/${eventSlug}`} className="btn-primary mt-8 inline-flex">
          Ver galería completa
        </Link>
      </div>
    );
  }

  return (
    <>
      {filterDorsal && (
        <p className="mb-4 text-sm text-[var(--muted)]">
          Mostrando {photos.length} de {loadedTotal || photos.length} foto(s) con dorsal #
          {filterDorsal}
        </p>
      )}

      <PhotoGrid
        photos={photos}
        priceCents={priceCents}
        eventSlug={eventSlug}
        eventTitle={eventTitle}
        packDiscountPercent={packDiscountPercent}
        filterDorsal={filterDorsal}
        paymentLabel={paymentLabel}
      />

      <div ref={loadMoreRef} className="mt-6 min-h-6" aria-hidden={!hasMore} />

      {loadingMore && <PhotoGridSkeleton count={4} className="mt-2" />}

      {!hasMore && photos.length > 0 && (
        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          Fin de la galería · {photos.length} foto(s) cargadas
        </p>
      )}
    </>
  );
}
