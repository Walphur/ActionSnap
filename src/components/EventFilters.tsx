"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { COLOR_FILTER_OPTIONS } from "@/lib/color-options";

export function EventFilters({ eventSlug }: { eventSlug: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const numero = params.get("numero") ?? "";
  const color = params.get("color") ?? "";

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
    router.push(
      buildUrl({ numero: num || undefined, color: col || undefined })
    );
  }

  const hasFilter = Boolean(numero || (color && color !== "todos"));

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input
          name="numero"
          type="search"
          inputMode="numeric"
          placeholder="Dorsal (ej. 27)"
          defaultValue={numero}
          className="min-w-[140px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 outline-none focus:border-[var(--accent)]"
        />
        <select
          name="color"
          defaultValue={color || "todos"}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--accent)]"
        >
          {COLOR_FILTER_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c === "todos" ? "Color moto (todos)" : `Moto ${c}`}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-5 py-2 font-semibold text-black hover:bg-[var(--accent-hover)]"
        >
          Buscar
        </button>
        {hasFilter && (
          <button
            type="button"
            onClick={() => router.push(`/eventos/${eventSlug}`)}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]"
          >
            Ver todas
          </button>
        )}
      </div>
      <p className="text-xs text-[var(--muted)]">
        Un dorsal por búsqueda. El color filtra por la moto (aprox.).
      </p>
    </form>
  );
}
