import Link from "next/link";

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  return (
    <div className="mx-auto max-w-lg py-8 text-center">
      <div className="card px-8 py-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-3xl">
          ✓
        </div>
        <h1 className="font-display mb-3 text-3xl font-bold text-[var(--success)]">
          ¡Pago confirmado!
        </h1>
        <p className="mb-8 leading-relaxed text-[var(--muted)]">
          Gracias por tu compra. Tus fotos en alta resolución están listas para descargar,
          sin marca de agua.
        </p>
        {session_id ? (
          <Link
            href={`/descargas?session_id=${session_id}`}
            className="btn-primary w-full sm:w-auto"
          >
            Descargar mis fotos
          </Link>
        ) : (
          <Link href="/" className="btn-secondary">
            Volver al inicio
          </Link>
        )}
      </div>
    </div>
  );
}
