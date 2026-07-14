import { NextResponse } from "next/server";
import sharp from "sharp";
import { configureSharpForLowMemory } from "@/lib/compress-image";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { PREVIEW_BUCKET } from "@/lib/supabase/photo-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_COVER_MB = 20;
const COVER_MAX_EDGE = 2400;

/** Portada/logo → siempre JPEG (PNG con transparencia en fondo negro). */
async function prepareCoverJpeg(buffer: Buffer): Promise<Buffer> {
  if (buffer.length > MAX_COVER_MB * 1024 * 1024) {
    throw new Error(`La imagen pesa más de ${MAX_COVER_MB} MB. Usá JPG/PNG más liviano.`);
  }

  configureSharpForLowMemory();

  return sharp(buffer, { failOn: "none", sequentialRead: true, limitInputPixels: 100_000_000 })
    .rotate()
    .resize({
      width: COVER_MAX_EDGE,
      height: COVER_MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .flatten({ background: { r: 0, g: 0, b: 0 } })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}

/** Sube portada (logo de la carrera) y guarda en events.cover_url */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const eventSlug = (form.get("eventSlug") as string | null)?.trim();

    if (!file || !eventSlug) {
      return NextResponse.json({ error: "Faltan archivo o eventSlug" }, { status: 400 });
    }

    if (file.size > MAX_COVER_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `La imagen pesa más de ${MAX_COVER_MB} MB. Usá JPG comprimido.` },
        { status: 413 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("slug", eventSlug)
      .eq("photographer_id", user.id)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    let buffer: Buffer;
    try {
      buffer = await prepareCoverJpeg(Buffer.from(await file.arrayBuffer()));
    } catch (err) {
      return NextResponse.json(
        {
          error: err instanceof Error ? err.message : "No se pudo procesar la imagen",
          hint: "Probá JPG o PNG. Si es logo con transparencia, también funciona.",
        },
        { status: 400 }
      );
    }

    const service = createServiceClient();
    const storagePath = `${user.id}/${event.id}/cover-${Date.now()}.jpg`;

    const { error: uploadError } = await service.storage
      .from(PREVIEW_BUCKET)
      .upload(storagePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      if (uploadError.message.includes("Bucket not found")) {
        return NextResponse.json(
          {
            error: "Falta el bucket public-previews en Supabase",
            hint: "Ejecutá supabase/create-storage-buckets.sql en el SQL Editor.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: pub } = service.storage.from(PREVIEW_BUCKET).getPublicUrl(storagePath);
    const coverUrl = pub.publicUrl;

    const { error } = await service
      .from("events")
      .update({ cover_url: coverUrl })
      .eq("id", event.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, cover_url: coverUrl });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
