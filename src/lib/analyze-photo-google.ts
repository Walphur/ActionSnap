import type { SupabaseClient } from "@supabase/supabase-js";
import { detectWithGoogleVision } from "@/lib/detect/google-vision";

export async function tagPhotoWithGoogleVision(
  supabase: SupabaseClient,
  photoId: string,
  imageUrl: string
): Promise<{ numbers: string[]; labels: string[]; status: "done" | "no_numbers" | "failed" }> {
  try {
    await supabase.from("photos").update({ ai_status: "processing" }).eq("id", photoId);

    const detected = await detectWithGoogleVision(imageUrl);
    await supabase.from("photo_numbers").delete().eq("photo_id", photoId);

    if (detected.numbers.length > 0) {
      await supabase.from("photo_numbers").insert(
        detected.numbers.map((n) => ({
          photo_id: photoId,
          number: n.number,
          confidence: Number(n.confidence.toFixed(4)),
        }))
      );
    }

    await supabase
      .from("photos")
      .update({
        ai_status: detected.numbers.length > 0 ? "done" : "no_numbers",
        bike_color: detected.bike_color,
        ai_labels: detected.labels.length > 0 ? detected.labels : null,
      })
      .eq("id", photoId);

    return {
      numbers: detected.numbers.map((n) => n.number),
      labels: detected.labels,
      status: detected.numbers.length > 0 ? "done" : "no_numbers",
    };
  } catch (error) {
    console.error("tagPhotoWithGoogleVision:", error);
    await supabase.from("photos").update({ ai_status: "failed" }).eq("id", photoId);
    return { numbers: [], labels: [], status: "failed" };
  }
}
