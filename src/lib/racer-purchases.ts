import type { SupabaseClient } from "@supabase/supabase-js";
import { formatEventGroupLabel } from "@/lib/format";
import { getDisplayPreviewUrl } from "@/lib/preview-url";

export type RacerPhoto = {
  photoId: string;
  purchaseId: string;
  purchasedAt: string;
  previewUrl: string;
  dorsal: string | null;
  fileName: string;
};

export type RacerEventGroup = {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  eventDate: string;
  coverUrl: string | null;
  label: string;
  photos: RacerPhoto[];
};

type EventEmbed = {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  cover_url: string | null;
};

type PhotoEmbed = {
  id: string;
  preview_url: string;
  original_url: string;
  event_id: string;
  events: EventEmbed | EventEmbed[] | null;
  photo_numbers: Array<{ number: string }> | null;
};

type PurchaseRow = {
  id: string;
  created_at: string;
  purchase_items: Array<{
    photo_id: string;
    photos: PhotoEmbed | PhotoEmbed[] | null;
  }> | null;
};

function normalizePhoto(raw: PhotoEmbed | PhotoEmbed[] | null | undefined) {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] : raw;
}

function normalizeEvent(raw: EventEmbed | EventEmbed[] | null | undefined) {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] : raw;
}

export async function getRacerPurchasesGrouped(
  supabase: SupabaseClient,
  userId: string,
  email: string
): Promise<RacerEventGroup[]> {
  const normalizedEmail = email.trim().toLowerCase();

  const { data: purchases, error } = await supabase
    .from("purchases")
    .select(
      `
      id,
      created_at,
      purchase_items (
        photo_id,
        photos (
          id,
          preview_url,
          original_url,
          event_id,
          events (
            id,
            title,
            slug,
            event_date,
            cover_url
          ),
          photo_numbers ( number )
        )
      )
    `
    )
    .eq("status", "paid")
    .or(`user_id.eq.${userId},email.ilike.${normalizedEmail}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const byEvent = new Map<string, RacerEventGroup>();
  let fileIndex = 0;

  for (const purchase of (purchases ?? []) as PurchaseRow[]) {
    for (const item of purchase.purchase_items ?? []) {
      const photo = normalizePhoto(item.photos);
      const event = normalizeEvent(photo?.events ?? null);

      if (!photo?.id || !event?.id) continue;

      fileIndex += 1;
      const dorsal = photo.photo_numbers?.[0]?.number ?? null;

      const racerPhoto: RacerPhoto = {
        photoId: photo.id,
        purchaseId: purchase.id,
        purchasedAt: purchase.created_at,
        previewUrl: getDisplayPreviewUrl(photo),
        dorsal,
        fileName: `action-snap-${event.slug}-${dorsal ?? fileIndex}.jpg`,
      };

      const existing = byEvent.get(event.id);
      if (existing) {
        if (!existing.photos.some((p) => p.photoId === racerPhoto.photoId)) {
          existing.photos.push(racerPhoto);
        }
        continue;
      }

      byEvent.set(event.id, {
        eventId: event.id,
        eventSlug: event.slug,
        eventTitle: event.title,
        eventDate: event.event_date,
        coverUrl: event.cover_url,
        label: formatEventGroupLabel(event.title, event.event_date),
        photos: [racerPhoto],
      });
    }
  }

  return Array.from(byEvent.values()).sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );
}

export async function userOwnsPhoto(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  photoId: string
): Promise<{ purchaseId: string; originalUrl: string; cloudinaryPublicId: string | null } | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const { data: purchases } = await supabase
    .from("purchases")
    .select("id")
    .eq("status", "paid")
    .or(`user_id.eq.${userId},email.ilike.${normalizedEmail}`);

  const purchaseIds = (purchases ?? []).map((p) => p.id);
  if (purchaseIds.length === 0) return null;

  const { data: item } = await supabase
    .from("purchase_items")
    .select(
      "purchase_id, photos ( id, original_url, cloudinary_public_id )"
    )
    .eq("photo_id", photoId)
    .in("purchase_id", purchaseIds)
    .maybeSingle();

  if (!item?.photos) return null;

  const photo = Array.isArray(item.photos) ? item.photos[0] : item.photos;
  if (!photo?.original_url) return null;

  return {
    purchaseId: item.purchase_id,
    originalUrl: photo.original_url,
    cloudinaryPublicId: photo.cloudinary_public_id ?? null,
  };
}
