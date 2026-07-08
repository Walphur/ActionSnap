"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Camera, ImageOff, SearchX } from "lucide-react";
import { PhotoGrid } from "@/components/PhotoGrid";
import { PhotoGridSkeleton } from "@/components/PhotoGridSkeleton";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PhotoSortOrder } from "@/lib/sort-photos";
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
  sortOrder?: PhotoSortOrder;
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
  sortOrder = "default",
  totalPhotos,
}: Props) {
  const [photos, setPhotos] = useState<PhotoWithNumbers[]>([]);
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
        pageRef.current = targetPage;
      } catch (e) {
        setError(e instanceof Error ? e.message : "No pudimos cargar las fotos. Revisá tu conexión e intentá de nuevo.");
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
      <EmptyState
        icon={Camera}
        title="Galería en preparación"
        description="Todavía no hay fotos publicadas para este evento. Volvé pronto."
        action={
          <ButtonLink href="/explorar" variant="secondary">
            Explorar eventos
          </ButtonLink>
        }
      />
    );
  }

  if (initialLoading) {
    return <PhotoGridSkeleton count={12} />;
  }

  if (error) {
    return (
      <EmptyState
        icon={ImageOff}
        title="No se pudieron cargar las fotos"
        description={error}
        action={
          <Button type="button" variant="primary" onClick={() => void fetchPage(1, true)}>
            Reintentar
          </Button>
        }
      />
    );
  }

  if (photos.length === 0 && filterDorsal) {
    const showColorHint = filterColor && filterColor !== "todos";
    return (
      <EmptyState
        icon={SearchX}
        title="No encontramos fotos para ese número"
        description={
          showColorHint
            ? `No hay fotos del número #${filterDorsal} con ese color. Probá otro número o quitá el filtro de color.`
            : "Probá con otro número o buscá por color si el evento lo permite."
        }
        action={
          <ButtonLink href={`/eventos/${eventSlug}`} variant="primary">
            Ver galería completa
          </ButtonLink>
        }
      />
    );
  }

  if (photos.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="Sin fotos con estos filtros"
        description="Probá otros criterios de búsqueda."
        action={
          <ButtonLink href={`/eventos/${eventSlug}`} variant="primary">
            Ver galería completa
          </ButtonLink>
        }
      />
    );
  }

  return (
    <>
      {filterDorsal && (
        <div className="ds-search-results" role="status">
          <p className="ds-body font-medium">
            Encontramos{" "}
            <strong className="text-[var(--color-primary)]">
              {loadedTotal || photos.length}
            </strong>{" "}
            foto{(loadedTotal || photos.length) === 1 ? "" : "s"} para el número{" "}
            <strong>#{filterDorsal}</strong>
            {filterColor && filterColor !== "todos" && (
              <span className="text-[var(--color-text-secondary)]"> · color {filterColor}</span>
            )}
          </p>
        </div>
      )}

      <PhotoGrid
        photos={photos}
        priceCents={priceCents}
        eventSlug={eventSlug}
        eventTitle={eventTitle}
        packDiscountPercent={packDiscountPercent}
        filterDorsal={filterDorsal}
        paymentLabel={paymentLabel}
        sortOrder={sortOrder}
      />

      <div ref={loadMoreRef} className="mt-6 min-h-6" aria-hidden={!hasMore} />

      {loadingMore && <PhotoGridSkeleton count={4} className="mt-2" />}

      {!hasMore && photos.length > 0 && (
        <p className="ds-caption mt-6 text-center">
          Fin de la galería · {photos.length} foto(s) cargadas
        </p>
      )}
    </>
  );
}
