"use client";

import { useCallback, useEffect, useState } from "react";
import { formatApiError } from "@/lib/zod-form";
import { uploadFilesParallel } from "@/lib/upload-batch";
import type { DashboardOverview, EventRow } from "@/types/event";

type NotifyFn = (msg: string, ok: boolean) => void;

export function usePhotographerDashboard(notify: NotifyFn) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [activeSlug, setActiveSlug] = useState("");
  const [mpReceiverId, setMpReceiverId] = useState("");
  const [photographerName, setPhotographerName] = useState("");
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [uploadAllSucceeded, setUploadAllSucceeded] = useState(false);

  const loadData = useCallback(async () => {
    async function fetchJson(url: string) {
      let res = await fetch(url, { cache: "no-store" });
      if (res.status === 401) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        res = await fetch(url, { cache: "no-store" });
      }
      return { res, data: await res.json() };
    }

    const [ev, ov, prof] = await Promise.all([
      fetchJson("/api/photographer/events"),
      fetchJson("/api/photographer/overview"),
      fetchJson("/api/photographer/profile"),
    ]);

    if (ev.res.ok && ev.data.events) {
      setEvents(ev.data.events);
      setActiveSlug((prev) => prev || ev.data.events[0]?.slug || "");
    } else if (!ev.res.ok) {
      notify(formatApiError(ev.data.error), false);
    }

    if (ov.res.ok) setOverview(ov.data);
    if (prof.res.ok && !prof.data.error) {
      setMpReceiverId(prof.data.mp_receiver_id ?? "");
      setPhotographerName(prof.data.full_name ?? "");
    }
  }, [notify]);

  useEffect(() => {
    void (async () => {
      await fetch("/api/photographer/bootstrap", { method: "POST" });
      await loadData();
    })();
  }, [loadData]);

  const createEvent = useCallback(
    async (fd: FormData) => {
      setCreating(true);
      try {
        const location = String(fd.get("location") ?? "").trim();
        const description = String(fd.get("description") ?? "").trim();
        const coverUrl = String(fd.get("cover_url") ?? "").trim();

        const res = await fetch("/api/photographer/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: fd.get("title"),
            slug: fd.get("slug"),
            sport: fd.get("sport"),
            event_date: fd.get("event_date"),
            ...(location ? { location } : {}),
            ...(description ? { description } : {}),
            price_per_photo_cents: Number(fd.get("price")) * 100,
            publish: fd.get("publish") === "on",
            ...(coverUrl ? { cover_url: coverUrl } : {}),
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setActiveSlug(data.slug);
          notify(`Evento creado → /eventos/${data.slug}`, true);
          await loadData();
          return { ok: true as const, slug: data.slug };
        }

        notify(
          data.hint ? `${formatApiError(data.error)} · ${data.hint}` : formatApiError(data.error),
          false
        );
        return { ok: false as const };
      } finally {
        setCreating(false);
      }
    },
    [loadData, notify]
  );

  const uploadPhotos = useCallback(
    async (files: File[]) => {
      const slug = activeSlug.trim();
      if (!slug) {
        notify("Elegí o creá un evento primero.", false);
        return;
      }

      setUploading(true);
      setUploadAllSucceeded(false);
      setUploadProgress({ done: 0, total: files.length });

      const errors: string[] = [];
      let ok = 0;
      let done = 0;

      await uploadFilesParallel(files, 4, async (file) => {
        const body = new FormData();
        body.append("file", file);
        body.append("eventSlug", slug);
        const res = await fetch("/api/photographer/upload", { method: "POST", body });
        let errMsg = "No se pudo subir el archivo";
        try {
          const data = await res.json();
          if (data.error) errMsg = formatApiError(data.error);
        } catch {
          /* ignore */
        }
        if (res.ok) ok++;
        else errors.push(`${file.name}: ${errMsg}`);
        done++;
        setUploadProgress({ done, total: files.length });
      });

      setUploading(false);
      await loadData();

      const allOk = ok === files.length && ok > 0;
      setUploadAllSucceeded(allOk);

      if (ok === files.length) {
        notify(`${ok} fotos subidas con marca de agua.`, true);
      } else if (ok > 0) {
        notify(`${ok}/${files.length} subidas. ${errors[0] ?? ""}`, false);
      } else {
        notify(errors.join("\n") || "No se pudieron subir las fotos. Revisá el formato (JPG/PNG/WebP) e intentá de nuevo.", false);
      }
    },
    [activeSlug, loadData, notify]
  );

  const setEventPublished = useCallback(
    async (slug: string, isPublished: boolean) => {
      const res = await fetch("/api/photographer/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, is_published: isPublished }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(formatApiError(data.error), false);
        return;
      }
      notify(isPublished ? "Evento publicado." : "Evento pausado: ya no es visible al público.", true);
      await loadData();
    },
    [loadData, notify]
  );

  const deleteEvent = useCallback(
    async (slug: string, title: string) => {
      if (!window.confirm(`¿Eliminar "${title}" y todas sus fotos? Esta acción no se puede deshacer.`)) {
        return;
      }
      const res = await fetch(`/api/photographer/events?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        notify(formatApiError(data.error), false);
        return;
      }
      setActiveSlug((prev) => (prev === slug ? "" : prev));
      notify(`Evento "${title}" eliminado.`, true);
      await loadData();
    },
    [loadData, notify]
  );

  return {
    events,
    overview,
    activeSlug,
    mpReceiverId,
    photographerName,
    creating,
    uploading,
    uploadProgress,
    uploadAllSucceeded,
    setActiveSlug,
    loadData,
    createEvent,
    uploadPhotos,
    setEventPublished,
    deleteEvent,
  };
}
