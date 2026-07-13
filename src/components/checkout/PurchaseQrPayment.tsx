"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, QrCode } from "lucide-react";
import { usePurchaseStatus } from "@/hooks/usePurchaseStatus";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { formatPrice } from "@/lib/format";

type Props = {
  searchParams: URLSearchParams;
};

export function PurchaseQrPayment({ searchParams }: Props) {
  const purchaseId = searchParams.get("purchase_id");
  const token = searchParams.get("token");
  const { state } = usePurchaseStatus(searchParams);

  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const statusParams = useMemo(() => {
    const p = new URLSearchParams();
    if (purchaseId) p.set("purchase_id", purchaseId);
    if (token) p.set("token", token);
    return p;
  }, [purchaseId, token]);

  const loadQr = useCallback(async () => {
    if (!purchaseId || !token) {
      setLoadError("Link invalido.");
      return;
    }

    try {
      const res = await fetch(
        `/api/purchases/qr-details?purchase_id=${encodeURIComponent(purchaseId)}&token=${encodeURIComponent(token)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? "No se pudo cargar el QR");
        return;
      }
      setQrUrl(data.qrUrl ?? null);
      setAmountCents(data.amountCents ?? null);
    } catch {
      setLoadError("Error de conexion");
    }
  }, [purchaseId, token]);

  useEffect(() => {
    void loadQr();
  }, [loadQr]);

  if (state.status === "paid") {
    return (
      <div className="buyer-success">
        <Card className="buyer-success__card">
          <CardBody className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--color-success)]" />
            <h1 className="ds-h2 mt-4">Pago confirmado</h1>
            <p className="ds-body-lg mt-2 text-[var(--color-text-secondary)]">
              Revisa tu email para descargar las fotos HD.
            </p>
            <ButtonLink href="/mis-compras" variant="primary" className="mt-6">
              Mis compras
            </ButtonLink>
          </CardBody>
        </Card>
      </div>
    );
  }

  const qrImageSrc = qrUrl
    ? `https://quickchart.io/qr?text=${encodeURIComponent(qrUrl)}&size=280&margin=2`
    : null;

  return (
    <div className="buyer-success">
      <Card className="buyer-success__card">
        <CardBody className="text-center">
          <div className="buyer-success__icon buyer-success__icon--pending">
            <QrCode className="h-9 w-9" aria-hidden />
          </div>
          <h1 className="ds-h2 mt-4">Paga con QR</h1>
          <p className="ds-body-lg mt-2 text-[var(--color-text-secondary)]">
            Escanea con la app de Mercado Pago
            {amountCents != null && (
              <>
                {" "}
                — <strong className="text-[var(--color-text-primary)]">{formatPrice(amountCents)}</strong>
              </>
            )}
          </p>

          {loadError && (
            <Alert tone="danger" title="Error" className="mt-4 text-left">
              {loadError}
            </Alert>
          )}

          {!loadError && !qrImageSrc && (
            <div className="mt-6 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
          )}

          {qrImageSrc && (
            <div className="mt-6 inline-block rounded-xl bg-white p-3">
              <img src={qrImageSrc} alt="QR Mercado Pago" width={280} height={280} className="block" />
            </div>
          )}

          {qrUrl && (
            <p className="mt-4">
              <a
                href={qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
              >
                Abrir en Mercado Pago
                <ExternalLink className="h-4 w-4" />
              </a>
            </p>
          )}

          {(state.status === "loading" || state.status === "pending") && (
            <p className="ds-caption mt-4 inline-flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Esperando confirmacion del pago…
            </p>
          )}

          <p className="ds-caption mt-6 text-[var(--color-text-secondary)]">
            No cierres esta pantalla. Cuando MP confirme, te redirigimos a la descarga.
          </p>

          {purchaseId && token && (
            <ButtonLink
              href={`/compra/exito?${statusParams.toString()}`}
              variant="ghost"
              className="mt-4"
            >
              Ya pague
            </ButtonLink>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
