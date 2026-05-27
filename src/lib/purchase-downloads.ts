import type { SupabaseClient } from "@supabase/supabase-js";
import { signedDownloadUrl } from "@/lib/cloudinary";
import { hasCloudinary } from "@/lib/storage";

export type PurchasePhoto = {
  photoId: string;
  previewUrl: string;
  downloadUrl: string;
  fileName: string;
};

export async function getPaidPurchase(
  supabase: SupabaseClient,
  purchaseId: string
) {
  const { data } = await supabase
    .from("purchases")
    .select("id, status, email, amount_cents, created_at")
    .eq("id", purchaseId)
    .single();

  if (!data || data.status !== "paid") return null;
  return data;
}

export async function getPurchasePhotos(
  supabase: SupabaseClient,
  purchaseId: string
): Promise<PurchasePhoto[]> {
  const { data: items } = await supabase
    .from("purchase_items")
    .select("photo_id, photos(cloudinary_public_id, preview_url, original_url)")
    .eq("purchase_id", purchaseId);

  const photos: PurchasePhoto[] = [];

  (items ?? []).forEach((item, index) => {
    const raw = item.photos;
    const photo = (Array.isArray(raw) ? raw[0] : raw) as {
      cloudinary_public_id: string;
      preview_url: string;
      original_url: string;
    } | null;

    if (!photo?.original_url) return;

    photos.push({
      photoId: item.photo_id,
      previewUrl: photo.preview_url,
      downloadUrl: hasCloudinary()
        ? signedDownloadUrl(photo.cloudinary_public_id)
        : photo.original_url,
      fileName: `victor-films-${String(index + 1).padStart(2, "0")}.jpg`,
    });
  });

  return photos;
}

export async function getPaidPurchasesByEmail(
  supabase: SupabaseClient,
  email: string
) {
  const normalized = email.trim().toLowerCase();
  const { data } = await supabase
    .from("purchases")
    .select("id, amount_cents, created_at, status")
    .eq("status", "paid")
    .ilike("email", normalized)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}
