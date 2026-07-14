"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { TurnstileWidget, turnstileEnabled } from "@/components/TurnstileWidget";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PLATFORM } from "@/lib/platform";

export default function PhotographerRegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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

    if (!acceptedTerms) {
      setError("Tenés que aceptar los Términos y Condiciones y la Política de Privacidad.");
      setLoading(false);
      return;
    }

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

    if (res.data.session) {
      router.push("/fotografos");
      router.refresh();
      return;
    }
    setSuccess("Cuenta creada. Revisá tu email si tenés que confirmar.");
    router.refresh();
  }

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle={`Publicá eventos y cobrá el ${PLATFORM.photographerSharePercent}% de cada venta`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Nombre"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <PasswordInput
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={6}
        />

        {needsCaptcha && (
          <TurnstileWidget onToken={setTurnstileToken} className="flex justify-center" />
        )}

        <label className="ds-check items-start">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            required
          />
          <span className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Acepto los{" "}
            <Link
              href="/legales/terminos"
              className="text-[var(--color-primary)] hover:underline"
              target="_blank"
            >
              Términos y Condiciones
            </Link>{" "}
            y las{" "}
            <Link
              href="/legales/privacidad"
              className="text-[var(--color-primary)] hover:underline"
              target="_blank"
            >
              Políticas de Privacidad
            </Link>{" "}
            de {PLATFORM.name}.
          </span>
        </label>

        {error && <Alert tone="danger">{error}</Alert>}
        {success && <Alert tone="success">{success}</Alert>}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
          disabled={!acceptedTerms}
        >
          {loading ? "Creando…" : "Crear cuenta"}
        </Button>
      </form>

      <SocialAuthButtons next="/fotografos" mode="register" />

      <div className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">
        <p>
          ¿Ya tenés cuenta?{" "}
          <Link href="/fotografos/login" className="text-[var(--color-primary)] hover:underline">
            Ingresar
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
