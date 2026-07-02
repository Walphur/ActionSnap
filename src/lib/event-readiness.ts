import type { EventRow } from "@/types/event";

export type EventVisualStatus = "no_photos" | "draft" | "incomplete" | "published" | "hidden";

export type PublishChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  missing?: string;
};

export function buildPublishChecklist(params: {
  mpConnected: boolean;
  event: EventRow | null | undefined;
  taggedCount: number;
}): PublishChecklistItem[] {
  const ev = params.event;
  const photoCount = ev?.photoCount ?? 0;
  const untagged = Math.max(0, photoCount - params.taggedCount);

  return [
    {
      id: "mp",
      label: "Mercado Pago conectado",
      done: params.mpConnected,
      missing: "Conectá Mercado Pago para recibir pagos.",
    },
    {
      id: "event",
      label: "Evento creado",
      done: Boolean(ev),
      missing: "Seleccioná o creá un evento activo.",
    },
    {
      id: "cover",
      label: "Portada",
      done: Boolean(ev?.cover_url),
      missing: "Agregá una portada al evento.",
    },
    {
      id: "price",
      label: "Precio",
      done: (ev?.price_per_photo_cents ?? 0) > 0,
      missing: "Falta configurar el precio.",
    },
    {
      id: "photos",
      label: "Fotos subidas",
      done: photoCount > 0,
      missing: "Subí al menos una foto.",
    },
    {
      id: "tags",
      label: "Etiquetas",
      done: photoCount > 0 && params.taggedCount >= photoCount,
      missing:
        photoCount === 0
          ? "Etiquetá las fotos antes de publicar."
          : `Todavía quedan ${untagged} foto${untagged === 1 ? "" : "s"} sin etiquetar.`,
    },
  ];
}

export function getPublishMissingMessages(items: PublishChecklistItem[]): string[] {
  return items.filter((i) => !i.done && i.missing).map((i) => i.missing!);
}

export function isReadyToPublish(items: PublishChecklistItem[]): boolean {
  return items.length > 0 && items.every((i) => i.done);
}

export function getEventVisualStatus(
  event: EventRow,
  params: { taggedCount: number; mpConnected: boolean }
): EventVisualStatus {
  if (event.is_published) return "published";
  if (event.photoCount === 0) return "no_photos";

  const checklist = buildPublishChecklist({
    mpConnected: params.mpConnected,
    event,
    taggedCount: params.taggedCount,
  });

  if (!isReadyToPublish(checklist)) {
    const untagged = event.photoCount - params.taggedCount;
    if (untagged > 0 && params.taggedCount > 0) return "draft";
    return "incomplete";
  }

  return "hidden";
}

export const EVENT_STATUS_LABELS: Record<
  EventVisualStatus,
  { label: string; emoji: string; tone: "default" | "success" | "warning" | "danger" | "info" }
> = {
  no_photos: { label: "Sin fotos", emoji: "⚪", tone: "default" },
  draft: { label: "Borrador", emoji: "🟡", tone: "warning" },
  incomplete: { label: "Incompleto", emoji: "🟠", tone: "warning" },
  published: { label: "Publicado", emoji: "🟢", tone: "success" },
  hidden: { label: "Oculto", emoji: "🔴", tone: "danger" },
};
