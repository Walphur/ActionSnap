import { CinematicHome } from "@/components/CinematicHome";
import { attachEventCovers, type EventWithCover } from "@/lib/event-cover";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let list: EventWithCover[] = [];
  let configError = false;

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
    } else {
      configError = true;
    }
  } catch {
    configError = true;
  }

  return <CinematicHome events={list} configError={configError} />;
}
