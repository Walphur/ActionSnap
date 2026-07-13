"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type Props = {
  onStatus: (msg: string, ok: boolean) => void;
};

export function DashboardBankCard({ onStatus }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accepts, setAccepts] = useState(false);
  const [cbu, setCbu] = useState("");
  const [alias, setAlias] = useState("");
  const [holder, setHolder] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/photographer/profile");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error");
        setAccepts(Boolean(data.accepts_bank_transfer));
        setCbu(data.bank_cbu ?? "");
        setAlias(data.bank_alias ?? "");
        setHolder(data.bank_holder_name ?? "");
      } catch (e) {
        onStatus(e instanceof Error ? e.message : "No se pudo cargar datos bancarios", false);
      } finally {
        setLoading(false);
      }
    })();
  }, [onStatus]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/photographer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accepts_bank_transfer: accepts,
          bank_cbu: cbu.trim() || null,
          bank_alias: alias.trim() || null,
          bank_holder_name: holder.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      onStatus("Datos bancarios guardados.", true);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Error al guardar", false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="ds-h4 inline-flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Transferencia bancaria
        </h2>
        <p className="ds-caption mt-1">
          Los compradores pueden pagarte directo sin comision de Mercado Pago. Vos confirmas el pago
          manualmente.
        </p>
      </CardHeader>
      <CardBody>
        {loading ? (
          <p className="ds-caption">Cargando…</p>
        ) : (
          <form onSubmit={(e) => void save(e)} className="space-y-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={accepts}
                onChange={(e) => setAccepts(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--color-border)]"
              />
              <span className="ds-body">Aceptar pagos por transferencia</span>
            </label>

            <Input
              label="Titular de la cuenta"
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
              placeholder="Nombre y apellido"
            />
            <Input
              label="Alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="mi.alias.mp"
            />
            <Input
              label="CBU / CVU"
              value={cbu}
              onChange={(e) => setCbu(e.target.value.replace(/\D/g, "").slice(0, 22))}
              placeholder="22 digitos"
            />

            {accepts && !cbu.trim() && !alias.trim() && (
              <Alert tone="warning" title="Falta alias o CBU">
                Carga al menos uno para que los compradores puedan transferirte.
              </Alert>
            )}

            <Button type="submit" variant="primary" loading={saving}>
              Guardar datos bancarios
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
