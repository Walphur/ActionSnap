"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/BrandLogo";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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
    <div className="ds-auth-admin">
      <div className="ds-auth-admin__card">
        <div className="mb-8 flex justify-center">
          <BrandLogo size="lg" href="/" />
        </div>
        <Card>
          <CardBody>
            <h1 className="ds-h3 text-center">Admin {PLATFORM.name}</h1>
            <p className="ds-caption mt-2 text-center text-[var(--color-text-secondary)]">
              Acceso restringido a la plataforma
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {error && <Alert tone="danger">{error}</Alert>}
              <Button type="submit" variant="primary" className="w-full" loading={loading}>
                {loading ? "Ingresando…" : "Entrar al panel"}
              </Button>
            </form>
            <Link href="/" className="ds-auth__back justify-center">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Volver al sitio
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
