"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

type Props = {
  onAuthenticated?: () => void;
  urlError?: string | null;
};

export function RacerAuthForm({ onAuthenticated, urlError }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialError =
    urlError === "not-racer"
      ? "Esta cuenta es de fotógrafo o admin. Usá el email con el que compraste tus fotos."
      : urlError === "oauth"
        ? "No se pudo completar el inicio con Google."
        : urlError
          ? decodeURIComponent(urlError)
          : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/mis-compras")}&intent=racer`;

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
        data: { role: "racer" },
      },
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setSent(true);
    onAuthenticated?.();
  }

  if (sent) {
    return (
      <div className="card px-6 py-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-muted)] text-2xl">
          ✉️
        </div>
        <h2 className="font-display text-xl font-bold">Revisá tu email</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Te enviamos un link mágico a{" "}
          <span className="font-medium text-white">{email.trim()}</span>. Abrilo en este
          dispositivo para ver tus fotos en HD.
        </p>
        <button
          type="button"
          className="btn-secondary mt-6 !text-sm"
          onClick={() => {
            setSent(false);
            setEmail("");
          }}
        >
          Usar otro email
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="racer-email" className="mb-2 block text-sm font-medium">
            Email de tus compras
          </label>
          <input
            id="racer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            autoComplete="email"
            className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
          <p className="mt-2 text-xs text-[var(--muted)]">
            Sin contraseña: te mandamos un link seguro para entrar al instante.
          </p>
        </div>

        {(error || initialError) && (
          <p className="text-sm text-red-400">{error ?? initialError}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email.includes("@")}
          className="btn-primary w-full"
        >
          {loading ? "Enviando link…" : "Enviar link mágico"}
        </button>
      </form>

      <SocialAuthButtons next="/mis-compras" mode="login" intent="racer" />
    </div>
  );
}
