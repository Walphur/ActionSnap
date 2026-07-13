import type { SupabaseClient } from "@supabase/supabase-js";

export type PhotographerCheckoutProfile = {
  id: string;
  mp_receiver_id: string | null;
  mp_seller_id: string | null;
  is_active: boolean | null;
  role: string;
  bank_cbu: string | null;
  bank_alias: string | null;
  bank_holder_name: string | null;
  accepts_bank_transfer: boolean | null;
};

function isMissingColumnError(message: string) {
  return (
    /schema cache/i.test(message) ||
    /could not find the .* column/i.test(message) ||
    /column.*does not exist/i.test(message)
  );
}

function normalizeProfile(row: Record<string, unknown>): PhotographerCheckoutProfile {
  return {
    id: String(row.id),
    mp_receiver_id: (row.mp_receiver_id as string | null) ?? null,
    mp_seller_id: (row.mp_seller_id as string | null) ?? null,
    is_active: (row.is_active as boolean | null) ?? null,
    role: String(row.role ?? "photographer"),
    bank_cbu: (row.bank_cbu as string | null) ?? null,
    bank_alias: (row.bank_alias as string | null) ?? null,
    bank_holder_name: (row.bank_holder_name as string | null) ?? null,
    accepts_bank_transfer: (row.accepts_bank_transfer as boolean | null) ?? false,
  };
}

/** Carga perfil del fotografo con fallback si faltan columnas nuevas (transferencia). */
export async function loadPhotographerCheckoutProfile(
  supabase: SupabaseClient,
  photographerId: string
): Promise<PhotographerCheckoutProfile | null> {
  const selects = [
    "id, mp_receiver_id, mp_seller_id, is_active, role, bank_cbu, bank_alias, bank_holder_name, accepts_bank_transfer",
    "id, mp_receiver_id, mp_seller_id, is_active, role",
    "id, mp_receiver_id, mp_seller_id, role",
  ];

  for (const select of selects) {
    const { data, error } = await supabase
      .from("profiles")
      .select(select)
      .eq("id", photographerId)
      .maybeSingle();

    if (!error && data) {
      return normalizeProfile(data as unknown as Record<string, unknown>);
    }

    if (error && !isMissingColumnError(error.message)) {
      return null;
    }
  }

  return null;
}

export function isEventSellerRole(role: string) {
  return role === "photographer" || role === "admin";
}
