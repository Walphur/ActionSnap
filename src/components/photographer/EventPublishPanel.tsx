"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  ImageIcon,
  Rocket,
  Wallet,
} from "lucide-react";
import { EventSharePanel } from "@/components/photographer/onboarding/EventSharePanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EventStatusBadge } from "@/components/photographer/EventStatusBadge";
import { formatPrice } from "@/lib/format";
import {
  buildPublishChecklist,
  getPublishMissingMessages,
  isReadyToPublish,
} from "@/lib/event-readiness";
import { toast } from "@/components/ui/toast";
import type { EventRow } from "@/types/event";

type EventStats = {
  photos: number;
  tagged: number;
  soldPhotos: number;
  revenueCents: number;
};

type Props = {
  event: EventRow | undefined;
  mpConnected: boolean;
  onPublished?: () => void;
};

export function EventPublishPanel({ event, mpConnected, onPublished }: Props) {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  const loadStats = useCallback(async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/photographer/stats?eventSlug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (res.ok) {
        setStats({
          photos: data.photos ?? 0,
          tagged: data.tagged ?? 0,
          soldPhotos: data.soldPhotos ?? 0,
          revenueCents: data.revenueCents ?? 0,
        });
      } else {
        setStats(null);
      }
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!event?.slug) {
      setStats(null);
      return;
    }
    setJustPublished(false);
    void loadStats(event.slug);
  }, [event?.slug, event?.photoCount, event?.is_published, event?.cover_url, loadStats]);

  const taggedCount = stats?.tagged ?? 0;
  const checklist = useMemo(
    () =>
      buildPublishChecklist({
        mpConnected,
        event,
        taggedCount,
      }),
    [mpConnected, event, taggedCount]
  );

  const ready = isReadyToPublish(checklist);
  const missing = getPublishMissingMessages(checklist);
  const isPublished = event?.is_published ?? false;

  async function publishEvent() {
    if (!event?.slug || !ready) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/photographer/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: event.slug, is_published: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo publicar el evento. Reintentá.");
        return;
      }
      setJustPublished(true);
      toast.success("¡Evento publicado! Ya está visible para compradores.");
      onPublished?.();
    } catch {
      toast.error("Error de conexión al publicar. Revisá tu internet e intentá de nuevo.");
    } finally {
      setPublishing(false);
    }
  }

  if (!event) {
    return (
      <Alert tone="warning" title="Seleccioná un evento">
        Elegí un evento activo arriba para ver el resumen de publicación.
      </Alert>
    );
  }

  return (
    <div className="ds-publish-panel space-y-6">
      <div className="ds-publish-panel__summary">
        <div className="ds-publish-panel__cover">
          {event.cover_url ? (
            <img src={event.cover_url} alt="" loading="lazy" />
          ) : (
            <div className="ds-publish-panel__cover-placeholder">
              <ImageIcon className="h-8 w-8" aria-hidden />
              <span className="ds-caption">Sin portada</span>
            </div>
          )}
        </div>

        <div className="ds-publish-panel__meta">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="ds-h4">{event.title}</h3>
            <EventStatusBadge
              event={event}
              taggedCount={taggedCount}
              mpConnected={mpConnected}
            />
          </div>

          <dl className="ds-publish-panel__stats">
            <div>
              <dt>Fotos</dt>
              <dd>{loading ? "…" : stats?.photos ?? event.photoCount}</dd>
            </div>
            <div>
              <dt>Etiquetadas</dt>
              <dd>
                {loading ? "…" : `${taggedCount}/${stats?.photos ?? event.photoCount}`}
              </dd>
            </div>
            <div>
              <dt>Precio</dt>
              <dd>{formatPrice(event.price_per_photo_cents)}</dd>
            </div>
            <div>
              <dt>Mercado Pago</dt>
              <dd className={mpConnected ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"}>
                {mpConnected ? "Conectado" : "Pendiente"}
              </dd>
            </div>
          </dl>

          <p className="ds-caption flex items-center gap-2 text-[var(--color-text-secondary)]">
            <Wallet className="h-4 w-4 shrink-0" aria-hidden />
            Estado: {isPublished ? "Visible para compradores" : "No publicado"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h4 className="ds-h4">Checklist antes de publicar</h4>
          <p className="ds-caption mt-1">Completá cada paso para vender sin sorpresas.</p>
        </CardHeader>
        <CardBody>
          <ul className="ds-dash-checklist__items">
            {checklist.map((item) => (
              <li
                key={item.id}
                className={`ds-dash-checklist__item ${item.done ? "ds-dash-checklist__item--done" : ""}`}
              >
                {item.done ? (
                  <CheckCircle2 className="ds-dash-checklist__icon h-5 w-5 shrink-0" aria-hidden />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-[var(--color-text-disabled)]" aria-hidden />
                )}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {ready && !isPublished && (
        <Alert tone="success" title="Evento listo para publicar">
          <CheckCircle2 className="mr-2 inline h-4 w-4" aria-hidden />
          Todo está configurado. Publicá para que las personas encuentren sus fotos.
        </Alert>
      )}

      {isPublished && (
        <Alert tone="success" title="Evento publicado">
          Tu galería ya está visible. Compartila para conseguir ventas.
        </Alert>
      )}

      {!ready && missing.length > 0 && (
        <div className="ds-publish-panel__missing" role="status">
          {missing.map((msg) => (
            <p key={msg} className="ds-publish-panel__missing-item">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
              {msg}
            </p>
          ))}
        </div>
      )}

      {!isPublished && (
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="ds-publish-panel__cta w-full"
          loading={publishing}
          disabled={!ready}
          onClick={() => void publishEvent()}
        >
          <Rocket className="h-5 w-5" aria-hidden />
          Publicar evento
        </Button>
      )}

      {(isPublished || justPublished) && (
        <EventSharePanel eventTitle={event.title} slug={event.slug} />
      )}
    </div>
  );
}
