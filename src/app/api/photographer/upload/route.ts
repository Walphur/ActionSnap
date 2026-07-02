import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { resolveWatermarkForUser } from "@/lib/resolve-photographer-watermark";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { insertPhotoRow, photosSchemaHint } from "@/lib/photos-db";
import { uploadPhotographerPhoto } from "@/lib/supabase/photo-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

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
    const maxMb = 25;
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

    const uploaded = await uploadPhotographerPhoto({
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
      await service.storage.from("hd-originals").remove([uploaded.storagePath]);
      await service.storage.from("public-previews").remove([uploaded.storagePath]);
      const hint = photoError ? photosSchemaHint(photoError) : undefined;
      return NextResponse.json(
        { error: photoError ?? "Error insertando foto", hint },
        { status: 500 }
      );
    }

    const photo = { id: insertedPhotoId };

    if (!event.cover_url) {
      await service.from("events").update({ cover_url: uploaded.previewUrl }).eq("id", event.id);
    }

    return NextResponse.json({
      id: photo.id,
      preview: uploaded.previewUrl,
      storage: "supabase",
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
