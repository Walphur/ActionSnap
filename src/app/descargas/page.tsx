import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMercadoPagoPayment,
  isMercadoPagoPaid,
} from "@/lib/mercadopago";
import { markPurchasePaid } from "@/lib/fulfill-purchase";
import { createServiceClient } from "@/lib/supabase/server";
import { signedDownloadUrl } from "@/lib/cloudinary";
import { hasCloudinary } from "@/lib/storage";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    session_id?: string;
    purchase_id?: string;
    payment_id?: string;
    collection_id?: string;
    status?: string;
    pending?: string;
  }>;
};

async function resolvePurchase(
  sessionId?: string,
  purchaseId?: string,
  paymentId?: string
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

  if (purchaseId && paymentId) {
    try {
      const payment = await getMercadoPagoPayment(paymentId);
      if (isMercadoPagoPaid(payment.status)) {
        await markPurchasePaid(supabase, purchaseId, {
          email: payment.payer?.email,
          mpPaymentId: String(payment.id),
        });
      }
    } catch {
      /* webhook puede confirmar después */
    }
  }

  if (purchaseId) {
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
    paymentId
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
            href={`/descargas?purchase_id=${params.purchase_id}`}
            className="btn-secondary mt-4 inline-flex"
          >
            Reintentar
          </Link>
        )}
      </div>
    );
  }

  const supabase = createServiceClient();
  const { data: items } = await supabase
    .from("purchase_items")
    .select("photo_id, photos(cloudinary_public_id, preview_url, original_url)")
    .eq("purchase_id", purchaseId);

  return (
    <div>
      <h1 className="font-display mb-2 text-3xl font-bold">Tus descargas</h1>
      <p className="mb-8 text-[var(--muted)]">
        Archivos en alta resolución, listos para guardar.
      </p>
      <ul className="space-y-4">
        {(items ?? []).map((item) => {
          const raw = item.photos;
          const photo = (Array.isArray(raw) ? raw[0] : raw) as {
            cloudinary_public_id: string;
            preview_url: string;
            original_url: string;
          } | null;
          if (!photo?.original_url) return null;
          const url = hasCloudinary()
            ? signedDownloadUrl(photo.cloudinary_public_id)
            : photo.original_url;
          return (
            <li
              key={item.photo_id}
              className="card flex items-center justify-between gap-4 p-4"
            >
              <img
                src={photo.preview_url}
                alt=""
                className="h-20 w-28 rounded-lg object-cover"
              />
              <a href={url} download className="btn-primary shrink-0 !py-2.5 !text-sm">
                Descargar HD
              </a>
            </li>
          );
        })}
      </ul>
      <Link href="/" className="btn-secondary mt-10 inline-flex">
        Volver al inicio
      </Link>
    </div>
  );
}
