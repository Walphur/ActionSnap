"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCopy,
  Clock,
  CreditCard,
  ExternalLink,
  Wallet,
} from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PLATFORM } from "@/lib/platform";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/ui/cn";

type MpSetup = {
  redirectUri: string;
  expectedRedirectUri: string;
  configuredRedirectUri: string | null;
  redirectUriMismatch: boolean;
  appUrl: string;
  authBaseUrl: string;
  pkceEnabled: boolean;
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  accessTokenConfigured: boolean;
  clientIdSuffix: string | null;
  panelUrl: string;
  oauthReady: boolean;
};

type Props = {
  mpConnected: boolean;
  mpReceiverId: string;
  onOpenSettings?: () => void;
  compact?: boolean;
  highlight?: boolean;
};

export function DashboardMpCard({
  mpConnected,
  mpReceiverId,
  onOpenSettings,
  compact = false,
  highlight = false,
}: Props) {
  const searchParams = useSearchParams();
  const oauthFailed = searchParams.get("mp") === "error";
  const oauthReason = searchParams.get("reason");

  const [setup, setSetup] = useState<MpSetup | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  const status = mpConnected ? "connected" : "disconnected";

  useEffect(() => {
    if (mpConnected) return;

    let cancelled = false;

    async function loadSetup() {
      try {
        const res = await fetch("/api/mercadopago/setup");
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "No se pudo leer la configuración");
        }
        const data = (await res.json()) as MpSetup;
        if (!cancelled) {
          setSetup(data);
          setSetupError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setSetupError(e instanceof Error ? e.message : "Error de configuración");
        }
      }
    }

    void loadSetup();
    return () => {
      cancelled = true;
    };
  }, [mpConnected]);

  async function copyRedirectUri() {
    if (!setup?.redirectUri) return;
    try {
      await navigator.clipboard.writeText(setup.redirectUri);
      toast.success("Redirect URI copiada");
    } catch {
      toast.error("No se pudo copiar. Seleccioná el texto manualmente.");
    }
  }

  const showOAuthHelp =
    !mpConnected && (oauthFailed || status === "disconnected") && setup?.redirectUri;

  return (
    <Card
      className={cn(
        "ds-dash-reveal",
        highlight && status !== "connected" && "ds-dash-mp-card--highlight"
      )}
    >
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="ds-h4">Mercado Pago</h2>
            <p className="ds-caption mt-1">
              Split {PLATFORM.commissionPercent}% plataforma / {PLATFORM.photographerSharePercent}% tuyo
            </p>
          </div>
          {status === "connected" && (
            <Badge tone="success">
              <CheckCircle2 className="h-3 w-3" aria-hidden />
              Conectado
            </Badge>
          )}
          {status === "disconnected" && (
            <Badge tone="danger">
              <AlertCircle className="h-3 w-3" aria-hidden />
              Sin conectar
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {oauthFailed && (
          <Alert tone="danger" title="No se pudo conectar con Mercado Pago">
            {oauthReason
              ? `Mercado Pago respondió: ${oauthReason}.`
              : "La autorización fue rechazada."}{" "}
            Si ves &quot;La aplicación no está preparada&quot;, la Redirect URI del panel de Mercado
            Pago no coincide con la de abajo (o falta PKCE en la app).
          </Alert>
        )}

        {status === "connected" ? (
          <Alert tone="success" title="Cuenta vinculada">
            Collector ID: <code className="text-sm">{mpReceiverId}</code>
            <p className="mt-2 ds-caption text-[var(--color-text-secondary)]">
              Las ventas se acreditan en tu Mercado Pago. Action Snap no guarda tu contraseña; sí un
              token OAuth para crear el cobro a tu nombre (estándar de marketplaces).
            </p>
            <p className="mt-2 ds-caption text-[var(--color-text-secondary)]">
              Si una venta te llegó mal / a otra cuenta, tocá <strong>Reconectar</strong> acá
              abajo (necesario una vez tras el fix de marketplace).
            </p>
          </Alert>
        ) : (
          <>
            <Alert tone="warning" title="Conectá Mercado Pago para cobrar">
              Sin una cuenta vinculada no podés recibir pagos. Al conectar, cada venta se acredita
              automáticamente el {PLATFORM.photographerSharePercent}% en tu cuenta.
            </Alert>
            <p className="ds-caption text-[var(--color-text-secondary)]">
              Es el mismo flujo seguro que usan Mercado Libre, Tienda Nube y otros marketplaces: te
              redirigimos a Mercado Pago, autorizás ahí, y volvés al panel. No compartís tu clave con
              Action Snap.
            </p>
            <ul className="ds-dash-mp-steps">
              <li>
                <Wallet className="h-4 w-4 shrink-0" aria-hidden />
                <span>Hacé clic en conectar y autorizá con tu cuenta de Mercado Pago.</span>
              </li>
              <li>
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                <span>Volvé al panel y empezá a vender — los cobros llegan directo a vos.</span>
              </li>
            </ul>
          </>
        )}

        {showOAuthHelp && (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 space-y-2">
            <p className="ds-caption font-medium text-[var(--color-text)]">
              Redirect URI (copiá esto en el panel de Mercado Pago)
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 break-all rounded bg-[var(--color-surface)] px-2 py-1.5 text-xs">
                {setup.redirectUri}
              </code>
              <Button type="button" variant="outline" size="sm" onClick={() => void copyRedirectUri()}>
                <ClipboardCopy className="h-4 w-4" aria-hidden />
                Copiar
              </Button>
            </div>
            <p className="ds-caption text-[var(--color-text-secondary)]">
              Panel → tu app
              {setup.clientIdSuffix ? ` (…${setup.clientIdSuffix})` : ""} → URLs de redireccionamiento.
              {setup.pkceEnabled
                ? " PKCE activo: habilitá PKCE también en el panel MP."
                : " PKCE desactivado (poné MERCADOPAGO_OAUTH_PKCE=true solo si lo activás en MP)."}
            </p>
            {!setup.oauthReady && (
              <p className="ds-caption text-[var(--color-danger)]">
                Faltan credenciales OAuth en Render
                {!setup.clientIdConfigured ? " (CLIENT_ID)" : ""}
                {!setup.clientSecretConfigured ? " (CLIENT_SECRET)" : ""}.
              </p>
            )}
            {setup.redirectUriMismatch && (
              <p className="ds-caption text-[var(--color-danger)]">
                MERCADOPAGO_REDIRECT_URI no coincide con la URL calculada ({setup.redirectUri}).
              </p>
            )}
            <a
              href={setup.panelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-caption inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
            >
              Abrir panel de Mercado Pago
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
            {setupError && (
              <p className="ds-caption text-[var(--color-danger)]">{setupError}</p>
            )}
          </div>
        )}

        {!compact && (
          <p className="ds-caption flex items-center gap-2 text-[var(--color-text-secondary)]">
            <Clock className="h-4 w-4 shrink-0" aria-hidden />
            Última sincronización: al cargar el panel
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Enlace nativo (no Next Link): /api/mercadopago/auth redirige a mercadopago.com,
              y el prefetch RSC de Next dispara errores CORS en consola. */}
          <a
            href="/api/mercadopago/auth"
            className="ds-btn ds-pressable ds-btn--primary flex-1"
          >
            <CreditCard className="h-4 w-4" aria-hidden />
            {mpConnected ? "Reconectar" : "Conectar Mercado Pago"}
          </a>
          {!compact && onOpenSettings && (
            <Button type="button" variant="secondary" onClick={onOpenSettings}>
              Ver ajustes
            </Button>
          )}
        </div>

      </CardBody>
    </Card>
  );
}
