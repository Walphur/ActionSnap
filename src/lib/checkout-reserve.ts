import type { SupabaseClient } from "@supabase/supabase-js";
import { logWarn } from "@/lib/safe-logger";

type ReserveRpcResult = {
  ok: boolean;
  code?: string;
  reserved?: number;
  expected?: number;
};

export async function reservePhotosForCheckout(
  supabase: SupabaseClient,
  purchaseId: string,
  eventId: string,
  photoIds: string[]
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const { data, error } = await supabase.rpc("reserve_photos_for_checkout", {
    p_purchase_id: purchaseId,
    p_event_id: eventId,
    p_photo_ids: photoIds,
  });

  if (error) {
    logWarn("checkout-reserve", "RPC reserve_photos_for_checkout no disponible", {
      message: error.message,
      purchaseId,
    });
    return reservePhotosFallback(supabase, purchaseId, eventId, photoIds);
  }

  const result = data as ReserveRpcResult;
  if (result?.ok) return { ok: true };

  return {
    ok: false,
    code: result?.code ?? "PHOTOS_UNAVAILABLE",
    message:
      result?.code === "PHOTOS_UNAVAILABLE"
        ? "Una o más fotos ya no están disponibles. Actualizá la galería e intentá de nuevo."
        : "No se pudieron reservar las fotos para la compra.",
  };
}

async function reservePhotosFallback(
  supabase: SupabaseClient,
  purchaseId: string,
  eventId: string,
  photoIds: string[]
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const { data: photos } = await supabase
    .from("photos")
    .select("id, is_sold, reserved_purchase_id, reserved_at")
    .eq("event_id", eventId)
    .in("id", photoIds);

  if (!photos || photos.length !== photoIds.length) {
    return {
      ok: false,
      code: "PHOTOS_UNAVAILABLE",
      message: "Una o más fotos ya no están disponibles.",
    };
  }

  const staleMs = 20 * 60 * 1000;
  const now = Date.now();

  for (const photo of photos) {
    if (photo.is_sold) {
      return {
        ok: false,
        code: "PHOTOS_UNAVAILABLE",
        message: "Una o más fotos ya fueron vendidas.",
      };
    }

    const reservedAt = photo.reserved_at ? new Date(photo.reserved_at).getTime() : 0;
    const reservationActive =
      photo.reserved_purchase_id &&
      photo.reserved_purchase_id !== purchaseId &&
      reservedAt > now - staleMs;

    if (reservationActive) {
      return {
        ok: false,
        code: "PHOTOS_UNAVAILABLE",
        message: "Otra compra está procesando estas fotos. Intentá en unos minutos.",
      };
    }
  }

  const { data: updated, error } = await supabase
    .from("photos")
    .update({
      reserved_purchase_id: purchaseId,
      reserved_at: new Date().toISOString(),
    })
    .eq("event_id", eventId)
    .in("id", photoIds)
    .eq("is_sold", false)
    .select("id");

  if (error || !updated || updated.length !== photoIds.length) {
    await supabase
      .from("photos")
      .update({ reserved_purchase_id: null, reserved_at: null })
      .eq("reserved_purchase_id", purchaseId);

    return {
      ok: false,
      code: "PHOTOS_UNAVAILABLE",
      message: "Una o más fotos ya no están disponibles. Actualizá la galería e intentá de nuevo.",
    };
  }

  return { ok: true };
}

export async function releasePurchaseReservation(
  supabase: SupabaseClient,
  purchaseId: string
) {
  const { error } = await supabase.rpc("release_purchase_reservation", {
    p_purchase_id: purchaseId,
  });

  if (error) {
    await supabase
      .from("photos")
      .update({ reserved_purchase_id: null, reserved_at: null })
      .eq("reserved_purchase_id", purchaseId)
      .eq("is_sold", false);
  }
}

export async function finalizePurchasePhotos(
  supabase: SupabaseClient,
  purchaseId: string
): Promise<{ ok: true } | { ok: false; code: string }> {
  const { data, error } = await supabase.rpc("finalize_purchase_photos", {
    p_purchase_id: purchaseId,
  });

  if (error) {
    logWarn("checkout-reserve", "RPC finalize_purchase_photos no disponible", {
      message: error.message,
      purchaseId,
    });
    return finalizePhotosFallback(supabase, purchaseId);
  }

  const result = data as ReserveRpcResult;
  if (result?.ok) return { ok: true };
  return { ok: false, code: result?.code ?? "PHOTO_SALE_CONFLICT" };
}

async function finalizePhotosFallback(
  supabase: SupabaseClient,
  purchaseId: string
): Promise<{ ok: true } | { ok: false; code: string }> {
  const { data: items } = await supabase
    .from("purchase_items")
    .select("photo_id")
    .eq("purchase_id", purchaseId);

  const photoIds = (items ?? []).map((i) => i.photo_id).filter(Boolean);
  if (photoIds.length === 0) return { ok: false, code: "NO_ITEMS" };

  const { data: updated, error } = await supabase
    .from("photos")
    .update({
      is_sold: true,
      reserved_purchase_id: null,
      reserved_at: null,
    })
    .in("id", photoIds)
    .eq("is_sold", false)
    .select("id");

  if (error || !updated || updated.length !== photoIds.length) {
    return { ok: false, code: "PHOTO_SALE_CONFLICT" };
  }

  return { ok: true };
}
