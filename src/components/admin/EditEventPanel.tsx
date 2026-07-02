"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";

export function EditEventPanel({ defaultSlug = "" }: { defaultSlug?: string }) {
  const [slug, setSlug] = useState(defaultSlug);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("5");
  const [packDiscount, setPackDiscount] = useState("20");
  const [published, setPublished] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgOk, setMsgOk] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (defaultSlug) setSlug(defaultSlug);
  }, [defaultSlug]);

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
        is_published: published,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMsgOk(true);
      setMsg(published ? "Evento actualizado y visible en la galería pública." : "Evento guardado como borrador.");
    } else {
      setMsgOk(false);
      setMsg(data.error ?? "No se pudo actualizar el evento. Revisá los datos e intentá de nuevo.");
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="ds-h4">Editar evento</h3>
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input
          label="Precio ($)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Input
          label="Descuento pack (%)"
          type="number"
          value={packDiscount}
          onChange={(e) => setPackDiscount(e.target.value)}
        />
        <Checkbox
          label="Publicada (visible para compradores)"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="sm:col-span-2"
        />
        <Button type="submit" variant="primary" loading={saving} className="sm:col-span-2">
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
