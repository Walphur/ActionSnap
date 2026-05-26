import { NextResponse } from "next/server";
import { configureCloudinary, previewUrl } from "@/lib/cloudinary";
import { createServiceClient } from "@/lib/supabase/server";
import { tagPhotoWithAI, hasOpenAI } from "@/lib/analyze-photo";
import { hasAnyDetector } from "@/lib/detect-numbers";
import { compressImage } from "@/lib/compress-image";
import { hasCloudinary, uploadToSupabaseStorage } from "@/lib/storage";

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

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        {
          error: `Formato .${ext} no soportado en ${file.name}`,
          hint: "Usá JPG o PNG. Convertí archivos .avif antes de subir.",
        },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: event } = await supabase
      .from("events")
      .select("id, slug, cover_url")
      .eq("slug", eventSlug)
      .single();

    if (!event) {
      return NextResponse.json(
        {
          error: `Carrera "${eventSlug}" no existe`,
          hint: "El slug debe ser exacto (ej. prueba2026-sanluis, no solo prueba2026). Mirá el slug al crear la carrera.",
        },
        { status: 404 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const maxMb = 8;
    if (rawBuffer.length > maxMb * 1024 * 1024) {
      return NextResponse.json(
        {
          error: `${file.name} pesa ${(rawBuffer.length / 1024 / 1024).toFixed(1)} MB (máx ${maxMb} MB)`,
          hint: "La app la comprime sola si es menor; exportá JPG más chico o sacá esa foto del lote.",
        },
        { status: 413 }
      );
    }

    let buffer: Buffer;
    try {
      buffer = await compressImage(rawBuffer, file.type || "image/jpeg");
    } catch (e) {
      return NextResponse.json(
        {
          error:
            e instanceof Error
              ? e.message
              : `No se pudo procesar ${file.name}`,
          hint: "Probá otra foto JPG/PNG o más liviana.",
        },
        { status: 400 }
      );
    }
    let publicId: string;
    let secureUrl: string;
    let preview: string;
    let width: number | null = null;
    let height: number | null = null;

    if (hasCloudinary()) {
      const cloudinary = configureCloudinary();
      const uploaded = await new Promise<{
        public_id: string;
        secure_url: string;
        width: number;
        height: number;
      }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `moto-fotos/${eventSlug}`, resource_type: "image" },
          (err, result) => {
            if (err || !result) reject(err ?? new Error("Upload failed"));
            else
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
                width: result.width,
                height: result.height,
              });
          }
        );
        stream.end(buffer);
      });
      publicId = uploaded.public_id;
      secureUrl = uploaded.secure_url;
      preview = previewUrl(uploaded.public_id);
      width = uploaded.width;
      height = uploaded.height;
    } else {
      const uploaded = await uploadToSupabaseStorage(eventSlug, file, buffer);
      publicId = uploaded.public_id;
      secureUrl = uploaded.secure_url;
      preview = uploaded.preview_url;
      width = uploaded.width;
      height = uploaded.height;
    }

    const { data: photo, error } = await supabase
      .from("photos")
      .insert({
        event_id: event.id,
        cloudinary_public_id: publicId,
        preview_url: preview,
        original_url: secureUrl,
        width,
        height,
        ai_status: hasAnyDetector() ? "pending" : "skipped",
      })
      .select("id")
      .single();

    if (error || !photo) {
      return NextResponse.json({ error: error?.message }, { status: 500 });
    }

    if (!event.cover_url) {
      await supabase
        .from("events")
        .update({ cover_url: secureUrl })
        .eq("id", event.id);
    }

    let aiResult: { numbers: string[]; status: string } | null = null;
    if (hasAnyDetector()) {
      aiResult = await tagPhotoWithAI(supabase, photo.id, secureUrl);
    }

    return NextResponse.json({
      id: photo.id,
      preview,
      storage: hasCloudinary() ? "cloudinary" : "supabase",
      dorsales: aiResult?.numbers ?? [],
      ai: aiResult?.status ?? "skipped",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error de subida" },
      { status: 500 }
    );
  }
}
