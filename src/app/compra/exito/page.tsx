import Link from "next/link";

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

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const paymentId = params.payment_id ?? params.collection_id;

  let downloadHref: string | null = null;
  if (params.session_id) {
    downloadHref = `/descargas?session_id=${params.session_id}`;
  } else if (params.purchase_id) {
    const q = new URLSearchParams({ purchase_id: params.purchase_id });
    if (paymentId) q.set("payment_id", paymentId);
    downloadHref = `/descargas?${q.toString()}`;
  }

  const isPending = Boolean(params.pending);

  return (
    <div className="mx-auto max-w-lg py-8 text-center">
      <div className="card px-8 py-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-3xl">
          {isPending ? "⏳" : "✓"}
        </div>
        <h1 className="font-display mb-3 text-3xl font-bold text-[var(--success)]">
          {isPending ? "Pago pendiente" : "¡Pago confirmado!"}
        </h1>
        <p className="mb-8 leading-relaxed text-[var(--muted)]">
          {isPending
            ? "Mercado Pago está procesando tu pago. Cuando se acredite, podés descargar tus fotos."
            : "Gracias por tu compra. Tus fotos en HD están listas para descargar."}
        </p>
        {downloadHref ? (
          <>
            <Link href={downloadHref} className="btn-primary w-full sm:w-auto">
              Descargar mis fotos
            </Link>
            <Link href="/mis-compras" className="btn-secondary mt-3 inline-flex w-full sm:w-auto">
              Guardar en Mis compras
            </Link>
          </>
        ) : (
          <Link href="/" className="btn-secondary">
            Volver al inicio
          </Link>
        )}
      </div>
    </div>
  );
}
