import { CinematicHome } from "@/components/CinematicHome";
import { attachEventCovers, type EventWithCover } from "@/lib/event-cover";
import { mergeHomeStats } from "@/lib/platform";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let list: EventWithCover[] = [];
  let configError = false;
  let photographerCount = 0;
  let downloadCount = 0;

  try {
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      const supabase = await createClient();
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("event_date", { ascending: false });
      list = await attachEventCovers(supabase, (events ?? []) as Event[]);

      const { count: profiles } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      if (profiles != null) photographerCount = profiles;

      const { count: paid } = await supabase
        .from("purchases")
        .select("*", { count: "exact", head: true })
        .eq("status", "paid");
      if (paid != null) downloadCount = paid;
    } else {
      configError = true;
    }
  } catch {
    configError = true;
  }

  const totalPhotos = list.reduce((sum, e) => sum + (e.photoCount ?? 0), 0);

  const stats = mergeHomeStats({
    events: list.length,
    photographers: photographerCount,
    photos: totalPhotos,
    downloads: downloadCount,
  });

  return <CinematicHome events={list} configError={configError} stats={stats} />;
}
