"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="card mx-auto max-w-lg px-8 py-12 text-center">
      <h1 className="font-display mb-3 text-2xl font-bold">Algo falló</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Suele arreglarse reiniciando el servidor. En la terminal:{" "}
        <code className="text-[var(--text)]">npm run dev:clean</code>
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Reintentar
        </button>
        <Link href="/" className="btn-secondary">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
