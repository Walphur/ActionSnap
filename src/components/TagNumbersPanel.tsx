"use client";

import { useCallback, useEffect, useState } from "react";
import { FlaskConical, Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EXPERIMENTAL_AI_LABEL, isAiTaggingEnabled } from "@/lib/detection-config";

type PhotoRow = {
  id: string;
  preview_url: string;
  original_url: string;
  ai_status: string;
  photo_numbers: { number: string }[];
};

export function TagNumbersPanel({ defaultSlug = "" }: { defaultSlug?: string }) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState(defaultSlug);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [manualId, setManualId] = useState("");
  const [manualDorsal, setManualDorsal] = useState("");

  useEffect(() => {
    if (defaultSlug) setSlug(defaultSlug);
  }, [defaultSlug]);

  const pending = photos.filter((p) => (p.photo_numbers?.length ?? 0) === 0).length;

  const load = useCallback(async () => {
    if (!slug.trim()) return;
    const res = await fetch(`/api/photographer/photos?eventSlug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (res.ok) setPhotos(data.photos ?? []);
  }, [slug]);

  useEffect(() => {
    if (open && slug) void load();
  }, [open, slug, load]);

  async function analyzeAllWithAI() {
    if (!slug.trim()) {
      setMsg("Elegí un evento activo");
      return;
    }
    setAnalyzing(true);
    setMsg("Analizando lote (experimental)…");
    let remaining = 1;
    let totalTagged = 0;
    let totalProcessed = 0;
    let totalNoNumbers = 0;

    try {
      while (remaining > 0) {
        const res = await fetch("/api/photographer/analyze-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventSlug: slug, onlyPending: true }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMsg(data.hint ? `${data.error} — ${data.hint}` : data.error ?? "Error");
          break;
        }
        totalTagged += data.tagged ?? 0;
        totalProcessed += data.processed ?? 0;
        totalNoNumbers += data.noNumbers ?? 0;
        remaining = data.remaining ?? 0;
        setMsg(data.message ?? `Procesadas ${totalProcessed} fotos…`);
        if (data.done) break;
      }

      await load();
      setMsg(
        totalTagged > 0
          ? `IA (beta): ${totalTagged} dorsales detectados en ${totalProcessed} fotos. Revisá y completá manual lo que falte.`
          : totalProcessed > 0
            ? `IA (beta) analizó ${totalProcessed} fotos sin dorsales confiables (${totalNoNumbers}). Usá etiquetado manual.`
            : "No hay fotos pendientes para analizar."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function saveManual() {
    if (!manualId || !manualDorsal.trim()) {
      setMsg("Elegí foto y dorsal");
      return;
    }
    const res = await fetch("/api/photographer/tag-numbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photoId: manualId,
        dorsal: manualDorsal.replace(/\D/g, "").slice(0, 3),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Error");
      return;
    }
    setManualDorsal("");
    await load();
    setMsg(`Corregido manualmente #${data.numbers?.[0] ?? manualDorsal}`);
  }

  if (!isAiTaggingEnabled()) {
    return (
      <div className="ds-experimental-ai">
        <button
          type="button"
          className="ds-experimental-ai__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <FlaskConical className="h-4 w-4" aria-hidden />
          <span>Etiquetado automático</span>
          <Badge tone="warning">{EXPERIMENTAL_AI_LABEL}</Badge>
        </button>
        {open && (
          <Alert tone="info" className="mt-3">
            La detección automática está <strong>pausada</strong> en este entorno. El flujo oficial es
            etiquetado manual arriba. Para probar IA: configurá credenciales y{" "}
            <code className="text-xs">DETECTION_DISABLED=false</code>.
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="ds-experimental-ai">
      <button
        type="button"
        className="ds-experimental-ai__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <FlaskConical className="h-4 w-4" aria-hidden />
        <span>Etiquetado automático (OCR / Vision)</span>
        <Badge tone="warning">{EXPERIMENTAL_AI_LABEL}</Badge>
      </button>

      {open && (
        <div className="ds-experimental-ai__body">
          <Alert tone="warning">
            Función <strong>opcional y experimental</strong>. En motocross la precisión suele ser baja.
            No es necesaria para publicar: usá el etiquetado manual como flujo principal.
          </Alert>

          <p className="ds-caption mt-3">
            Evento: <strong>{slug || "—"}</strong>
            {photos.length > 0 && ` · ${pending} sin dorsal`}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={analyzing}
              onClick={() => void analyzeAllWithAI()}
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Analizando…
                </>
              ) : (
                "Probar IA en pendientes"
              )}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
              Actualizar lista
            </Button>
          </div>

          {photos.length > 0 && pending > 0 && (
            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
              <p className="ds-caption mb-2">Corrección puntual post-IA</p>
              <div className="flex flex-wrap gap-2">
                <select
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="ds-select min-w-[12rem] flex-1"
                >
                  <option value="">Foto sin dorsal</option>
                  {photos
                    .filter((p) => (p.photo_numbers?.length ?? 0) === 0)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id.slice(0, 8)}…
                      </option>
                    ))}
                </select>
                <Input
                  value={manualDorsal}
                  onChange={(e) => setManualDorsal(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  placeholder="Dorsal"
                  className="w-24"
                />
                <Button type="button" variant="primary" size="sm" onClick={() => void saveManual()}>
                  Guardar
                </Button>
              </div>
            </div>
          )}

          {msg && <p className="ds-caption mt-3 text-[var(--color-text-secondary)]">{msg}</p>}
        </div>
      )}
    </div>
  );
}
