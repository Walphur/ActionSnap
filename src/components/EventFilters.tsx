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
  { value: "dorsal-asc", label: "Dorsal ↑" },
  { value: "dorsal-desc", label: "Dorsal ↓" },
  { value: "newest", label: "Más recientes" },
];

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
  const orden = (params.get("orden") as PhotoSortOrder) || "default";

  const showColorFilter = (sport ?? "").toLowerCase() === "motocross";

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
        <p className="ds-overline">Encontrá tus fotos</p>
        <h2 className="ds-h3 mt-1">Buscar por dorsal</h2>
        <p className="ds-caption mt-1 mb-4">
          Filtrá la galería y comprá en HD al instante.
        </p>

        <div className="buyer-filters__grid">
          <Input
            label="Número de dorsal"
            name="numero"
            type="search"
            inputMode="numeric"
            placeholder="Ej. 27"
            defaultValue={numero}
          />

          {showColorFilter && (
            <Select label="Color moto" name="color" defaultValue={color || "todos"}>
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
