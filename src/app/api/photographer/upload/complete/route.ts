import { NextResponse } from "next/server";
import { configureSharpForLowMemory } from "@/lib/compress-image";
import { deleteR2Object } from "@/lib/r2/photo-storage";
import { getR2Config } from "@/lib/r2/client";
import { finalizeDirectR2Upload, r2DirectUploadEnabled } from "@/lib/r2/presign-upload";
import { resolveWatermarkForUser } from "@/lib/resolve-photographer-watermark";
import { insertPhotoRow, photosSchemaHint } from "@/lib/photos-db";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

configureSharpForLowMemory();

const MAX_PREVIEW_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    if (!r2DirectUploadEnabled()) {
      return NextResponse.json(
        { error: "R2 no configurado", code: "R2_DISABLED" },
        { status: 503 }
      );
    }

    const form = await request.formData();
    const eventSlug = (form.get("eventSlug") as string | null)?.trim();
    const photoId = (form.get("photoId") as string | null)?.trim();
    const objectKey = (form.get("objectKey") as string | null)?.trim();
    const preview = form.get("preview") as File | null;
    const widthRaw = form.get("width");
    const heightRaw = form.get("height");

    if (!eventSlug || !photoId || !objectKey || !preview) {
      return NextResponse.json(
        { error: "Faltan eventSlug, photoId, objectKey o preview" },
        { status: 400 }
      );
    }

    if (preview.size > MAX_PREVIEW_BYTES) {
      return NextResponse.json({ error: "Preview demasiado grande" }, { status: 413 });
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
      return NextResponse.json({ error: "Solo fotógrafos" }, { status: 403 });
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, slug, cover_url, photographer_id")
      .eq("slug", eventSlug)
      .eq("photographer_id", user.id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: `Evento "${eventSlug}" no existe` }, { status: 404 });
    }

    const expectedPrefix = `${user.id}/${event.id}/`;
    if (!objectKey.startsWith(expectedPrefix) || !objectKey.endsWith(`/${photoId}.jpg`)) {
      return NextResponse.json({ error: "objectKey no coincide con el evento" }, { status: 400 });
    }

    const width =
      typeof widthRaw === "string" && widthRaw ? Number.parseInt(widthRaw, 10) : null;
    const height =
      typeof heightRaw === "string" && heightRaw ? Number.parseInt(heightRaw, 10) : null;

    const watermark = await resolveWatermarkForUser(user.id);
    const previewBuffer = Buffer.from(await preview.arrayBuffer());

    const uploaded = await finalizeDirectR2Upload({
      photographerId: user.id,
      eventId: event.id,
      photoId,
      objectKey,
      previewBuffer,
      watermark,
      width: Number.isFinite(width) ? width : null,
      height: Number.isFinite(height) ? height : null,
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
      const config = getR2Config();
      if (config) {
        await Promise.allSettled([
          deleteR2Object(config.bucketHd, uploaded.storagePath),
          deleteR2Object(config.bucketPreview, uploaded.storagePath),
        ]);
      }
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
      mode: "direct-r2",
      dorsales: [],
      ai: "skipped",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al finalizar subida" },
      { status: 500 }
    );
  }
}
