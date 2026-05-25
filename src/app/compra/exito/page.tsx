import Link from "next/link";

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="mb-3 text-2xl font-bold text-green-400">¡Pago confirmado!</h1>
      <p className="mb-6 text-[var(--muted)]">
        Recibimos tu pago. Usá el enlace de descarga que te enviamos o entrá acá
        con tu sesión de compra.
      </p>
      {session_id && (
        <Link
          href={`/descargas?session_id=${session_id}`}
          className="inline-block rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-black"
        >
          Descargar mis fotos
        </Link>
      )}
    </div>
  );
}
