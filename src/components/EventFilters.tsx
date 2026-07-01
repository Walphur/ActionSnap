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
    <div className="event-filters-sticky">
      <form onSubmit={onSubmit} className="search-panel">
      <p className="font-display text-xl font-bold uppercase md:text-2xl">
        Encontrá tus fotos
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Ingresá tu dorsal para filtrar la galería de este evento.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Número de dorsal
          </label>
          <input
            name="numero"
            type="search"
            inputMode="numeric"
            placeholder="Ej. 27"
            defaultValue={numero}
            className="field-input field-input--hero field-input--dorsal-mobile text-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40"
          />
        </div>
        {showColorFilter && (
          <div className="sm:w-48">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Color moto
            </label>
            <select
              name="color"
              defaultValue={color || "todos"}
              className="field-input h-[52px]"
            >
              {COLOR_FILTER_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c === "todos" ? "Todos" : c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-2 sm:pb-0">
          <button type="submit" className="btn-primary h-[52px] flex-1 px-8 sm:flex-none">
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
    </div>
  );
}
