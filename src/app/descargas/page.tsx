import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DownloadPanel } from "@/components/DownloadPanel";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody } from "@/components/ui/Card";
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
      <Card className="mx-auto max-w-md text-center">
        <CardBody>
          <p className="ds-body text-[var(--color-text-secondary)]">
            {params.pending
              ? "Pago pendiente (efectivo/transferencia). Te avisamos cuando se acredite."
              : "Confirmando tu pago… Recargá en unos segundos."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {params.purchase_id && (
              <ButtonLink
                href={
                  params.token
                    ? `/descargas?purchase_id=${params.purchase_id}&token=${encodeURIComponent(params.token)}`
                    : `/descargas?purchase_id=${params.purchase_id}${paymentId ? `&payment_id=${paymentId}` : ""}`
                }
                variant="secondary"
              >
                Reintentar
              </ButtonLink>
            )}
            {params.session_id && (
              <ButtonLink
                href={`/descargas?session_id=${params.session_id}${params.token ? `&token=${encodeURIComponent(params.token)}` : ""}`}
                variant="secondary"
              >
                Reintentar
              </ButtonLink>
            )}
            <ButtonLink href="/mis-compras" variant="ghost">
              Mis compras
            </ButtonLink>
          </div>
        </CardBody>
      </Card>
    );
  }

  const supabase = createServiceClient();
  const photos = await getPurchasePhotos(supabase, purchaseId);

  return (
    <div className="buyer-downloads">
      <h1 className="ds-h2">Tus descargas</h1>
      <p className="ds-body-lg mt-2 text-[var(--color-text-secondary)]">
        Archivos en alta resolución, listos para guardar.
      </p>
      <DownloadPanel purchaseId={purchaseId} photos={photos} />
      <ButtonLink href="/explorar" variant="secondary" className="mt-10">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a explorar eventos
      </ButtonLink>
    </div>
  );
}
