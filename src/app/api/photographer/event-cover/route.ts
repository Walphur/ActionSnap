import { NextResponse } from "next/server";
import { configureCloudinary } from "@/lib/cloudinary";
import { compressImage } from "@/lib/compress-image";
import { createClient } from "@/lib/supabase/server";
import { hasCloudinary, uploadToSupabaseStorage } from "@/lib/storage";

export const runtime = "nodejs";

/** Sube portada (logo de la carrera) y guarda en events.cover_url */
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

    let coverUrl: string;

    if (hasCloudinary()) {
      const cloudinary = configureCloudinary();
      const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `moto-fotos/covers/${eventSlug}`, resource_type: "image" },
          (err, result) => {
            if (err || !result) reject(err ?? new Error("Upload failed"));
            else resolve({ secure_url: result.secure_url });
          }
        );
        stream.end(buffer);
      });
      coverUrl = uploaded.secure_url;
    } else {
      const fakeFile = new File([new Uint8Array(buffer)], `cover-${eventSlug}.jpg`, {
        type: "image/jpeg",
      });
      const uploaded = await uploadToSupabaseStorage(
        `${eventSlug}/covers`,
        fakeFile,
        buffer
      );
      coverUrl = uploaded.preview_url;
    }

    const { error } = await supabase
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

