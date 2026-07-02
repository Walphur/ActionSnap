import { AlertCircle, CheckCircle2, Clock, CreditCard } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PLATFORM } from "@/lib/platform";

type Props = {
  mpConnected: boolean;
  mpReceiverId: string;
  mpSaving: boolean;
  onSaveManual: () => void;
  onMpIdChange: (value: string) => void;
  onOpenSettings?: () => void;
  compact?: boolean;
};

export function DashboardMpCard({
  mpConnected,
  mpReceiverId,
  mpSaving,
  onSaveManual,
  onMpIdChange,
  onOpenSettings,
  compact = false,
}: Props) {
  const status = mpConnected ? "connected" : mpReceiverId ? "pending" : "disconnected";

  return (
    <Card className="ds-dash-reveal">
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
          {status === "pending" && (
            <Badge tone="warning">
              <Clock className="h-3 w-3" aria-hidden />
              Pendiente
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
        {status === "connected" ? (
          <Alert tone="success" title="Cuenta vinculada">
            Collector ID: <code className="text-sm">{mpReceiverId}</code>
          </Alert>
        ) : (
          <Alert tone="warning" title="Conectá tu cuenta">
            Necesitás Mercado Pago para cobrar el {PLATFORM.photographerSharePercent}% de cada venta.
          </Alert>
        )}

        <p className="ds-caption flex items-center gap-2 text-[var(--color-text-secondary)]">
          <Clock className="h-4 w-4 shrink-0" aria-hidden />
          Última sincronización: al cargar el panel
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <ButtonLink href="/api/mercadopago/auth" variant="primary" className="flex-1">
            <CreditCard className="h-4 w-4" aria-hidden />
            {mpConnected ? "Reconectar" : "Conectar Mercado Pago"}
          </ButtonLink>
          {!compact && onOpenSettings && (
            <Button type="button" variant="secondary" onClick={onOpenSettings}>
              Ver ajustes
            </Button>
          )}
        </div>

        {!compact && (
          <>
            <label className="ds-field">
              <span className="ds-field__label">Receiver ID (manual)</span>
              <input
                className="ds-input"
                name="mp"
                value={mpReceiverId}
                onChange={(e) => onMpIdChange(e.target.value)}
                placeholder="Se completa al conectar OAuth"
              />
            </label>
            <Button type="button" variant="outline" loading={mpSaving} onClick={onSaveManual}>
              Guardar ID manual
            </Button>
          </>
        )}
      </CardBody>
    </Card>
  );
}
