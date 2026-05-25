import type { SupabaseClient } from "@supabase/supabase-js";
import { detectRacerNumbers, hasAnyDetector } from "@/lib/detect-numbers";

export async function tagPhotoWithAI(
  supabase: SupabaseClient,
  photoId: string,
  imageUrl: string
): Promise<{ numbers: string[]; status: "done" | "no_numbers" | "failed" }> {
  try {
    await supabase.from("photos").update({ ai_status: "processing" }).eq("id", photoId);

    const detected = await detectRacerNumbers(imageUrl);
    await supabase.from("photo_numbers").delete().eq("photo_id", photoId);

    if (detected.numbers.length > 0) {
      await supabase.from("photo_numbers").insert(
        detected.numbers.map((n) => ({
          photo_id: photoId,
          number: n.number,
          confidence: n.confidence,
        }))
      );
    }

    await supabase
      .from("photos")
      .update({
        ai_status: detected.numbers.length > 0 ? "done" : "no_numbers",
        bike_color: detected.bike_color,
        rider_color: detected.rider_color,
      })
      .eq("id", photoId);

    return {
      numbers: detected.numbers.map((n) => n.number),
      status: detected.numbers.length > 0 ? "done" : "no_numbers",
    };
  } catch {
    await supabase.from("photos").update({ ai_status: "failed" }).eq("id", photoId);
    return { numbers: [], status: "failed" };
  }
}

export function hasOpenAI() {
  return hasAnyDetector();
}
