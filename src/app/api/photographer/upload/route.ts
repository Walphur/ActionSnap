import { NextResponse } from "next/server";
import { configureCloudinary, previewUrl } from "@/lib/cloudinary";
import { resolveWatermarkForUser } from "@/lib/resolve-photographer-watermark";
import { createClient } from "@/lib/supabase/server";
import { tagPhotoWithAI } from "@/lib/analyze-photo";
import { compressImage } from "@/lib/compress-image";
import { hasAnyDetector } from "@/lib/detect-numbers";
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

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { error: `Formato .${ext} no soportado en ${file.name}`, hint: "Usá JPG o PNG." },
        { status: 400 }
      );
    }

    // Validar ownership del evento antes de tocar storage.
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

    const watermark = await resolveWatermarkForUser(user.id);

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const maxMb = 8;
    if (rawBuffer.length > maxMb * 1024 * 1024) {
      return NextResponse.json(
        { error: `${file.name} pesa ${(rawBuffer.length / 1024 / 1024).toFixed(1)} MB`, hint: `Máx ${maxMb} MB` },
        { status: 413 }
      );
    }

    let buffer: Buffer;
    try {
      buffer = await compressImage(rawBuffer, file.type || "image/jpeg");
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "No se pudo procesar" },
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
      preview = previewUrl(uploaded.public_id, watermark);
      width = uploaded.width;
      height = uploaded.height;
    } else {
      const uploaded = await uploadToSupabaseStorage(eventSlug, file, buffer, watermark);
      publicId = uploaded.public_id;
      secureUrl = uploaded.secure_url;
      preview = uploaded.preview_url;
      width = uploaded.width;
      height = uploaded.height;
    }

    const { data: photo, error: photoError } = await supabase
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

    if (photoError || !photo) {
      return NextResponse.json({ error: photoError?.message ?? "Error insertando foto" }, { status: 500 });
    }

    if (!event.cover_url) {
      await supabase.from("events").update({ cover_url: secureUrl }).eq("id", event.id);
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
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error de subida" },
      { status: 500 }
    );
  }
}

