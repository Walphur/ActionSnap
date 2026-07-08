import type { SupabaseClient } from "@supabase/supabase-js";
import { logWarn } from "@/lib/safe-logger";

/** TTL de reserva en checkout (debe coincidir con SQL: 20 minutes). */
export const CHECKOUT_RESERVATION_TTL_MS = 20 * 60 * 1000;

type PurchaseRef = { status: string; created_at: string };

function asPurchaseRef(value: unknown): PurchaseRef | null {
  if (!value) return null;
  if (Array.isArray(value)) return (value[0] as PurchaseRef) ?? null;
  return value as PurchaseRef;
}

type ReserveRpcResult = {
  ok: boolean;
  code?: string;
  reserved?: number;
  expected?: number;
};

type PhotoReservationRow = {
  id: string;
  is_sold: boolean;
  reserved_purchase_id: string | null;
  reserved_at: string | null;
};

export type ReservationConflictDetails = {
  photoId: string;
  isSold: boolean;
  reservedPurchaseId: string | null;
  reservedAt: string | null;
  reservationExpired: boolean;
  blockingPendingPurchaseId: string | null;
  reason: string;
};

function isReservationExpired(reservedAt: string | null, now = Date.now()): boolean {
  if (!reservedAt) return true;
  return new Date(reservedAt).getTime() <= now - CHECKOUT_RESERVATION_TTL_MS;
}

/** Compras pending abandonadas (sin sesión de pago) bloquean re-reservas < 20 min. */
const ABANDONED_CHECKOUT_MS = 2 * 60 * 1000;

async function cancelPendingPurchase(supabase: SupabaseClient, purchaseId: string) {
  await releasePurchaseReservation(supabase, purchaseId);
  await supabase.from("purchase_items").delete().eq("purchase_id", purchaseId);
  await supabase.from("purchases").delete().eq("id", purchaseId);
}

/** Si el mismo comprador reintenta, libera su checkout pending anterior sobre esas fotos. */
async function releaseSameEmailPendingPurchases(
  supabase: SupabaseClient,
  email: string,
  photoIds: string[],
  exceptPurchaseId?: string
) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || photoIds.length === 0) return;

  const toCancel = new Set<string>();

  try {
    const { data: blockingItems } = await supabase
      .from("purchase_items")
      .select("purchase_id, purchases!inner(email, status)")
      .in("photo_id", photoIds)
      .eq("purchases.status", "pending");

    for (const row of blockingItems ?? []) {
      const purchaseId = row.purchase_id as string;
      if (exceptPurchaseId && purchaseId === exceptPurchaseId) continue;

      const purchase = asPurchaseRef(row.purchases) as (PurchaseRef & { email?: string }) | null;
      if (purchase?.email?.trim().toLowerCase() === normalizedEmail) {
        toCancel.add(purchaseId);
      }
    }

    const { data: reservedPhotos } = await supabase
      .from("photos")
      .select("reserved_purchase_id")
      .in("id", photoIds)
      .not("reserved_purchase_id", "is", null);

    const reservedPurchaseIds = [
      ...new Set(
        (reservedPhotos ?? [])
          .map((photo) => photo.reserved_purchase_id as string)
          .filter(Boolean)
      ),
    ];

    if (reservedPurchaseIds.length > 0) {
      const { data: reservedPurchases } = await supabase
        .from("purchases")
        .select("id, email")
        .in("id", reservedPurchaseIds)
        .eq("status", "pending");

      for (const purchase of reservedPurchases ?? []) {
        if (exceptPurchaseId && purchase.id === exceptPurchaseId) continue;
        if (purchase.email?.trim().toLowerCase() === normalizedEmail) {
          toCancel.add(purchase.id);
        }
      }
    }

    for (const purchaseId of toCancel) {
      await cancelPendingPurchase(supabase, purchaseId);
    }
  } catch {
    /* columnas opcionales */
  }
}

