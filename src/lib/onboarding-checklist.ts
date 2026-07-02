import type { DashboardOverview, EventRow } from "@/types/event";

export type OnboardingChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export function buildOnboardingChecklist(
  overview: DashboardOverview | null,
  events: EventRow[],
  mpReceiverId: string,
  photographerName: string
): OnboardingChecklistItem[] {
  const photoCount = overview?.photoCount ?? 0;
  const taggedCount = overview?.taggedPhotoCount ?? 0;

  return [
    {
      id: "profile",
      label: "Completar perfil",
      done: photographerName.trim().length > 0,
    },
    {
      id: "mp",
      label: "Conectar Mercado Pago",
      done: Boolean(overview?.mpConnected || mpReceiverId),
    },
    {
      id: "event",
      label: "Crear primer evento",
      done: events.length > 0,
    },
    {
      id: "cover",
      label: "Agregar portada",
      done: events.some((e) => Boolean(e.cover_url)),
    },
    {
      id: "photos",
      label: "Subir fotos",
      done: photoCount > 0,
    },
    {
      id: "tags",
      label: "Etiquetar manualmente las fotos",
      done: photoCount > 0 && taggedCount >= photoCount,
    },
    {
      id: "publish",
      label: "Publicar evento",
      done: events.some((e) => e.is_published),
    },
    {
      id: "sale",
      label: "Conseguir primera venta",
      done: (overview?.recentSales.length ?? 0) > 0,
    },
  ];
}

export function isOnboardingComplete(items: OnboardingChecklistItem[]): boolean {
  return items.length > 0 && items.every((i) => i.done);
}
