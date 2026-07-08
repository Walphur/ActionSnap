"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function EventCoverPanel({
  defaultSlug = "",
  onSaved,
}: {
  defaultSlug?: string;
  onSaved?: () => void;
}) {
  const [slug, setSlug] = useState(defaultSlug);

  useEffect(() => {
    if (defaultSlug) setSlug(defaultSlug);
  }, [defaultSlug]);

  const [coverUrl, setCoverUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [msgOk, setMsgOk] = useState(true);
  const [loading, setLoading] = useState(false);

  async function saveUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!slug.trim()) {
      setMsgOk(false);
      setMsg("Escribí el slug del evento para guardar la portada.");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/photographer/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim(),
          cover_url: coverUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar la URL de portada.");
      setMsgOk(true);
      setMsg("Portada guardada correctamente.");
      onSaved?.();
    } catch (err) {
      setMsgOk(false);
      setMsg(err instanceof Error ? err.message : "No se pudo guardar la portada. Reintentá.");
    } finally {
      setLoading(false);
    }
  }

  async function useFirstPhoto() {
    if (!slug.trim()) {
      setMsgOk(false);
      setMsg("Escribí el slug del evento primero.");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/photographer/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug.trim(), use_first_photo: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No hay fotos para usar como portada.");
      setCoverUrl(data.cover_url ?? "");
      setMsgOk(true);
      setMsg("Portada actualizada con la primera foto del evento.");
      onSaved?.();
    } catch (err) {
      setMsgOk(false);
      setMsg(err instanceof Error ? err.message : "No se pudo asignar la primera foto.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadCover(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("coverFile") as File | null;
    if (!file?.size || !slug.trim()) {
      setMsgOk(false);
      setMsg("Elegí el evento y un archivo de imagen (JPG, PNG o WebP).");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const body = new FormData();
      body.set("eventSlug", slug.trim());
      body.set("file", file);
      const res = await fetch("/api/photographer/event-cover", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo subir la imagen de portada.");
      setCoverUrl(data.cover_url ?? "");
      setMsgOk(true);
      setMsg("Portada subida correctamente.");
      onSaved?.();
      e.currentTarget.reset();
    } catch (err) {
      setMsgOk(false);
      setMsg(err instanceof Error ? err.message : "Falló la subida. Revisá el tamaño del archivo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <ImageIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" aria-hidden />
        <div>
          <h3 className="ds-h4">Portada del evento</h3>
          <p className="ds-caption mt-1">
            Logo del evento o foto destacada en la tarjeta y galería pública.
          </p>
        </div>
      </div>

      <Input
        label="Slug del evento"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="ej. gp-sanluis-2026"
      />

      <form onSubmit={saveUrl} className="space-y-3">
        <Input
          label="URL de imagen (opcional)"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://..."
        />
        <Button type="submit" variant="secondary" size="sm" loading={loading}>
          Guardar URL
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        loading={loading}
        onClick={() => void useFirstPhoto()}
      >
        Usar primera foto subida como portada
      </Button>

      <form onSubmit={uploadCover} className="space-y-3 border-t border-[var(--color-border)] pt-4">
        <label className="ds-field">
          <span className="ds-field__label">Subir logo o foto de portada</span>
          <input
            type="file"
            name="coverFile"
            accept="image/jpeg,image/png,image/webp"
            className="ds-dash-file-input"
          />
        </label>
        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          Subir portada
        </Button>
      </form>

      {coverUrl && (
        <div className="overflow-hidden rounded-[var(--ds-radius-sm)] border border-[var(--color-border)]">
          <img
            src={coverUrl}
            alt="Vista previa de la portada"
            className="aspect-video w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {msg && (
        <Alert tone={msgOk ? "success" : "danger"} title={msgOk ? "Listo" : "No se pudo guardar"}>
          {msg}
        </Alert>
      )}
    </div>
  );
}
