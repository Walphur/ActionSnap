"use client";

import { useEffect, useState } from "react";
import { BulkTagger } from "@/components/BulkTagger";
import { EventCoverPanel } from "@/components/EventCoverPanel";
import { TagNumbersPanel } from "@/components/TagNumbersPanel";

type SetupStatus = {
  ready: boolean;
  missing: string[];
};

export default function AdminPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [statusOk, setStatusOk] = useState(true);
  const [setup, setSetup] = useState<SetupStatus | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lastSlug, setLastSlug] = useState("");
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetch("/api/setup/status")
      .then((r) => r.json())
      .then(setSetup)
      .catch(() => null);
  }, []);

  async function createEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        slug: fd.get("slug"),
        event_date: fd.get("event_date"),
        location: fd.get("location"),
        description: fd.get("description"),
        price_per_photo_cents: Number(fd.get("price")) * 100,
        publish: fd.get("publish") === "on",
        cover_url: (fd.get("cover_url") as string) || "",
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setLastSlug(data.slug);
      setStatusOk(true);
      setStatus(
        `Carrera creada. Página pública: /eventos/${data.slug} — también aparece en Inicio (/)`
      );
    } else {
      setStatusOk(false);
      const hint = data.hint ? ` ${data.hint}` : "";
      setStatus(`${data.error ?? "Error"}${hint}`);
    }
  }

  async function uploadPhotos(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    const files = fd.getAll("photos") as File[];
    const eventSlug = fd.get("eventSlug") as string;

    const errors: string[] = [];
    let ok = 0;
    for (const file of files) {
      const body = new FormData();
      body.append("file", file);
      body.append("eventSlug", eventSlug);
      const res = await fetch("/api/upload", { method: "POST", body });
      let errMsg = `Error ${res.status}`;
      try {
        const data = await res.json();
        if (data.error) errMsg = data.error;
        if (data.hint) errMsg += ` — ${data.hint}`;
      } catch {
        const text = await res.text();
        if (text) errMsg = text.slice(0, 120);
      }
      if (res.ok) {
        ok++;
      } else {
        errors.push(`${file.name}: ${errMsg}`);
      }
    }
    setUploading(false);

    if (ok > 0 && autoAnalyze) {
      setAnalyzing(true);
      setStatus("Subidas OK. Analizando dorsales con IA (puede tardar varios minutos)…");
      let remaining = 1;
      let totalTagged = 0;
      let rounds = 0;
      while (remaining > 0 && rounds < 200) {
        const ar = await fetch("/api/admin/analyze-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventSlug, onlyPending: true, limit: 25 }),
        });
        const ad = await ar.json();
        if (!ar.ok) {
          setStatusOk(false);
          setStatus(
            `${ok} fotos subidas, análisis falló: ${ad.error}${ad.hint ? ` — ${ad.hint}` : ""}\nReiniciá npm run dev (OCR local).`
          );
          setAnalyzing(false);
          return;
        }
        totalTagged += ad.tagged ?? 0;
        remaining = ad.remaining ?? 0;
        setStatus(
          `IA: ${ad.processed} fotos en esta tanda · ${totalTagged} con dorsal · quedan ${remaining}…`
        );
        rounds++;
      }
      setAnalyzing(false);
      setStatusOk(true);
      setStatus(
        `Listo: ${ok} fotos subidas, ${totalTagged} con dorsal detectado.\nGalería: /eventos/${eventSlug}`
      );
      return;
    }

    setStatusOk(ok === files.length);
    if (ok === files.length) {
      setStatus(
        `Subidas ${ok}/${files.length} fotos.${!autoAnalyze ? " Activá IA abajo o en .env.local." : ""}\nGalería: /eventos/${eventSlug}`
      );
    } else if (ok > 0) {
      setStatus(
        `Subidas ${ok}/${files.length} (las demás ya están en la galería).\nReintentá solo las que fallaron:\n${errors.join("\n")}\n\nGalería: /eventos/${eventSlug}`
      );
    } else {
      setStatus(
        `Subidas 0/${files.length}. Errores:\n${errors.slice(0, 5).join("\n")}`
      );
    }
  }

  return (
    <div className="max-w-xl space-y-12">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          Panel interno
        </p>
        <h1 className="font-display mb-2 text-2xl font-bold">Panel del fotógrafo</h1>
        <p className="text-sm text-[var(--muted)]">
          Los corredores ven{" "}
          <a href="/" className="text-[var(--accent)] hover:underline">
            la página de inicio (/)
          </a>{" "}
          y la galería{" "}
          <code className="text-[var(--text)]">/eventos/tu-slug</code>. Acá cargás
          carreras y fotos.
        </p>
      </div>

      <BulkTagger />

      {setup && !setup.ready && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-semibold">Supabase no está conectado en el servidor</p>
          <p className="mt-1">
            Completá en <code>.env.local</code>:{" "}
            {setup.missing.join(", ")}
          </p>
          <p className="mt-2 text-red-300/90">
            Guardá el archivo, reiniciá la terminal con <code>npm run dev</code> y
            volvé a intentar.
          </p>
        </div>
      )}

      <form onSubmit={createEvent} className="space-y-4 rounded-xl border border-[var(--border)] p-6">
        <h2 className="font-semibold">Nueva carrera</h2>
        <Field label="Título" name="title" required />
        <Field label="URL (slug)" name="slug" placeholder="gp-mendoza-2026" required />
        <Field label="Fecha" name="event_date" type="date" required />
        <Field label="Lugar" name="location" />
        <Field label="Descripción" name="description" />
        <Field
          label="Portada (URL logo o foto, opcional)"
          name="cover_url"
          placeholder="https://..."
        />
        <Field label="Precio por foto ($)" name="price" type="number" defaultValue="5" required />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publish" defaultChecked />
          Publicar al crear
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-[var(--accent)] py-2 font-semibold text-black"
        >
          Crear carrera
        </button>
      </form>

      <EventCoverPanel defaultSlug={lastSlug} />

      <form onSubmit={uploadPhotos} className="space-y-4 rounded-xl border border-[var(--border)] p-6">
        <h2 className="font-semibold">Subir fotos</h2>
        <Field
          label="Slug de la carrera (copiá el de arriba al crear)"
          name="eventSlug"
          placeholder={lastSlug || "prueba2026-sanluis"}
          defaultValue={lastSlug}
          required
        />
        <p className="text-xs text-[var(--muted)]">
          Debe coincidir exacto con el slug de la carrera. Si creaste{" "}
          <code>prueba2026-sanluis</code>, no uses solo <code>prueba2026</code>.
        </p>
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">Archivos</label>
          <input
            type="file"
            name="photos"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            required
            className="w-full text-sm"
          />
        <p className="text-xs text-[var(--muted)]">
          Solo JPG, PNG, WebP o GIF (no .avif).
        </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoAnalyze}
            onChange={(e) => setAutoAnalyze(e.target.checked)}
          />
          Intentar OCR al subir (suele fallar — mejor etiquetar manual arriba)
        </label>
        <button
          type="submit"
          disabled={uploading || analyzing}
          className="w-full rounded-lg bg-[var(--accent)] py-2 font-semibold text-black disabled:opacity-50"
        >
          {uploading ? "Subiendo…" : "Subir y analizar dorsales"}
        </button>
      </form>

      <TagNumbersPanel />

      {status && (
        <p
          className={`whitespace-pre-wrap rounded-lg border p-4 text-sm ${
            statusOk
              ? "border-green-500/40 bg-green-500/10 text-green-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          {status}
        </p>
      )}

      <section className="text-sm text-[var(--muted)]">
        <h3 className="mb-2 font-medium text-[var(--text)]">Configuración necesaria</h3>
        <ul className="list-inside list-disc space-y-1">
          <li>Copiá <code>.env.example</code> a <code>.env.local</code></li>
          <li>Supabase: ejecutá <code>supabase/schema.sql</code></li>
          <li>Cloudinary: preset de subida sin firmar para el widget</li>
          <li>Stripe: webhook a <code>/api/webhooks/stripe</code></li>
        </ul>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-[var(--muted)]">{label}</label>
      <input
        name={name}
        type={type}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 outline-none focus:border-[var(--accent)]"
        {...rest}
      />
    </div>
  );
}
