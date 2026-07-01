"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/BrandLogo";
import { PLATFORM } from "@/lib/platform";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setLoading(false);
      setError("No se pudo validar la sesión.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Esta cuenta no tiene permisos de administrador.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <div className="mb-8 flex justify-center">
        <BrandLogo size="lg" href="/" />
      </div>
      <div className="card p-6">
        <h1 className="font-display mb-2 text-center text-xl font-bold uppercase">
          Admin {PLATFORM.name}
        </h1>
        <p className="mb-6 text-center text-sm text-[var(--muted)]">
          Acceso restringido a la plataforma
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="field-input mt-1"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="field-input mt-1"
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Ingresando…" : "Entrar al panel"}
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