async function releaseAbandonedPendingPurchases(
  supabase: SupabaseClient,
  photoIds: string[],
  exceptPurchaseId?: string
) {
  if (photoIds.length === 0) return;

  try {
    const { data: blockingItems, error } = await supabase
      .from("purchase_items")
      .select(
        "purchase_id, purchases!inner(id, status, created_at, mp_preference_id, stripe_session_id)"
      )
      .in("photo_id", photoIds)
      .eq("purchases.status", "pending");

    if (error) return;

    const toCancel = new Set<string>();
    const now = Date.now();

    for (const row of blockingItems ?? []) {
      const purchaseId = row.purchase_id as string;
      if (exceptPurchaseId && purchaseId === exceptPurchaseId) continue;

      const purchase = asPurchaseRef(row.purchases) as
        | (PurchaseRef & { mp_preference_id?: string | null; stripe_session_id?: string | null })
        | null;
      if (!purchase) continue;

      const age = now - new Date(purchase.created_at).getTime();
      const hasPaymentSession = Boolean(purchase.mp_preference_id || purchase.stripe_session_id);

      if (age > CHECKOUT_RESERVATION_TTL_MS) {
        toCancel.add(purchaseId);
      } else if (!hasPaymentSession && age > ABANDONED_CHECKOUT_MS) {
        toCancel.add(purchaseId);
      }
    }

    for (const id of toCancel) {
      await cancelPendingPurchase(supabase, id);
    }
  } catch {
    /* columnas MP opcionales — fallback en releaseStale */
  }
}

/** Libera reservas expiradas y compras pending abandonadas antes de reservar. */
export async function releaseStaleCheckoutReservations(
  supabase: SupabaseClient,
  photoIds: string[],
  exceptPurchaseId?: string,
  email?: string
) {
  if (photoIds.length === 0) return;

  if (email) {
    await releaseSameEmailPendingPurchases(supabase, email, photoIds, exceptPurchaseId);
  }

  await releaseAbandonedPendingPurchases(supabase, photoIds, exceptPurchaseId);

  const { error: rpcError } = await supabase.rpc("release_stale_checkout_reservations", {
    p_photo_ids: photoIds,
  });

  if (!rpcError) return;

  logWarn("checkout-reserve", "RPC release_stale_checkout_reservations no disponible", {
    message: rpcError.message,
  });

  const staleBefore = new Date(Date.now() - CHECKOUT_RESERVATION_TTL_MS).toISOString();

  await supabase
    .from("photos")
    .update({ reserved_purchase_id: null, reserved_at: null })
    .in("id", photoIds)
    .eq("is_sold", false)
    .not("reserved_purchase_id", "is", null)
    .or(`reserved_at.is.null,reserved_at.lt.${staleBefore}`);

  const { data: blockingItems } = await supabase
    .from("purchase_items")
    .select("purchase_id, purchases!inner(status, created_at)")
    .in("photo_id", photoIds)
    .eq("purchases.status", "pending");

  const stalePurchaseIds = [
    ...new Set(
      (blockingItems ?? [])
        .filter((row) => {
          const purchase = asPurchaseRef(row.purchases);
          if (!purchase) return false;
          return (
            Date.now() - new Date(purchase.created_at).getTime() > CHECKOUT_RESERVATION_TTL_MS
          );
        })
        .map((row) => row.purchase_id as string)
    ),
  ];

  for (const id of stalePurchaseIds) {
    await releasePurchaseReservation(supabase, id);
  }

  if (stalePurchaseIds.length > 0) {
    await supabase.from("purchases").delete().in("id", stalePurchaseIds);
  }
}

