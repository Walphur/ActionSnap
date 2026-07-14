"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/brand";
import { PLATFORM } from "@/lib/platform";
import { formatApiError } from "@/lib/zod-form";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";

type Props = {
  onStatus: (msg: string, ok: boolean) => void;
};

export function WatermarkSettings({ onStatus }: Props) {
  const [text, setText] = useState("");
  const [useLogo, setUseLogo] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/photographer/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setText(data.watermark_text ?? "");
        setUseLogo(data.watermark_use_logo !== false);
        setLogoUrl(data.watermark_logo_url ?? null);
      })
      .catch(() => null);
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/photographer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watermark_text: text.trim() || null,
          watermark_use_logo: useLogo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onStatus(
          data.hint
            ? `${formatApiError(data.error)} · ${data.hint}`
            : formatApiError(data.error),
          false
        );
        return;
      }
      if (data.partial && data.hint) {
        onStatus(`Guardado parcial. ${data.hint}`, false);
        return;
      }
      onStatus(
        logoUrl
          ? "Marca de agua actualizada. Tu logo se usa en las nuevas subidas."
          : "Marca de agua actualizada. Aplica a nuevas subidas.",
        true
      );
    } catch {
      onStatus("No pudimos guardar la marca de agua. Revisá tu conexión e intentá de nuevo.", false);
    } finally {
      setSaving(false);
    }
  }

  async function uploadLogo(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/photographer/watermark-logo", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onStatus(
          data.hint
            ? `${formatApiError(data.error)} · ${data.hint}`
            : formatApiError(data.error) || "No se pudo subir el logo",
          false
        );
        return;
      }
      setLogoUrl(data.watermark_logo_url ?? null);
      setUseLogo(true);
      onStatus("Logo cargado. Se usa en previews de fotos nuevas (no cambia las ya subidas).", true);
    } catch {
      onStatus("Error al subir el logo. Reintentá.", false);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeLogo() {
    if (!confirm("¿Quitar tu logo? Volverá el de Action Snap si el check está activo.")) return;
    setUploading(true);
    try {
      const res = await fetch("/api/photographer/watermark-logo", { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onStatus(formatApiError(data.error) || "No se pudo quitar el logo", false);
        return;
      }
      setLogoUrl(null);
      onStatus("Logo propio quitado.", true);
    } catch {
      onStatus("Error al quitar el logo.", false);
    } finally {
      setUploading(false);
    }
  }

  const preview = text.trim() || BRAND.watermark;

  return (
    <div className="space-y-4">
      <Input
        label="Texto en preview (máx. 32 caracteres)"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 32))}
        placeholder={BRAND.watermark}
      />

      <div className="flex flex-col gap-4 rounded-[var(--ds-radius-md)] border border-[var(--color-border)] p-4">
        <div>
          <p className="ds-overline">Logo centrado en el preview</p>
          <p className="ds-caption mt-1 text-[var(--color-text-secondary)]">
            Subí tu isotipo/marca para que no aparezca el de {PLATFORM.name}. PNG con fondo
            transparente queda mejor.
          </p>
        </div>

        {logoUrl ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <img
              src={logoUrl}
              alt="Tu logo de marca de agua"
              className="h-16 w-auto max-w-[200px] object-contain rounded-[var(--ds-radius-sm)] bg-black/40 p-2"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={uploading}
                onClick={() => fileRef.current?.click()}
              >
                Cambiar logo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                loading={uploading}
                onClick={() => void removeLogo()}
              >
                Quitar logo
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={uploading}
              onClick={() => fileRef.current?.click()}
            >
              Subir mi logo
            </Button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadLogo(file);
          }}
        />

        <div className="border-t border-[var(--color-border)] pt-4">
          <Checkbox
            className="block w-full"
            label={
              logoUrl
                ? "Mostrar mi logo en el centro del preview"
                : `Mostrar logo ${PLATFORM.name} centrado (o subí el tuyo arriba)`
            }
            checked={useLogo}
            onChange={(e) => setUseLogo(e.target.checked)}
          />
        </div>
      </div>

      <div className="rounded-[var(--ds-radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <p className="ds-overline">Vista previa del texto</p>
        <p className="ds-display mt-2 text-2xl text-[var(--color-text-disabled)]">{preview}</p>
        {useLogo && logoUrl && (
          <img
            src={logoUrl}
            alt=""
            className="mx-auto mt-4 h-12 w-auto max-w-[160px] object-contain opacity-70"
          />
        )}
        {useLogo && !logoUrl && (
          <p className="ds-caption mt-3 text-[var(--color-text-secondary)]">
            Sin logo propio → se usa el de {PLATFORM.name}
          </p>
        )}
      </div>

      <Button type="button" variant="primary" loading={saving} onClick={save} className="w-full">
        Guardar marca de agua
      </Button>
      <p className="ds-caption">
        El logo de portada del evento (tarjeta pública) se sube en{" "}
        <strong>Subir → Portada del evento</strong>. Este logo es solo para la marca de agua de las
        fotos.
      </p>
    </div>
  );
}
