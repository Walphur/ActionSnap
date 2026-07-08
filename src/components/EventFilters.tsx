"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { COLOR_FILTER_OPTIONS } from "@/lib/color-options";
import type { PhotoSortOrder } from "@/lib/sort-photos";

const SORT_OPTIONS: { value: PhotoSortOrder; label: string }[] = [
  { value: "default", label: "Relevancia" },
  { value: "dorsal-asc", label: "Número ↑" },
  { value: "dorsal-desc", label: "Número ↓" },
  { value: "newest", label: "Más recientes" },
];

export function EventFilters({
  eventSlug,
}: {
  eventSlug: string;
  /** Se mantiene por compatibilidad; el filtro de color aplica a todos los deportes. */
  sport?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const numero = params.get("numero") ?? "";
  const color = params.get("color") ?? "";
  const orden = (params.get("orden") as PhotoSortOrder) || "default";

  const showColorFilter = true;

  function buildUrl(next: { numero?: string; color?: string; orden?: string }) {
    const q = new URLSearchParams();
    const n = next.numero ?? numero;
    const c = next.color ?? color;
    const o = next.orden ?? orden;
    if (n) q.set("numero", n);
    if (c && c !== "todos") q.set("color", c);
    if (o && o !== "default") q.set("orden", o);
    const qs = q.toString();
    return `/eventos/${eventSlug}${qs ? `?${qs}` : ""}`;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const num = (fd.get("numero") as string)?.trim().replace(/\D/g, "");
    const col = (fd.get("color") as string) ?? "";
    const sort = (fd.get("orden") as string) ?? "default";
    router.push(
      buildUrl({
        numero: num || undefined,
        color: col || undefined,
        orden: sort || undefined,
      })
    );
  }

  const hasFilter = Boolean(numero || (color && color !== "todos") || (orden && orden !== "default"));

  return (
    <div className="buyer-filters">
      <form onSubmit={onSubmit}>
        <div className="buyer-filters__head">
          <p className="buyer-filters__head-title">Buscar por número</p>
          <p className="buyer-filters__head-hint">Filtrá y comprá en HD</p>
        </div>

        <div className="buyer-filters__grid">
          <Input
            label="Número / dorsal"
            name="numero"
            type="search"
            inputMode="numeric"
            placeholder="Ej. 27"
            defaultValue={numero}
          />

          {showColorFilter && (
            <Select label="Color" name="color" defaultValue={color || "todos"}>
              {COLOR_FILTER_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c === "todos" ? "Todos los colores" : c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </Select>
          )}

          <Select label="Ordenar" name="orden" defaultValue={orden}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>

          <div className="buyer-filters__actions">
            <Button type="submit" variant="primary">
              <Search className="h-4 w-4" aria-hidden />
              Buscar
            </Button>
            {hasFilter && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/eventos/${eventSlug}`)}
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
