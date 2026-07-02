"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { EventRow } from "@/types/event";

type Props = {
  defaultSlug?: string;
  event?: EventRow;
  onSaved?: () => void;
};

export function EditEventPanel({ defaultSlug = "", event, onSaved }: Props) {
  const [slug, setSlug] = useState(defaultSlug);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("5");
  const [packDiscount, setPackDiscount] = useState("20");
  const [msg, setMsg] = useState<string | null>(null);
  const [msgOk, setMsgOk] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (defaultSlug) setSlug(defaultSlug);
  }, [defaultSlug]);

  useEffect(() => {
    if (!event || event.slug !== slug) return;
    setTitle(event.title);
    setPrice(String((event.price_per_photo_cents / 100).toFixed(event.price_per_photo_cents % 100 ? 2 : 0)));
  }, [event, slug]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!slug.trim()) {
      setMsgOk(false);
      setMsg("Escribí el slug del evento para guardar los cambios.");
      return;
    }
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/photographer/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim(),
        title: title || undefined,
        price_per_photo_cents: price ? Math.round(Number(price) * 100) : undefined,
        pack_discount_percent: packDiscount ? Number(packDiscount) : undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMsgOk(true);
      setMsg("Cambios guardados correctamente.");
      onSaved?.();
    } else {
      setMsgOk(false);
      setMsg(data.error ?? "No se pudo actualizar el evento. Revisá los datos e intentá de nuevo.");
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="ds-h4">Precio y detalles</h3>
      <p className="ds-caption">Ajustá título y precio. La publicación se hace desde el resumen de abajo.</p>
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input
          label="Precio ($)"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Input
          label="Descuento pack (%)"
          type="number"
          min="0"
          max="80"
          value={packDiscount}
          onChange={(e) => setPackDiscount(e.target.value)}
        />
        <Button type="submit" variant="secondary" loading={saving} className="sm:col-span-2">
          Guardar cambios
        </Button>
      </form>
      {msg && (
        <Alert tone={msgOk ? "success" : "danger"} title={msgOk ? "Guardado" : "No se pudo guardar"}>
          {msg}
        </Alert>
      )}
    </div>
  );
}
