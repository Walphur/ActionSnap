"use client";

import { useMemo, useState } from "react";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";

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
      <Card>
        <CardBody>
          <EmptyState
            icon={Mail}
            title="Revisá tu email"
            description={`Te enviamos un link mágico a ${email.trim()}. Abrilo en este dispositivo para ver tus fotos en HD.`}
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
              >
                Usar otro email
              </Button>
            }
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            id="racer-email"
            label="Email de tus compras"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            autoComplete="email"
            hint="Sin contraseña: te mandamos un link seguro para entrar al instante."
          />

          {(error || initialError) && <Alert tone="danger">{error ?? initialError}</Alert>}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
            disabled={!email.includes("@")}
          >
            {loading ? "Enviando link…" : "Enviar link mágico"}
          </Button>
        </form>

        <SocialAuthButtons next="/mis-compras" mode="login" intent="racer" />
      </CardBody>
    </Card>
  );
}
