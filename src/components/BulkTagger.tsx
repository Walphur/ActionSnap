"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCopy,
  ClipboardPaste,
  Keyboard,
  RotateCcw,
  Tags,
} from "lucide-react";
import { SUGGESTED_BIKE_COLORS, SUGGESTED_RIDER_COLORS } from "@/lib/color-options";
import { getDisplayPreviewUrl } from "@/lib/preview-url";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ColorInput } from "@/components/ui/ColorInput";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/ui/cn";
import { toast } from "@/components/ui/toast";

type PhotoRow = {
  id: string;
  preview_url: string;
  original_url: string;
  cloudinary_public_id: string;
  ai_status: string;
  bike_color: string | null;
  rider_color: string | null;
  photo_numbers: { number: string }[];
};

type TagClipboard = {
  dorsal: string;
  bikeColor: string;
  riderColor: string;
};

type HistoryEntry = {
  photoId: string;
  previous: Pick<PhotoRow, "photo_numbers" | "bike_color" | "rider_color" | "ai_status">;
};

type FilterMode = "all" | "untagged" | "tagged";

function filterPhotos(list: PhotoRow[], mode: FilterMode) {
  if (mode === "untagged") return list.filter((p) => !isTagged(p));
  if (mode === "tagged") return list.filter((p) => isTagged(p));
  return list;
}

function isTagged(photo: PhotoRow) {
  return (photo.photo_numbers?.length ?? 0) > 0;
}

function fieldsFromPhoto(photo: PhotoRow) {
  return {
    dorsal: photo.photo_numbers?.[0]?.number ?? "",
    bikeColor: photo.bike_color ?? "",
    riderColor: photo.rider_color ?? "",
  };
}

