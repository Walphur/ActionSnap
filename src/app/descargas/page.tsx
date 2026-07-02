import Link from "next/link";
import { notFound } from "next/navigation";
import { DownloadPanel } from "@/components/DownloadPanel";
import { verifyDownloadToken } from "@/lib/download-token";
import {
  getMercadoPagoPayment,
  isMercadoPagoPaid,
} from "@/lib/mercadopago";
import { markPurchasePaid } from "@/lib/fulfill-purchase";
import { getPurchasePhotos } from "@/lib/purchase-downloads";
import { resolvePurchaseFromStripeSession } from "@/lib/stripe-purchase";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const BLOCKED_STATUSES = new Set(["pending", "failed", "cancelled", "canceled"]);

type Props = {
  searchParams: Promise<{
    session_id?: string;
    purchase_id?: string;
    payment_id?: string;
    collection_id?: string;
    status?: string;
    pending?: string;
    token?: string;
  }>;
};

async function resolvePurchase(
  sessionId?: string,
  purchaseId?: string,
  paymentId?: string,
  accessToken?: string
) {
  const supabase = createServiceClient();

  if (sessionId) {
    return resolvePurchaseFromStripeSession(supabase, sessionId);
  }

  if (purchaseId) {
    if (paymentId) {
      try {
        const payment = await getMercadoPagoPayment(paymentId);
        if (
          isMercadoPagoPaid(payment.status) &&
          payment.external_reference === purchaseId
        ) {
          await markPurchasePaid(supabase, purchaseId, {
            email: payment.payer?.email,
            mpPaymentId: String(payment.id),
          });
        }
      } catch {
        /* webhook puede confirmar después */
      }
    } else {
      const verified = await verifyDownloadToken(accessToken);
      if (verified !== purchaseId) return null;
    }

    const { data } = await supabase
      .from("purchases")
      .select("id, status")
      .eq("id", purchaseId)
      .single();

    if (!data || BLOCKED_STATUSES.has(data.status)) return null;
    if (data.status === "paid") return data.id;
    return null;
  }

  return null;
}

export default async function DownloadsPage({ searchParams }: Props) {
  const params = await searchParams;
  const paymentId = params.payment_id ?? params.collection_id;

  if (!params.session_id && !params.purchase_id) notFound();

  const purchaseId = await resolvePurchase(
    params.session_id,
    params.purchase_id,
    paymentId,
    params.token
  );

  if (!purchaseId) {
    return (
      <div className="card mx-auto max-w-md px-8 py-12 text-center">
        <p className="text-[var(--muted)]">
          {params.pending
            ? "Pago pendiente (efectivo/transferencia). Te avisamos cuando se acredite."
            : "Confirmando tu pago… Recargá en unos segundos."}
        </p>
        {params.purchase_id && (
          <Link
            href={
              params.token
                ? `/descargas?purchase_id=${params.purchase_id}&token=${encodeURIComponent(params.token)}`
                : `/descargas?purchase_id=${params.purchase_id}${paymentId ? `&payment_id=${paymentId}` : ""}`
            }
            className="btn-secondary mt-4 inline-flex"
          >
            Reintentar
          </Link>
        )}
        {params.session_id && (
          <Link
            href={`/descargas?session_id=${params.session_id}${params.token ? `&token=${encodeURIComponent(params.token)}` : ""}`}
            className="btn-secondary mt-4 inline-flex"
          >
            Reintentar
          </Link>
        )}
        <Link href="/mis-compras" className="btn-secondary mt-4 ml-2 inline-flex">
          Mis compras
        </Link>
      </div>
    );
  }

  const supabase = createServiceClient();
  const photos = await getPurchasePhotos(supabase, purchaseId);

  return (
    <div>
      <h1 className="font-display mb-2 text-3xl font-bold">Tus descargas</h1>
      <p className="mb-8 text-[var(--muted)]">
        Archivos en alta resolución, listos para guardar.
      </p>
      <DownloadPanel purchaseId={purchaseId} photos={photos} />
      <Link href="/" className="btn-secondary mt-10 inline-flex">
        Volver al inicio
      </Link>
    </div>
  );
}
