"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { COLOR_FILTER_OPTIONS } from "@/lib/color-options";

export function EventFilters({
  eventSlug,
  sport,
}: {
  eventSlug: string;
  sport?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const numero = params.get("numero") ?? "";
  const color = params.get("color") ?? "";

  const showColorFilter = (sport ?? "").toLowerCase() === "motocross";

  function buildUrl(next: { numero?: string; color?: string }) {
    const q = new URLSearchParams();
    const n = next.numero ?? numero;
    const c = next.color ?? color;
    if (n) q.set("numero", n);
    if (c && c !== "todos") q.set("color", c);
    const qs = q.toString();
    return `/eventos/${eventSlug}${qs ? `?${qs}` : ""}`;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const num = (fd.get("numero") as string)?.trim().replace(/\D/g, "");
    const col = (fd.get("color") as string) ?? "";
    router.push(buildUrl({ numero: num || undefined, color: col || undefined }));
  }

  const hasFilter = Boolean(numero || (color && color !== "todos"));

  return (
    <form onSubmit={onSubmit} className="card p-5 md:p-6">
      <p className="mb-4 font-display text-lg font-bold">Encontrá tus fotos</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Tu dorsal
          </label>
          <input
            name="numero"
            type="search"
            inputMode="numeric"
            placeholder="Ej. 27"
            defaultValue={numero}
            className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-lg font-bold outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)]"
          />
        </div>
          {showColorFilter && (
            <div className="sm:w-44">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Color moto
              </label>
              <select
                name="color"
                defaultValue={color || "todos"}
                className="h-[52px] w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-3 outline-none focus:border-[var(--accent)]"
              >
                {COLOR_FILTER_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c === "todos" ? "Todos" : c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        <div className="flex gap-2 sm:flex-col sm:justify-end">
          <button type="submit" className="btn-primary h-[52px] flex-1 sm:flex-none sm:px-8">
            Buscar
          </button>
          {hasFilter && (
            <button
              type="button"
              onClick={() => router.push(`/eventos/${eventSlug}`)}
              className="btn-secondary h-[52px] flex-1 sm:flex-none"
            >
              Ver todas
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
