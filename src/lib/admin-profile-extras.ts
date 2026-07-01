import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileMpExtras = {
  mpConnected: boolean;
  isActive: boolean;
};

/** Lee columnas MP/is_active; si no existen en BD devuelve defaults sin romper. */
export async function fetchProfileMpExtras(
  supabase: SupabaseClient,
  profileIds: string[]
): Promise<Map<string, ProfileMpExtras>> {
  const result = new Map<string, ProfileMpExtras>();
  if (profileIds.length === 0) return result;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, mp_seller_id, mp_receiver_id, is_active")
    .in("id", profileIds);

  if (error || !data) {
    for (const id of profileIds) {
      result.set(id, { mpConnected: false, isActive: true });
    }
    return result;
  }

  for (const row of data) {
    result.set(row.id, {
      mpConnected: Boolean(row.mp_seller_id ?? row.mp_receiver_id),
      isActive: row.is_active !== false,
    });
  }

  for (const id of profileIds) {
    if (!result.has(id)) {
      result.set(id, { mpConnected: false, isActive: true });
    }
  }

  return result;
}

export async function sumPlatformFees(
  supabase: SupabaseClient,
  fallbackFromSalesCents: number,
  commissionPercent: number
): Promise<number> {
  const { data, error } = await supabase
    .from("purchases")
    .select("platform_fee_cents")
    .eq("status", "paid");

  if (error || !data) {
    return Math.round(fallbackFromSalesCents * (commissionPercent / 100));
  }

  const total = data.reduce((sum, row) => sum + (row.platform_fee_cents ?? 0), 0);
  if (total > 0) return total;

  return Math.round(fallbackFromSalesCents * (commissionPercent / 100));
}
