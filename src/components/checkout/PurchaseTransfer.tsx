"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

type TransferDetails = {
  purchaseId: string;
  status: string;
  amountLabel: string;
  email: string;
  reference: string;
  bank: { cbu: string | null; alias: string | null; holder: string };
};

export function PurchaseTransfer() {
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("purchase_id");
  const token = searchParams.get("token");
  const [details, setDetails] = useState<TransferDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!purchaseId || !token) {
      setError("Link invalido.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/purchases/transfer-details?purchase_id=${encodeURIComponent(purchaseId)}&token=${encodeURIComponent(token)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudieron cargar los datos");
        return;
      }
      setDetails(data);
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }, [purchaseId, token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }

  if (loading) {
    return (
      <div className="buyer-success">
        <Card className="buyer-success__card">
          <CardBody className="text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-[var(--color-primary)]" />
            <p className="ds-body mt-4 text-[var(--color-text-secondary)]">Cargando datos…</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="buyer-success">
        <Card className="buyer-success__card">
          <CardBody>
            <Alert tone="danger" title="No disponible">
              {error ?? "No encontramos esta compra."}
            </Alert>
            <ButtonLink href="/" variant="ghost" className="mt-4">
              Volver al inicio
            </ButtonLink>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (details.status === "paid") {
    return (
      <div className="buyer-success">
        <Card className="buyer-success__card">
          <CardBody className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--color-success)]" />
            <h1 className="ds-h2 mt-4">Pago confirmado</h1>
            <p className="ds-body-lg mt-2 text-[var(--color-text-secondary)]">
              Revisa tu email ({details.email}) para descargar las fotos HD.
            </p>
            <ButtonLink href="/mis-compras" variant="primary" className="mt-6">
              Mis compras
            </ButtonLink>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="buyer-success">
      <Card className="buyer-success__card">
        <CardBody>
          <div className="buyer-success__icon buyer-success__icon--pending">
            <Building2 className="h-9 w-9" aria-hidden />
          </div>
          <h1 className="ds-h2 mt-4">Transferi para completar</h1>
          <p className="ds-body-lg mt-2 text-[var(--color-text-secondary)]">
            Envia <strong className="text-[var(--color-text-primary)]">{details.amountLabel}</strong>{" "}
            al fotografo. Cuando confirme el pago, te llega el link de descarga a{" "}
            <strong className="text-[var(--color-text-primary)]">{details.email}</strong>.
          </p>

          <div className="mt-6 space-y-3 rounded-[var(--ds-radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left">
            <Row label="Titular" value={details.bank.holder} />
            {details.bank.alias && (
              <Row
                label="Alias"
                value={details.bank.alias}
                onCopy={() => void copyText("alias", details.bank.alias!)}
                copied={copied === "alias"}
              />
            )}
            {details.bank.cbu && (
              <Row
                label="CBU/CVU"
                value={details.bank.cbu}
                onCopy={() => void copyText("cbu", details.bank.cbu!)}
                copied={copied === "cbu"}
              />
            )}
            <Row
              label="Referencia"
              value={details.reference}
              hint="Incluila en el concepto de la transferencia"
              onCopy={() => void copyText("ref", details.reference)}
              copied={copied === "ref"}
            />
            <Row label="Monto exacto" value={details.amountLabel} accent />
          </div>

          <Alert tone="info" title="Sin comision de Mercado Pago" className="mt-4">
            El fotografo valida la transferencia manualmente. Puede tardar unas horas.
          </Alert>
        </CardBody>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
  onCopy,
  copied,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  onCopy?: () => void;
  copied?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="ds-caption">{label}</p>
        <p
          className={`ds-body font-medium break-all ${accent ? "text-[var(--color-primary)] text-lg" : ""}`}
        >
          {value}
        </p>
        {hint && <p className="ds-caption mt-0.5">{hint}</p>}
      </div>
      {onCopy && (
        <button
          type="button"
          className="shrink-0 rounded p-2 text-[var(--color-text-secondary)] hover:bg-white/5"
          onClick={onCopy}
          aria-label={`Copiar ${label}`}
        >
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
