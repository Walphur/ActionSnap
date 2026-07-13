import { NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";
import { formatPrice } from "@/lib/format";
import { shortTransferReference } from "@/lib/payment-methods";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const purchaseId = url.searchParams.get("purchase_id")?.trim();
  const token = url.searchParams.get("token")?.trim();

  if (!purchaseId || !token) {
    return NextResponse.json({ error: "Faltan parametros" }, { status: 400 });
  }

  const tokenPurchaseId = await verifyDownloadToken(token);
  if (tokenPurchaseId !== purchaseId) {
    return NextResponse.json({ error: "Token invalido" }, { status: 403 });
  }

  const supabase = createServiceClient();
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, status, amount_cents, email, payment_provider, transfer_reference, photographer_id")
    .eq("id", purchaseId)
    .maybeSingle();

  if (!purchase || purchase.payment_provider !== "bank_transfer") {
    return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("bank_cbu, bank_alias, bank_holder_name, full_name")
    .eq("id", purchase.photographer_id)
    .maybeSingle();

  const cbu = profile?.bank_cbu?.trim() || null;
  const alias = profile?.bank_alias?.trim() || null;
  const holder =
    profile?.bank_holder_name?.trim() || profile?.full_name?.trim() || "Titular";

  if (!cbu && !alias) {
    return NextResponse.json({ error: "Datos bancarios no disponibles" }, { status: 422 });
  }

  const reference =
    purchase.transfer_reference?.trim() || shortTransferReference(purchase.id);

  return NextResponse.json({
    purchaseId: purchase.id,
    status: purchase.status,
    amountCents: purchase.amount_cents,
    amountLabel: formatPrice(purchase.amount_cents ?? 0),
    email: purchase.email,
    reference,
    bank: { cbu, alias, holder },
  });
}
