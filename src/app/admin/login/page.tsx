"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PLATFORM } from "@/lib/platform";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHint(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "No se pudo iniciar sesion.");
        if (data.hint) setHint(data.hint);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de conexion. Revisa tu internet e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
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
              {error && (
                <Alert tone="danger" title="No se pudo entrar">
                  {error}
                  {hint && <p className="mt-2 text-sm opacity-90">{hint}</p>}
                </Alert>
              )}
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
