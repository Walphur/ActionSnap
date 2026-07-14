import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getR2Config, hasR2, isR2TlsHandshakeError } from "@/lib/r2/client";
import { deleteR2Object, uploadPhotographerPhotoToR2 } from "@/lib/r2/photo-storage";
import { resolveWatermarkForUser } from "@/lib/resolve-photographer-watermark";
import { logError, logWarn } from "@/lib/safe-logger";
import { insertPhotoRow, photosSchemaHint } from "@/lib/photos-db";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  uploadPhotographerPhoto,
  type UploadedPhotoAssets,
} from "@/lib/supabase/photo-storage";

export const runtime = "nodejs";
export const maxDuration = 120;

async function cleanupFailedUpload(
  storage: "r2" | "supabase",
  storagePath: string,
  originalPath: string
) {
  if (storage === "r2") {
    const config = getR2Config();
    if (!config) return;
    await Promise.allSettled([
      deleteR2Object(config.bucketHd, storagePath),
      deleteR2Object(config.bucketPreview, storagePath),
    ]);
    return;
  }

  const service = createServiceClient();
  await Promise.allSettled([
    service.storage.from("hd-originals").remove([originalPath || storagePath]),
    service.storage.from("public-previews").remove([storagePath]),
  ]);
}

async function uploadPhotoAssets(params: {
  photographerId: string;
  eventId: string;
  photoId: string;
  rawBuffer: Buffer;
  mime: string;
  watermark: Awaited<ReturnType<typeof resolveWatermarkForUser>>;
}): Promise<UploadedPhotoAssets & { storage: "r2" | "supabase"; r2Pending?: boolean }> {
  if (hasR2()) {
    try {
      return await uploadPhotographerPhotoToR2(params);
    } catch (error) {
      if (isR2TlsHandshakeError(error)) {
        logError("r2-upload", "TLS handshake falló — fallback a Supabase (cuenta R2 nueva?)", {
          message: error instanceof Error ? error.message : String(error),
        });
      } else {
        logWarn("r2-upload", "R2 falló — fallback a Supabase para evitar cortar la subida", {
          message: error instanceof Error ? error.message : String(error),
        });
      }
      const uploaded = await uploadPhotographerPhoto(params);
      return { ...uploaded, storage: "supabase", r2Pending: true };
    }
  }

  const uploaded = await uploadPhotographerPhoto(params);
  return { ...uploaded, storage: "supabase" };
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const eventSlug = (form.get("eventSlug") as string | null)?.trim();

    if (!file || !eventSlug) {
      return NextResponse.json({ error: "Faltan archivo o eventSlug" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "photographer") {
      return NextResponse.json({ error: "Solo fotógrafos pueden subir fotos" }, { status: 403 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { error: `Formato .${ext} no soportado en ${file.name}`, hint: "Usá JPG o PNG." },
        { status: 400 }
      );
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, slug, cover_url, photographer_id")
      .eq("slug", eventSlug)
      .eq("photographer_id", user.id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        {
          error: `Evento "${eventSlug}" no existe`,
          hint: "Asegurate de que el slug exista y sea tuyo.",
        },
        { status: 404 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const maxMb = 40;
    if (rawBuffer.length > maxMb * 1024 * 1024) {
      return NextResponse.json(
        {
          error: `${file.name} pesa ${(rawBuffer.length / 1024 / 1024).toFixed(1)} MB`,
          hint: `Máx ${maxMb} MB`,
        },
        { status: 413 }
      );
    }

    const watermark = await resolveWatermarkForUser(user.id);
    const photoId = randomUUID();

    const uploaded = await uploadPhotoAssets({
      photographerId: user.id,
      eventId: event.id,
      photoId,
      rawBuffer,
      mime: file.type || "image/jpeg",
      watermark,
    });

    const service = createServiceClient();
    const { id: insertedPhotoId, error: photoError } = await insertPhotoRow(service, {
      id: photoId,
      event_id: event.id,
      photographer_id: user.id,
      cloudinary_public_id: uploaded.storagePath,
      preview_url: uploaded.previewUrl,
      original_url: uploaded.originalPath,
      width: uploaded.width,
      height: uploaded.height,
      ai_status: "skipped",
    });

    if (photoError || !insertedPhotoId) {
      await cleanupFailedUpload(uploaded.storage, uploaded.storagePath, uploaded.originalPath);
      const hint = photoError ? photosSchemaHint(photoError) : undefined;
      return NextResponse.json(
        { error: photoError ?? "Error insertando foto", hint },
        { status: 500 }
      );
    }

    if (!event.cover_url) {
      await service.from("events").update({ cover_url: uploaded.previewUrl }).eq("id", event.id);
    }

    return NextResponse.json({
      id: insertedPhotoId,
      preview: uploaded.previewUrl,
      storage: uploaded.storage,
      ...(uploaded.r2Pending ? { r2Pending: true } : {}),
      dorsales: [],
      ai: "skipped",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error de subida" },
      { status: 500 }
    );
  }
}
