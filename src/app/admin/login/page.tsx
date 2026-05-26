"use client";

import { BrandLogo } from "@/components/BrandLogo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Error");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-8 flex justify-center">
        <BrandLogo size="lg" href="/" />
      </div>
      <div className="card p-6">
        <h1 className="font-display mb-2 text-center text-xl font-bold">Panel fotógrafo</h1>
        <p className="mb-6 text-center text-sm text-[var(--muted)]">
          Ingresá la contraseña de administración
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            autoFocus
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          <Link href="/" className="text-[var(--accent)] hover:underline">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="card p-8 text-center">Cargando…</div>}>
      <LoginForm />
    </Suspense>
  );
}