export function BulkTagger({ defaultSlug = "" }: { defaultSlug?: string }) {
  const [slug, setSlug] = useState(defaultSlug);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [index, setIndex] = useState(0);
  const [dorsal, setDorsal] = useState("");
  const [bikeColor, setBikeColor] = useState("");
  const [riderColor, setRiderColor] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("untagged");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [clipboard, setClipboard] = useState<TagClipboard | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const dorsalRef = useRef<HTMLInputElement>(null);
  const lastAnchorId = useRef<string | null>(null);

  useEffect(() => {
    if (defaultSlug) setSlug(defaultSlug);
  }, [defaultSlug]);

  const filteredPhotos = useMemo(() => {
    if (filter === "untagged") return photos.filter((p) => !isTagged(p));
    if (filter === "tagged") return photos.filter((p) => isTagged(p));
    return photos;
  }, [photos, filter]);

  const current = filteredPhotos[index];
  const taggedCount = photos.filter(isTagged).length;
  const pendingCount = photos.length - taggedCount;

  const dorsalSuggestions = useMemo(() => {
    const seen = new Set<string>();
    for (const p of photos) {
      const n = p.photo_numbers?.[0]?.number;
      if (n) seen.add(n);
    }
    if (dorsal.trim()) seen.add(dorsal.trim());
    return Array.from(seen).sort((a, b) => Number(a) - Number(b));
  }, [photos, dorsal]);

  const fillFields = useCallback((photo: PhotoRow) => {
    const f = fieldsFromPhoto(photo);
    setDorsal(f.dorsal);
    setBikeColor(f.bikeColor);
    setRiderColor(f.riderColor);
  }, []);

  const load = useCallback(async () => {
    if (!slug.trim()) {
      setMsg("Elegí un evento activo arriba");
      return;
    }
    setMsg(null);
    const res = await fetch(`/api/photographer/photos?eventSlug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Error al cargar fotos");
      return;
    }
    const list = (data.photos ?? []) as PhotoRow[];
    setPhotos(list);
    setIndex(0);
    setSelectedIds(new Set());
    setHistory([]);
    const firstUntagged = list.find((p) => !isTagged(p)) ?? list[0];
    if (firstUntagged) fillFields(firstUntagged);
    const pending = list.filter((p) => !isTagged(p)).length;
    setMsg(
      pending > 0
        ? `${list.length} fotos · ${pending} sin etiquetar — empezá por las pendientes`
        : `${list.length} fotos · todas etiquetadas`
    );
    setFilter(pending > 0 ? "untagged" : "all");
  }, [slug, fillFields]);

  useEffect(() => {
    if (defaultSlug) void load();
  }, [defaultSlug, load]);

  useEffect(() => {
    dorsalRef.current?.focus();
  }, [index, current?.id]);

  const pushHistory = useCallback((photo: PhotoRow) => {
    setHistory((prev) => [
      {
        photoId: photo.id,
        previous: {
          photo_numbers: photo.photo_numbers,
          bike_color: photo.bike_color,
          rider_color: photo.rider_color,
          ai_status: photo.ai_status,
        },
      },
      ...prev.slice(0, 19),
    ]);
  }, []);

  const applyTagToPhotos = useCallback(
    async (
      photoIds: string[],
      num: string
    ): Promise<{ ok: boolean; updated: PhotoRow[] }> => {
      if (photoIds.length === 0) return { ok: false, updated: photos };

      const res = await fetch("/api/photographer/tag-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(photoIds.length === 1 ? { photoId: photoIds[0] } : { photoIds }),
          dorsal: num,
          bike_color: bikeColor.trim() || null,
          rider_color: riderColor.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? "No se pudo guardar el dorsal. Revisá el número e intentá de nuevo.";
        toast.error(message);
        setMsg(message);
        return { ok: false, updated: photos };
      }

      const idSet = new Set(photoIds);
      const updated = photos.map((p) =>
        idSet.has(p.id)
          ? {
              ...p,
              ai_status: "manual",
              bike_color: bikeColor.trim() || null,
              rider_color: riderColor.trim() || null,
              photo_numbers: [{ number: num }],
            }
          : p
      );
      setPhotos(updated);
      return { ok: true, updated };
    },
    [bikeColor, riderColor, photos]
  );

  const advanceAfterSave = useCallback(
    (updated: PhotoRow[], num: string, andNext: boolean) => {
      const done = updated.filter(isTagged).length;
      if (!andNext) {
        setMsg(`Guardado #${num} — ${done}/${updated.length} listas`);
        toast.success(`Dorsal #${num} guardado`);
        return;
      }

      const nextFiltered = filterPhotos(updated, filter);
      if (nextFiltered.length === 0) {
        if (filter === "untagged") {
          setFilter("all");
          setIndex(0);
          if (updated[0]) fillFields(updated[0]);
          setMsg("¡Todas las fotos etiquetadas!");
          toast.success("Completaste todas las pendientes");
        } else {
          setMsg(`Guardado #${num} — no hay más fotos en esta vista`);
        }
        return;
      }

      const nextIndex =
        filter === "untagged" ? Math.min(index, nextFiltered.length - 1) : Math.min(index + 1, nextFiltered.length - 1);
      setIndex(nextIndex);
      fillFields(nextFiltered[nextIndex]!);
      setMsg(`Guardado #${num} — siguiente (${done}/${updated.length})`);
      toast.success(`Dorsal #${num} guardado — siguiente foto`);
    },
    [filter, index, fillFields]
  );

  const save = useCallback(
    async (andNext: boolean) => {
      if (!current) return;
      const num = dorsal.trim().replace(/\D/g, "");
      if (!num) {
        const message = "Escribí el dorsal visible (ej. 27)";
        setMsg(message);
        toast.error(message);
        return;
      }
      setSaving(true);
      pushHistory(current);
      const result = await applyTagToPhotos([current.id], num);
      if (result.ok) {
        advanceAfterSave(result.updated, num, andNext);
      }
      setSaving(false);
    },
    [current, dorsal, pushHistory, applyTagToPhotos, advanceAfterSave]
  );

  const applyToSelection = useCallback(async () => {
    const num = dorsal.trim().replace(/\D/g, "");
    if (!num) {
      setMsg("Escribí el dorsal antes de aplicar en lote");
      return;
    }
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      setMsg("Seleccioná fotos en la tira de abajo (Shift+clic para rango)");
      return;
    }
    setBulkLoading(true);
    for (const id of ids) {
      const photo = photos.find((p) => p.id === id);
      if (photo) pushHistory(photo);
    }
    await applyTagToPhotos(ids, num);
    setBulkLoading(false);
    setSelectedIds(new Set());
    setMsg(`Etiqueta #${num} aplicada a ${ids.length} fotos`);
    toast.success(`Dorsal #${num} aplicado a ${ids.length} fotos`);
  }, [dorsal, selectedIds, photos, pushHistory, applyTagToPhotos]);

  const undo = useCallback(async () => {
    const entry = history[0];
    if (!entry) {
      setMsg("No hay acciones para deshacer");
      return;
    }

    const photo = photos.find((p) => p.id === entry.photoId);
    if (!photo) return;

    if ((entry.previous.photo_numbers?.length ?? 0) === 0) {
      setMsg("Deshacer borrado masivo no disponible — re-etiquetá manualmente");
      setHistory((prev) => prev.slice(1));
      return;
    }

    const num = entry.previous.photo_numbers[0]?.number;
    if (!num) return;

    const res = await fetch("/api/photographer/tag-numbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photoId: entry.photoId,
        dorsal: num,
        bike_color: entry.previous.bike_color,
        rider_color: entry.previous.rider_color,
      }),
    });
    if (!res.ok) {
      setMsg("No se pudo deshacer");
      return;
    }

    setPhotos((prev) =>
      prev.map((p) =>
        p.id === entry.photoId
          ? {
              ...p,
              ...entry.previous,
              ai_status: entry.previous.ai_status,
            }
          : p
      )
    );
    setHistory((prev) => prev.slice(1));
    setMsg(`Deshecho — restaurado #${num}`);
  }, [history, photos]);

  const go = useCallback(
    (delta: number) => {
      const next = index + delta;
      if (next < 0 || next >= filteredPhotos.length) return;
      setIndex(next);
      fillFields(filteredPhotos[next]);
    },
    [index, filteredPhotos, fillFields]
  );

  const copyTag = useCallback(() => {
    const payload: TagClipboard = { dorsal, bikeColor, riderColor };
    setClipboard(payload);
    setMsg(`Copiado dorsal #${dorsal || "—"} y colores`);
  }, [dorsal, bikeColor, riderColor]);

  const pasteTag = useCallback(() => {
    if (!clipboard) {
      setMsg("Nada en el portapapeles — usá Ctrl+C primero");
      return;
    }
    setDorsal(clipboard.dorsal);
    setBikeColor(clipboard.bikeColor);
    setRiderColor(clipboard.riderColor);
    setMsg(`Pegado dorsal #${clipboard.dorsal || "—"}`);
    dorsalRef.current?.focus();
  }, [clipboard]);

  const toggleSelect = useCallback(
    (photoId: string, shiftKey: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (shiftKey && lastAnchorId.current) {
          const ids = filteredPhotos.map((p) => p.id);
          const a = ids.indexOf(lastAnchorId.current);
          const b = ids.indexOf(photoId);
          if (a >= 0 && b >= 0) {
            const [start, end] = a < b ? [a, b] : [b, a];
            for (let i = start; i <= end; i++) next.add(ids[i]);
            return next;
          }
        }
        if (next.has(photoId)) next.delete(photoId);
        else next.add(photoId);
        lastAnchorId.current = photoId;
        return next;
      });
    },
    [filteredPhotos]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inField =
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA";

      if (e.key === "/" && !inField) {
        e.preventDefault();
        dorsalRef.current?.focus();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "c" && !inField) {
        e.preventDefault();
        copyTag();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && !inField) {
        e.preventDefault();
        pasteTag();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        void undo();
        return;
      }

      if (inField && e.key !== "Enter") return;

      if (e.key === "ArrowLeft" || e.key === "j") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight" || e.key === "k") {
        e.preventDefault();
        go(1);
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void save(true);
      } else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        void save(false);
      } else if (e.key === "s" && !inField) {
        e.preventDefault();
        go(1);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, save, copyTag, pasteTag, undo]);

  useEffect(() => {
    if (index >= filteredPhotos.length) {
      setIndex(Math.max(0, filteredPhotos.length - 1));
    }
  }, [filteredPhotos.length, index]);

  async function clearBadTags() {
    if (!confirm("¿Borrar todos los dorsales y colores de este evento?")) return;
    setMsg("Limpiando…");
    const res = await fetch("/api/photographer/reset-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventSlug: slug }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Error");
      return;
    }
    await load();
    setMsg("Etiquetas borradas — cargá dorsal y color a mano");
  }

  return (
    <div className="ds-bulk-tagger">
      <div className="ds-bulk-tagger__toolbar">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="info">
            <Tags className="h-3 w-3" aria-hidden />
            Flujo oficial
          </Badge>
          <span className="ds-caption">
            {taggedCount}/{photos.length} etiquetadas
            {pendingCount > 0 ? ` · ${pendingCount} pendientes` : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => void load()}>
            Recargar
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowShortcuts((v) => !v)}>
            <Keyboard className="h-4 w-4" aria-hidden />
            Atajos
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={clearBadTags}>
            Limpiar todo
          </Button>
        </div>
      </div>

      {showShortcuts && (
        <div className="ds-bulk-tagger__shortcuts ds-caption">
          <span>
            <kbd>Enter</kbd> guardar y siguiente
          </span>
          <span>
            <kbd>Shift+Enter</kbd> guardar
          </span>
          <span>
            <kbd>←</kbd>/<kbd>→</kbd> o <kbd>J</kbd>/<kbd>K</kbd> navegar
          </span>
          <span>
            <kbd>S</kbd> saltar
          </span>
          <span>
            <kbd>/</kbd> foco dorsal
          </span>
          <span>
            <kbd>Ctrl+C</kbd>/<kbd>Ctrl+V</kbd> copiar/pegar etiqueta
          </span>
          <span>
            <kbd>Ctrl+Z</kbd> deshacer
          </span>
          <span>Shift+clic rango en miniaturas</span>
        </div>
      )}

      <div className="ds-bulk-tagger__filters">
        {(
          [
            { mode: "untagged" as const, label: "Pendientes" },
            { mode: "all" as const, label: "Todas" },
            { mode: "tagged" as const, label: "Etiquetadas" },
          ] as const
        ).map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            className="ds-chip"
            data-selected={filter === mode || undefined}
            onClick={() => {
              setFilter(mode);
              setIndex(0);
              const first = filterPhotos(photos, mode)[0];
              if (first) fillFields(first);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {photos.length > 0 && current && (
        <>
          <p className="ds-caption text-[var(--color-primary)]">
            Foto {index + 1} de {filteredPhotos.length}
            {selectedIds.size > 0 ? ` · ${selectedIds.size} seleccionadas` : ""}
          </p>

          <div className="ds-bulk-tagger__viewer">
            <img
              src={getDisplayPreviewUrl(current)}
              alt="Foto actual"
              className="ds-bulk-tagger__image"
            />
          </div>

          <div className="ds-bulk-tagger__fields">
            <div className="ds-bulk-tagger__dorsal">
              <Input
                ref={dorsalRef}
                label="Dorsal visible"
                value={dorsal}
                onChange={(e) => setDorsal(e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder="27"
                list="dorsal-suggestions"
                className="ds-bulk-tagger__dorsal-input"
              />
              <datalist id="dorsal-suggestions">
                {dorsalSuggestions.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>
            <ColorInput
              id="bulk-bike-color"
              label="Color moto"
              value={bikeColor}
              onChange={setBikeColor}
              suggestions={SUGGESTED_BIKE_COLORS}
              placeholder="ej. rojo flúor"
            />
            <ColorInput
              id="bulk-rider-color"
              label="Color piloto"
              value={riderColor}
              onChange={setRiderColor}
              suggestions={SUGGESTED_RIDER_COLORS}
              placeholder="ej. azul Francia"
            />
          </div>

          <div className="ds-bulk-tagger__actions">
            <Button type="button" variant="secondary" size="sm" onClick={() => go(-1)} disabled={index === 0}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Anterior
            </Button>
            <Button type="button" variant="primary" loading={saving} onClick={() => void save(true)}>
              Guardar y siguiente
            </Button>
            <Button type="button" variant="secondary" loading={saving} onClick={() => void save(false)}>
              Guardar
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => go(1)} disabled={index >= filteredPhotos.length - 1}>
              Saltar
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={copyTag}>
              <ClipboardCopy className="h-4 w-4" aria-hidden />
              Copiar
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={pasteTag}>
              <ClipboardPaste className="h-4 w-4" aria-hidden />
              Pegar
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => void undo()} disabled={history.length === 0}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Deshacer
            </Button>
          </div>

          {selectedIds.size > 1 && (
            <div className="ds-bulk-tagger__bulk-bar">
              <p className="ds-body">
                Aplicar dorsal <strong>#{dorsal || "?"}</strong> a {selectedIds.size} fotos
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={bulkLoading}
                onClick={() => void applyToSelection()}
              >
                Aplicar en lote
              </Button>
            </div>
          )}

          <div className="ds-bulk-tagger__strip" role="list" aria-label="Miniaturas del evento">
            {filteredPhotos.map((photo, i) => {
              const tagged = isTagged(photo);
              const active = photo.id === current.id;
              const selected = selectedIds.has(photo.id);
              return (
                <button
                  key={photo.id}
                  type="button"
                  role="listitem"
                  className={cn(
                    "ds-bulk-tagger__thumb",
                    active && "ds-bulk-tagger__thumb--active",
                    selected && "ds-bulk-tagger__thumb--selected",
                    tagged && "ds-bulk-tagger__thumb--tagged"
                  )}
                  onClick={(e) => {
                    if (e.shiftKey || e.ctrlKey || e.metaKey) {
                      toggleSelect(photo.id, e.shiftKey);
                    } else {
                      setIndex(i);
                      fillFields(photo);
                      lastAnchorId.current = photo.id;
                    }
                  }}
                  title={tagged ? `Dorsal ${photo.photo_numbers[0]?.number}` : "Sin etiquetar"}
                  aria-label={
                    tagged
                      ? `Foto con dorsal ${photo.photo_numbers[0]?.number}`
                      : "Foto sin etiquetar"
                  }
                  aria-current={active ? "true" : undefined}
                >
                  <img src={getDisplayPreviewUrl(photo)} alt="" loading="lazy" />
                  {tagged && (
                    <span className="ds-bulk-tagger__thumb-badge">{photo.photo_numbers[0]?.number}</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {photos.length === 0 && slug && (
        <p className="ds-caption mt-2">Cargá fotos del evento o recargá cuando termines de subir.</p>
      )}

      {msg && <p className="ds-bulk-tagger__msg ds-caption">{msg}</p>}
    </div>
  );
}
