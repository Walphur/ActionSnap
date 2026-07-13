"use client";

import { useEffect, useState } from "react";
import { Building2, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

type TransferRow = {
  id: string;
  email: string;
  amountLabel: string;
  reference: string;
  createdAt: string;
};

export function DashboardPendingTransfers({ onStatus }: { onStatus: (msg: string, ok: boolean) => void }) {
  const [rows, setRows] = useState<TransferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/photographer/pending-transfers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setRows(data.transfers ?? []);
    } catch (e) {
      onStatus(e instanceof Error ? e.message : "No se pudieron cargar transferencias", false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function confirmTransfer(id: string) {
    setConfirmingId(id);
    try {
      const res = await fetch(`/api/photographer/purchases/${id}/confirm-transfer`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al confirmar");
      onStatus("Pago confirmado. Enviamos el link de descarga al comprador.", true);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      onStatus(e instanceof Error ? e.message : "No se pudo confirmar", false);
    } finally {
      setConfirmingId(null);
    }
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardBody>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-3 h-16 w-full" />
        </CardBody>
      </Card>
    );
  }

  if (rows.length === 0) return null;

  return (
    <Card className="mb-6 border-[var(--color-warning)]/30">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <h2 className="ds-h4 inline-flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[var(--color-warning)]" />
            Transferencias pendientes
          </h2>
          <p className="ds-caption mt-1">
            Cuando veas el dinero en tu cuenta, confirma para liberar las fotos al comprador.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardBody className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-col gap-3 rounded-[var(--ds-radius-sm)] border border-[var(--color-border)] p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="ds-body font-medium">{row.amountLabel}</p>
              <p className="ds-caption truncate">{row.email}</p>
              <p className="ds-caption">Ref: {row.reference}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={confirmingId === row.id}
                onClick={() => void confirmTransfer(row.id)}
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirmar pago
              </Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
