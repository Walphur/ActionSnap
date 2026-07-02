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
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
    const { getStripe } = await import("@/lib/stripe");
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return null;

    const { data } = await supabase
      .from("purchases")
      .select("id, status")
      .eq("stripe_session_id", sessionId)
      .single();

    if (data?.status !== "paid") {
      const pid = session.metadata?.purchase_id;
      if (pid) {
        await markPurchasePaid(supabase, pid, {
          email: session.customer_details?.email ?? session.customer_email ?? undefined,
          stripePaymentIntent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? undefined,
        });
        return pid;
      }
    }
    return data?.id ?? null;
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
    } else if (!sessionId) {
      const verified = await verifyDownloadToken(accessToken);
      if (verified !== purchaseId) return null;
    }

    const { data } = await supabase
      .from("purchases")
      .select("id, status")
      .eq("id", purchaseId)
      .single();

    if (data?.status === "paid") return data.id;
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
