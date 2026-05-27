"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { TurnstileWidget, turnstileEnabled } from "@/components/TurnstileWidget";
import { PLATFORM } from "@/lib/platform";

export default function PhotographerRegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const needsCaptcha = turnstileEnabled();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (needsCaptcha && !turnstileToken) {
      setError("Completá la verificación anti-robot.");
      setLoading(false);
      return;
    }

    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "photographer",
        },
      },
    });

    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    // Dependiendo de la config del proyecto, puede requerir confirmación por email.
    setSuccess("Cuenta creada. Revisá tu email si tenés que confirmar.");
    router.refresh();
  }

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle={`Publicá eventos y cobrá el ${PLATFORM.photographerSharePercent}% de cada venta`}
    >
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Nombre</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

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
          {success && <p className="text-sm text-green-300">{success}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creando…" : "Crear cuenta"}
          </button>
        </form>

        <div className="mt-4 space-y-2 text-center text-xs text-[var(--muted)]">
          <p>
            ¿Ya tenés cuenta?{" "}
            <Link
              href="/fotografos/login"
              className="text-[var(--accent)] hover:underline"
            >
              Ingresar
            </Link>
          </p>
        </div>
    </AuthShell>
  );
}

