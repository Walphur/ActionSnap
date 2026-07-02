import type { SupabaseClient } from "@supabase/supabase-js";

export type CheckoutPricingInput = {
  eventId: string;
  eventPriceCents: number;
  packDiscountPercent: number;
  photoIds: string[];
  photos: { id: string; price_cents: number | null; is_sold: boolean }[];
};

export type CheckoutPricingResult = {
  amountCents: number;
  unitAmountCents: number;
  appliedPackDiscountPercent: number;
  linePricesCents: number[];
};

/** Descuento pack: solo si hay 2+ fotos, mismo dorsal, y están todas las del dorsal. */
export async function resolvePackDiscountPercent(
  supabase: SupabaseClient,
  eventId: string,
  photoIds: string[],
  configuredPercent: number
): Promise<number> {
  if (photoIds.length <= 1 || configuredPercent <= 0) return 0;

  const { data: tagged } = await supabase
    .from("photo_numbers")
    .select("photo_id, number")
    .in("photo_id", photoIds);

  const numbersByPhoto = new Map<string, string[]>();
  for (const row of tagged ?? []) {
    const list = numbersByPhoto.get(row.photo_id) ?? [];
    list.push(row.number);
    numbersByPhoto.set(row.photo_id, list);
  }

  const sharedNumbers = photoIds.map((id) => numbersByPhoto.get(id) ?? []);
  const first = sharedNumbers[0]?.[0];
  if (!first) return 0;

  const allShareDorsal = sharedNumbers.every((nums) => nums.includes(first));
  if (!allShareDorsal) return 0;

  const { data: availablePhotos } = await supabase
    .from("photos")
    .select("id")
    .eq("event_id", eventId)
    .eq("is_sold", false);

  const availableIds = (availablePhotos ?? []).map((p) => p.id);
  if (availableIds.length === 0) return 0;

  const { data: packTagged } = await supabase
    .from("photo_numbers")
    .select("photo_id")
    .eq("number", first)
    .in("photo_id", availableIds);

  const packPhotoIds = [...new Set((packTagged ?? []).map((r) => r.photo_id))].sort();
  const selectedSorted = [...photoIds].sort();

  if (packPhotoIds.length !== selectedSorted.length) return 0;
  for (let i = 0; i < packPhotoIds.length; i++) {
    if (packPhotoIds[i] !== selectedSorted[i]) return 0;
  }

  return Math.min(80, Math.max(0, configuredPercent));
}

export function calculateCheckoutPricing(input: CheckoutPricingInput): CheckoutPricingResult {
  const linePricesCents = input.photos.map((photo) => {
    const base = photo.price_cents ?? input.eventPriceCents;
    if (input.packDiscountPercent <= 0) return base;
    return Math.round(base * (1 - input.packDiscountPercent / 100));
  });

  const amountCents = linePricesCents.reduce((sum, cents) => sum + cents, 0);
  const unitAmountCents = Math.max(1, Math.round(amountCents / input.photoIds.length));

  return {
    amountCents,
    unitAmountCents,
    appliedPackDiscountPercent: input.packDiscountPercent,
    linePricesCents,
  };
}
