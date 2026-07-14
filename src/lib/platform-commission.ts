import type { SupabaseClient } from "@supabase/supabase-js";
import { PLATFORM } from "@/lib/platform";

export function platformFeeCentsFromAmount(amountCents: number): number {
  if (amountCents <= 0) return 0;
  return Math.round(amountCents * (PLATFORM.commissionPercent / 100));
}

export function sellerAmountCentsFromGross(amountCents: number, platformFeeCents: number): number {
  return Math.max(0, amountCents - platformFeeCents);
}

/** Asegura comisión Action Snap y marca deuda pendiente (transferencia). */
export async function ensureBankTransferCommission(
  supabase: SupabaseClient,
  purchase: {
    id: string;
    amount_cents: number | null;
    platform_fee_cents?: number | null;
    seller_amount_cents?: number | null;
  }
): Promise<{ platformFeeCents: number; sellerAmountCents: number }> {
  const amount = purchase.amount_cents ?? 0;
  const platformFeeCents =
    typeof purchase.platform_fee_cents === "number" && purchase.platform_fee_cents > 0
      ? purchase.platform_fee_cents
      : platformFeeCentsFromAmount(amount);
  const sellerAmountCents = sellerAmountCentsFromGross(amount, platformFeeCents);

  const updates: Record<string, unknown> = {
    platform_fee_cents: platformFeeCents,
    seller_amount_cents: sellerAmountCents,
    platform_fee_settled: false,
  };

  const { error } = await supabase.from("purchases").update(updates).eq("id", purchase.id);

  // Si falta la columna settled, igual guardamos los fees.
  if (error && /platform_fee_settled|schema cache|does not exist/i.test(error.message)) {
    await supabase
      .from("purchases")
      .update({
        platform_fee_cents: platformFeeCents,
        seller_amount_cents: sellerAmountCents,
      })
      .eq("id", purchase.id);
  }

  return { platformFeeCents, sellerAmountCents };
}

export async function sumCommissionOwedCents(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from("purchases")
    .select("platform_fee_cents, amount_cents, payment_provider, platform_fee_settled")
    .eq("status", "paid")
    .eq("payment_provider", "bank_transfer");

  if (error || !data) {
    // Fallback sin columna settled: asumimos que toda transferencia pagada es deuda
    const { data: fallback } = await supabase
      .from("purchases")
      .select("platform_fee_cents, amount_cents")
      .eq("status", "paid")
      .eq("payment_provider", "bank_transfer");

    return (fallback ?? []).reduce((sum, row) => {
      const fee =
        row.platform_fee_cents && row.platform_fee_cents > 0
          ? row.platform_fee_cents
          : platformFeeCentsFromAmount(row.amount_cents ?? 0);
      return sum + fee;
    }, 0);
  }

  return data.reduce((sum, row) => {
    if (row.platform_fee_settled === true) return sum;
    const fee =
      row.platform_fee_cents && row.platform_fee_cents > 0
        ? row.platform_fee_cents
        : platformFeeCentsFromAmount(row.amount_cents ?? 0);
    return sum + fee;
  }, 0);
}

export async function sumCommissionOwedByPhotographer(
  supabase: SupabaseClient,
  photographerIds: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  for (const id of photographerIds) map.set(id, 0);
  if (photographerIds.length === 0) return map;

  const { data, error } = await supabase
    .from("purchases")
    .select(
      "photographer_id, platform_fee_cents, amount_cents, payment_provider, platform_fee_settled"
    )
    .eq("status", "paid")
    .eq("payment_provider", "bank_transfer")
    .in("photographer_id", photographerIds);

  const rows =
    error || !data
      ? (
          await supabase
            .from("purchases")
            .select("photographer_id, platform_fee_cents, amount_cents")
            .eq("status", "paid")
            .eq("payment_provider", "bank_transfer")
            .in("photographer_id", photographerIds)
        ).data ?? []
      : data;

  for (const row of rows) {
    const pid = row.photographer_id as string | null;
    if (!pid) continue;
    if ("platform_fee_settled" in row && row.platform_fee_settled === true) continue;
    const fee =
      row.platform_fee_cents && row.platform_fee_cents > 0
        ? row.platform_fee_cents
        : platformFeeCentsFromAmount(row.amount_cents ?? 0);
    map.set(pid, (map.get(pid) ?? 0) + fee);
  }

  return map;
}
