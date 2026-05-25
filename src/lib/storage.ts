import { createServiceClient } from "@/lib/supabase/server";

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
  buffer: Buffer
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
  const url = pub.publicUrl;

  return {
    public_id: path,
    secure_url: url,
    preview_url: url,
    width: null as number | null,
    height: null as number | null,
  };
}
