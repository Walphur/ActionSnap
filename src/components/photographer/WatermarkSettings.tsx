"use client";

import { useEffect, useState } from "react";
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/photographer/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setText(data.watermark_text ?? "");
        setUseLogo(data.watermark_use_logo !== false);
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
      onStatus("Marca de agua actualizada. Aplica a nuevas subidas.", true);
    } catch {
      onStatus("No pudimos guardar la marca de agua. Revisá tu conexión e intentá de nuevo.", false);
    } finally {
      setSaving(false);
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
      <Checkbox
        label={`Mostrar logo ${PLATFORM.name} centrado`}
        checked={useLogo}
        onChange={(e) => setUseLogo(e.target.checked)}
      />
      <div className="rounded-[var(--ds-radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <p className="ds-overline">Vista previa</p>
        <p className="ds-display mt-2 text-2xl text-[var(--color-text-disabled)]">{preview}</p>
      </div>
      <Button type="button" variant="primary" loading={saving} onClick={save} className="w-full">
        Guardar marca de agua
      </Button>
      <p className="ds-caption">
        El logo de <strong>Action Snap</strong> es el isotipo de la plataforma. Para tu logo de
        evento, subilo en <strong>Publicar → Portada del evento</strong>.
      </p>
    </div>
  );
}
