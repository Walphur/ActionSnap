"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/BrandLogo";
import { TurnstileWidget, turnstileEnabled } from "@/components/TurnstileWidget";

export default function PhotographerLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/fotografos";

  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsCaptcha = turnstileEnabled();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Para MVP: usamos Turnstile solo como UX. Si no lo querés, podés borrar el check.
    if (needsCaptcha && !turnstileToken) {
      setError("Completá la verificación anti-robot.");
      setLoading(false);
      return;
    }

    const res = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (res.error) {
      setError(res.error.message);
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
        <h1 className="font-display mb-2 text-center text-xl font-bold">Ingresar</h1>
        <p className="mb-6 text-center text-sm text-[var(--muted)]">Panel de fotógrafo</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="block text-sm">
            <span className="text-[var(--muted)]">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          {needsCaptcha && (
            <TurnstileWidget onToken={setTurnstileToken} className="flex justify-center" />
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="mt-4 space-y-2 text-center text-xs text-[var(--muted)]">
          <p>
            ¿No tenés cuenta?{" "}
            <Link href="/fotografos/registro" className="text-[var(--accent)] hover:underline">
              Registrate
            </Link>
          </p>
          <p>
            <Link href="/" className="text-[var(--accent)] hover:underline">
              ← Volver al sitio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

