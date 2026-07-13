import { NextResponse } from "next/server";
import { compressImage } from "@/lib/compress-image";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { PREVIEW_BUCKET } from "@/lib/supabase/photo-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Sube portada (logo de la carrera) y guarda en events.cover_url */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const eventSlug = (form.get("eventSlug") as string | null)?.trim();

    if (!file || !eventSlug) {
      return NextResponse.json({ error: "Faltan archivo o eventSlug" }, { status: 400 });
    }

    const maxMb = 20;
    if (file.size > maxMb * 1024 * 1024) {
      return NextResponse.json(
        { error: `La imagen pesa más de ${maxMb} MB. Usá JPG comprimido.` },
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

    const buffer = await compressImage(
      Buffer.from(await file.arrayBuffer()),
      file.type || "image/jpeg"
    );

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

