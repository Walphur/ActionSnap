"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { PLATFORM } from "@/lib/platform";

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
        onStatus(data.error ?? "Error al guardar marca de agua", false);
        return;
      }
      onStatus("Marca de agua actualizada. Aplica a nuevas subidas.", true);
    } finally {
      setSaving(false);
    }
  }

  const preview = text.trim() || BRAND.watermark;

  return (
    <div className="space-y-4">
      <label className="block text-sm">
        <span className="text-[var(--muted)]">Texto en preview (máx. 32 caracteres)</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 32))}
          placeholder={BRAND.watermark}
          className="field-input mt-1.5 w-full"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={useLogo}
          onChange={(e) => setUseLogo(e.target.checked)}
          className="accent-[var(--accent)]"
        />
        Mostrar logo {PLATFORM.name} centrado
      </label>
      <div className="rounded-xl border border-dashed border-white/15 bg-black/40 p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Vista previa</p>
        <p className="font-display mt-2 text-2xl uppercase tracking-wide text-white/40">{preview}</p>
      </div>
      <button type="button" disabled={saving} onClick={save} className="btn-primary w-full">
        {saving ? "Guardando…" : "Guardar marca de agua"}
      </button>
      <p className="text-xs text-[var(--muted)]">
        Las fotos ya subidas conservan su preview. Cambiá el texto antes de subir un lote nuevo.
      </p>
    </div>
  );
}
