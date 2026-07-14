import { isJpegFile, makeClientPreview } from "@/lib/client-preview-image";
import { formatApiError } from "@/lib/zod-form";

type UploadOk = { ok: true };
type UploadFail = { ok: false; error: string };

/**
 * JPG: HD → R2 directo (presign), preview chico → Render solo para marca de agua.
 * PNG/WebP u otros: FormData clásico por /api/photographer/upload.
 */
export async function uploadPhotographerFile(
  file: File,
  eventSlug: string
): Promise<UploadOk | UploadFail> {
  if (isJpegFile(file)) {
    try {
      return await uploadJpegDirectToR2(file, eventSlug);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error en subida directa";
      if (/cors|failed to fetch|network|R2_DISABLED|USE_PROXY|presign|CORS/i.test(msg)) {
        return uploadViaRenderProxy(file, eventSlug);
      }
      return { ok: false, error: msg };
    }
  }

  return uploadViaRenderProxy(file, eventSlug);
}

async function uploadJpegDirectToR2(file: File, eventSlug: string): Promise<UploadOk | UploadFail> {
  const presignRes = await fetch("/api/photographer/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventSlug,
      fileName: file.name,
      contentType: "image/jpeg",
      byteSize: file.size,
    }),
  });

  const presign = await readJson(presignRes);
  if (!presignRes.ok) {
    if (
      presignRes.status === 503 ||
      presign.code === "R2_DISABLED" ||
      presign.code === "USE_PROXY"
    ) {
      return uploadViaRenderProxy(file, eventSlug);
    }
    return {
      ok: false,
      error: formatApiError(presign.error) || "No se pudo preparar la subida a R2",
    };
  }

  const putRes = await fetch(String(presign.uploadUrl), {
    method: "PUT",
    headers: { "Content-Type": String(presign.contentType || "image/jpeg") },
    body: file,
  });

  if (!putRes.ok) {
    const detail = await putRes.text().catch(() => "");
    throw new Error(
      detail
        ? `R2 PUT ${putRes.status}: ${detail.slice(0, 120)}`
        : `R2 PUT falló (${putRes.status}). Revisá CORS del bucket HD.`
    );
  }

  const preview = await makeClientPreview(file);
  const body = new FormData();
  body.append("eventSlug", eventSlug);
  body.append("photoId", String(presign.photoId));
  body.append("objectKey", String(presign.objectKey));
  body.append("preview", preview.blob, "preview.jpg");
  body.append("width", String(preview.width));
  body.append("height", String(preview.height));

  const completeRes = await fetch("/api/photographer/upload/complete", {
    method: "POST",
    body,
  });

  const complete = await readJson(completeRes);
  if (!completeRes.ok) {
    return {
      ok: false,
      error: formatApiError(complete.error) || "No se pudo finalizar la foto",
    };
  }

  return { ok: true };
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function uploadViaRenderProxy(
  file: File,
  eventSlug: string
): Promise<UploadOk | UploadFail> {
  const body = new FormData();
  body.append("file", file);
  body.append("eventSlug", eventSlug);
  const res = await fetch("/api/photographer/upload", { method: "POST", body });
  try {
    const data = await res.json();
    if (res.ok) return { ok: true };
    return { ok: false, error: formatApiError(data.error) || "No se pudo subir el archivo" };
  } catch {
    return { ok: false, error: "Respuesta inválida del servidor" };
  }
}
