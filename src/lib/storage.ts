import { createServiceClient } from "@/lib/supabase/server";
import { applyWatermark } from "@/lib/watermark-image";
import type { WatermarkOptions } from "@/lib/watermark-config";
import { DEFAULT_WATERMARK } from "@/lib/watermark-config";

export function hasCloudinary() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

export async function uploadToSupabaseStorage(
  eventSlug: string,
  file: File,
  buffer: Buffer,
  watermark: WatermarkOptions = DEFAULT_WATERMARK
) {
  const supabase = createServiceClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${eventSlug}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from("photos").upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    if (error.message.includes("Bucket not found")) {
      throw new Error(
        "Falta el bucket 'photos' en Supabase. Ejecutá supabase/storage.sql en el SQL Editor."
      );
    }
    throw new Error(error.message);
  }

  const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
  const originalUrl = pub.publicUrl;

  const wmBuffer = await applyWatermark(buffer, watermark);
  const wmPath = `wm/${path}`;
  const { error: wmError } = await supabase.storage.from("photos").upload(wmPath, wmBuffer, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (wmError) {
    throw new Error(`Marca de agua: ${wmError.message}`);
  }

  const { data: wmPub } = supabase.storage.from("photos").getPublicUrl(wmPath);

  return {
    public_id: path,
    secure_url: originalUrl,
    preview_url: wmPub.publicUrl,
    width: null as number | null,
    height: null as number | null,
  };
}
