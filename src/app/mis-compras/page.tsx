"use client";

import Link from "next/link";
import { useState } from "react";
import { TurnstileWidget, turnstileEnabled } from "@/components/TurnstileWidget";
import { formatDate, formatPrice } from "@/lib/format";

type PurchaseRow = {
  id: string;
  createdAt: string;
  photoCount: number;
  amountCents: number;
  downloadUrl: string;
  zipUrl: string;
};

export default function MisComprasPage() {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const needsCaptcha = turnstileEnabled();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (needsCaptcha && !turnstileToken) {
      setError("Completá la verificación anti-robot.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/mis-compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          turnstileToken: turnstileToken ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudieron buscar tus compras.");
        setPurchases([]);
        return;
      }
      setPurchases(data.purchases ?? []);
      if ((data.purchases ?? []).length === 0) {
        setError("No encontramos compras pagadas con ese email.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display mb-2 text-3xl font-bold">Mis compras</h1>
      <p className="mb-8 text-[var(--muted)]">
        Ingresá el email que usaste al pagar. Te mostramos tus descargas en HD.
      </p>

      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email de la compra
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3"
          />
        </div>

        <TurnstileWidget onToken={setTurnstileToken} className="flex justify-center" />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !email.includes("@")}
          className="btn-primary w-full"
        >
          {loading ? "Buscando…" : "Buscar mis fotos"}
        </button>
      </form>

      {purchases.length > 0 && (
        <ul className="mt-8 space-y-4">
          {purchases.map((p) => (
            <li key={p.id} className="card p-5">
              <p className="font-display font-bold">{formatDate(p.createdAt)}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {p.photoCount} foto{p.photoCount !== 1 ? "s" : ""} ·{" "}
                {formatPrice(p.amountCents)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={p.downloadUrl} className="btn-primary !py-2 !text-sm">
                  Ver descargas
                </Link>
                {p.photoCount > 1 && (
                  <a href={p.zipUrl} className="btn-secondary !py-2 !text-sm">
                    ZIP
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link href="/" className="btn-secondary mt-10 inline-flex">
        Volver al inicio
      </Link>
    </div>
  );
}
