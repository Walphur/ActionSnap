import { createServiceClient } from "@/lib/supabase/server";
import { DEFAULT_WATERMARK, watermarkFromProfile } from "@/lib/watermark-config";
import type { WatermarkOptions } from "@/lib/watermark-config";

export async function resolveWatermarkForUser(userId: string): Promise<WatermarkOptions> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("watermark_text, watermark_use_logo")
    .eq("id", userId)
    .maybeSingle();

  if (!data) return DEFAULT_WATERMARK;
  return watermarkFromProfile(data);
}

export async function resolveWatermarkForPhoto(photoId: string): Promise<WatermarkOptions> {
  const supabase = createServiceClient();
  const { data: photo } = await supabase
    .from("photos")
    .select("event_id")
    .eq("id", photoId)
    .maybeSingle();

  if (!photo?.event_id) return DEFAULT_WATERMARK;

  const { data: event } = await supabase
    .from("events")
    .select("photographer_id")
    .eq("id", photo.event_id)
    .maybeSingle();

  if (!event?.photographer_id) return DEFAULT_WATERMARK;
  return resolveWatermarkForUser(event.photographer_id);
}
