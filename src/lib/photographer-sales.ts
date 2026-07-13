import type { SupabaseClient } from "@supabase/supabase-js";
import { PLATFORM } from "@/lib/platform";

export type PaidPurchaseRow = {
  id: string;
  email: string | null;
  amount_cents: number | null;
  seller_amount_cents: number | null;
  platform_fee_cents: number | null;
  photographer_id: string | null;
  created_at: string;
};

const PURCHASE_SELECT =
  "id, email, amount_cents, seller_amount_cents, platform_fee_cents, photographer_id, created_at";

/** Lo que le corresponde al fotografo despues de la comision de Action Snap (antes de fees MP). */
export function resolveSellerAmountCents(purchase: {
  seller_amount_cents?: number | null;
  amount_cents?: number | null;
  platform_fee_cents?: number | null;
}) {
  if (typeof purchase.seller_amount_cents === "number" && purchase.seller_amount_cents > 0) {
    return purchase.seller_amount_cents;
  }

  const amount = purchase.amount_cents ?? 0;
  if (amount <= 0) return 0;

  if (typeof purchase.platform_fee_cents === "number" && purchase.platform_fee_cents > 0) {
    return Math.max(0, amount - purchase.platform_fee_cents);
  }

  const platformFee = Math.round(amount * (PLATFORM.commissionPercent / 100));
  return Math.max(0, amount - platformFee);
}

async function fetchPurchaseIdsForEventPhotos(
  supabase: SupabaseClient,
  photoIds: string[]
): Promise<string[]> {
  if (photoIds.length === 0) return [];

  const { data: items } = await supabase
    .from("purchase_items")
    .select("purchase_id")
    .in("photo_id", photoIds);

  return [...new Set((items ?? []).map((row) => row.purchase_id as string))];
}

async function fetchPaidPurchasesByIds(
  supabase: SupabaseClient,
  purchaseIds: string[]
): Promise<PaidPurchaseRow[]> {
  if (purchaseIds.length === 0) return [];

  const { data } = await supabase
    .from("purchases")
    .select(PURCHASE_SELECT)
    .eq("status", "paid")
    .in("id", purchaseIds)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function fetchPaidPurchasesForPhotographer(
  supabase: SupabaseClient,
  photographerId: string
): Promise<PaidPurchaseRow[]> {
  const { data: direct } = await supabase
    .from("purchases")
    .select(PURCHASE_SELECT)
    .eq("photographer_id", photographerId)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  const merged = new Map<string, PaidPurchaseRow>();
  for (const row of direct ?? []) {
    merged.set(row.id, row);
  }

  const { data: events } = await supabase
    .from("events")
    .select("id")
    .eq("photographer_id", photographerId);

  const eventIds = (events ?? []).map((event) => event.id);
  if (eventIds.length === 0) {
    return [...merged.values()];
  }

  const { data: photos } = await supabase.from("photos").select("id").in("event_id", eventIds);
  const photoIds = (photos ?? []).map((photo) => photo.id);
  const purchaseIds = await fetchPurchaseIdsForEventPhotos(supabase, photoIds);
  const legacy = await fetchPaidPurchasesByIds(
    supabase,
    purchaseIds.filter((id) => !merged.has(id))
  );

  for (const row of legacy) {
    merged.set(row.id, row);
  }

  return [...merged.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function fetchPaidPurchasesForEvent(
  supabase: SupabaseClient,
  eventId: string
): Promise<PaidPurchaseRow[]> {
  const { data: photos } = await supabase.from("photos").select("id").eq("event_id", eventId);
  const photoIds = (photos ?? []).map((photo) => photo.id);
  const purchaseIds = await fetchPurchaseIdsForEventPhotos(supabase, photoIds);
  return fetchPaidPurchasesByIds(supabase, purchaseIds);
}

export type PhotographerSalesSummary = {
  salesCount: number;
  grossCents: number;
  sellerCents: number;
  platformCents: number;
};

export function summarizePurchases(purchases: PaidPurchaseRow[]): PhotographerSalesSummary {
  let grossCents = 0;
  let sellerCents = 0;
  let platformCents = 0;

  for (const purchase of purchases) {
    const gross = purchase.amount_cents ?? 0;
    const seller = resolveSellerAmountCents(purchase);
    grossCents += gross;
    sellerCents += seller;
    platformCents += Math.max(0, gross - seller);
  }

  return {
    salesCount: purchases.length,
    grossCents,
    sellerCents,
    platformCents,
  };
}

export async function fetchSalesSummariesByPhotographer(
  supabase: SupabaseClient,
  photographerIds: string[]
): Promise<Map<string, PhotographerSalesSummary>> {
  const summaries = new Map<string, PhotographerSalesSummary>();
  for (const id of photographerIds) {
    summaries.set(id, { salesCount: 0, grossCents: 0, sellerCents: 0, platformCents: 0 });
  }

  await Promise.all(
    photographerIds.map(async (photographerId) => {
      const purchases = await fetchPaidPurchasesForPhotographer(supabase, photographerId);
      summaries.set(photographerId, summarizePurchases(purchases));
    })
  );

  return summaries;
}
