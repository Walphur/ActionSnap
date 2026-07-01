"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { TurnstileWidget, turnstileEnabled } from "@/components/TurnstileWidget";

export default function PhotographerLoginPage() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/fotografos";
  const urlError = params.get("error");

  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urlError === "suspended") {
      setError("Tu cuenta está suspendida. Contactá a Action Snap.");
    } else if (urlError === "not-photographer") {
      setError("Esta cuenta no es de fotógrafo.");
    } else if (urlError === "no-profile") {
      setError("No pudimos crear tu perfil. Contactá soporte o ejecutá fix-missing-profiles.sql en Supabase.");
    }
  }, [urlError]);

  const needsCaptcha = turnstileEnabled();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    if (needsCaptcha && !turnstileToken) {
      setError("Completá la verificación anti-robot.");
      setLoading(false);
      return;
    }

    try {
      const res = await supabase.auth.signInWithPassword({ email, password });

      if (res.error) {
        setError(res.error.message);
        return;
      }

      const userId = res.data.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, is_active")
          .eq("id", userId)
          .maybeSingle();

        if (profile?.is_active === false) {
          await supabase.auth.signOut();
          setError("Tu cuenta está suspendida. Contactá a Action Snap.");
          return;
        }

        if (profile && profile.role !== "photographer") {
          await supabase.auth.signOut();
          setError("Esta cuenta no es de fotógrafo.");
          return;
        }
      }

      window.location.assign(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Ingresar" subtitle="Panel de fotógrafo en Action Snap">
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

        <SocialAuthButtons next={next} mode="login" />

        <div className="mt-4 space-y-2 text-center text-xs text-[var(--muted)]">
          <p>
            ¿No tenés cuenta?{" "}
            <Link href="/fotografos/registro" className="text-[var(--accent)] hover:underline">
              Registrate
            </Link>
          </p>
          <p>
            <Link href="/para-fotografos" className="text-[var(--accent)] hover:underline">
              Cómo funciona para fotógrafos
            </Link>
          </p>
        </div>
    </AuthShell>
  );
}

