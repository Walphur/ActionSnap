import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchImageBuffer } from "@/lib/fetch-image";
import { applyWatermark } from "@/lib/watermark-image";

export const runtime = "nodejs";

/** Preview con marca de agua para fotos ya subidas (preview = original). */
export async function GET(request: Request) {
  const photoId = new URL(request.url).searchParams.get("photoId");
  if (!photoId) {
    return NextResponse.json({ error: "Falta photoId" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: photo } = await supabase
    .from("photos")
    .select("id, preview_url, original_url")
    .eq("id", photoId)
    .single();

  if (!photo) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  if (photo.preview_url !== photo.original_url) {
    return NextResponse.redirect(photo.preview_url);
  }

  try {
    const { buffer } = await fetchImageBuffer(photo.original_url);
    const out = await applyWatermark(buffer);
    return new NextResponse(new Uint8Array(out), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