async function diagnoseReservationConflicts(
  supabase: SupabaseClient,
  photoIds: string[]
): Promise<ReservationConflictDetails[]> {
  const { data: photos } = await supabase
    .from("photos")
    .select("id, is_sold, reserved_purchase_id, reserved_at")
    .in("id", photoIds);

  const rows = (photos ?? []) as PhotoReservationRow[];
  const conflicts: ReservationConflictDetails[] = [];
  const now = Date.now();

  for (const photo of rows) {
    let blockingPendingPurchaseId: string | null = null;
    let reason = "unknown";

    if (photo.is_sold) {
      reason = "photo_already_sold";
    } else if (
      photo.reserved_purchase_id &&
      photo.reserved_purchase_id.length > 0 &&
      !isReservationExpired(photo.reserved_at, now)
    ) {
      reason = "active_reservation";
    } else {
      const { data: pendingItem } = await supabase
        .from("purchase_items")
        .select("purchase_id, purchases!inner(status, created_at)")
        .eq("photo_id", photo.id)
        .eq("purchases.status", "pending")
        .maybeSingle();

      if (pendingItem) {
        const purchase = asPurchaseRef(pendingItem.purchases);
        if (purchase) {
          const age = now - new Date(purchase.created_at).getTime();
          if (age <= CHECKOUT_RESERVATION_TTL_MS) {
            blockingPendingPurchaseId = pendingItem.purchase_id as string;
            reason = "pending_purchase_items";
          } else {
            reason = "stale_pending_purchase";
          }
        }
      } else {
        reason = "reserve_update_missed";
      }
    }

    conflicts.push({
      photoId: photo.id,
      isSold: photo.is_sold,
      reservedPurchaseId: photo.reserved_purchase_id,
      reservedAt: photo.reserved_at,
      reservationExpired: isReservationExpired(photo.reserved_at, now),
      blockingPendingPurchaseId,
      reason,
    });
  }

  return conflicts;
}

async function attemptReserve(
  supabase: SupabaseClient,
  purchaseId: string,
  eventId: string,
  photoIds: string[]
): Promise<{ ok: true } | { ok: false; code: string; message: string; conflicts?: ReservationConflictDetails[] }> {
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

  const conflicts = await diagnoseReservationConflicts(supabase, photoIds);
  return {
    ok: false,
    code: result?.code ?? "PHOTOS_UNAVAILABLE",
    message:
      result?.code === "PHOTOS_UNAVAILABLE"
        ? "Una o más fotos ya no están disponibles. Actualizá la galería e intentá de nuevo."
        : "No se pudieron reservar las fotos para la compra.",
    conflicts,
  };
}

export async function reservePhotosForCheckout(
  supabase: SupabaseClient,
  purchaseId: string,
  eventId: string,
  photoIds: string[],
  email?: string
): Promise<
  | { ok: true }
  | { ok: false; code: string; message: string; conflicts?: ReservationConflictDetails[] }
> {
  await releaseStaleCheckoutReservations(supabase, photoIds, purchaseId, email);

  let result = await attemptReserve(supabase, purchaseId, eventId, photoIds);
  if (result.ok) return result;

  if (result.code === "PHOTOS_UNAVAILABLE") {
    await releaseStaleCheckoutReservations(supabase, photoIds, purchaseId, email);
    result = await attemptReserve(supabase, purchaseId, eventId, photoIds);
  }

  return result;
}

async function reservePhotosFallback(
  supabase: SupabaseClient,
  purchaseId: string,
  eventId: string,
  photoIds: string[]
): Promise<
  | { ok: true }
  | { ok: false; code: string; message: string; conflicts?: ReservationConflictDetails[] }
> {
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

  const now = Date.now();

  for (const photo of photos) {
    if (photo.is_sold) {
      return {
        ok: false,
        code: "PHOTOS_UNAVAILABLE",
        message: "Una o más fotos ya fueron vendidas.",
        conflicts: await diagnoseReservationConflicts(supabase, photoIds),
      };
    }

    const reservationActive =
      photo.reserved_purchase_id &&
      photo.reserved_purchase_id !== purchaseId &&
      !isReservationExpired(photo.reserved_at, now);

    if (reservationActive) {
      return {
        ok: false,
        code: "PHOTOS_UNAVAILABLE",
        message: "Otra compra está procesando estas fotos. Intentá en unos minutos.",
        conflicts: await diagnoseReservationConflicts(supabase, photoIds),
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
      conflicts: await diagnoseReservationConflicts(supabase, photoIds),
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
