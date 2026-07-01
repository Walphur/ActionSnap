import { NextResponse } from "next/server";
import { requireAdminProfile } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireAdminProfile();
    const supabase = createServiceClient();

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, mp_seller_id, mp_receiver_id, is_active, created_at")
      .eq("role", "photographer")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const photographerIds = (profiles ?? []).map((p) => p.id);

    const { data: events } = photographerIds.length
      ? await supabase.from("events").select("id, photographer_id").in("photographer_id", photographerIds)
      : { data: [] };

    const eventCountByPhotographer = new Map<string, number>();
    for (const event of events ?? []) {
      eventCountByPhotographer.set(
        event.photographer_id,
        (eventCountByPhotographer.get(event.photographer_id) ?? 0) + 1
      );
    }

    const emailByUserId = new Map<string, string>();
    let page = 1;
    let hasMore = true;

    while (hasMore && photographerIds.length > 0) {
      const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
        page,
        perPage: 200,
      });

      if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
      }

      for (const user of listed.users) {
        if (user.email) {
          emailByUserId.set(user.id, user.email);
        }
      }

      hasMore = listed.users.length === 200;
      page += 1;
      if (page > 20) hasMore = false;
    }

    const photographers = (profiles ?? []).map((profile) => ({
      id: profile.id,
      fullName: profile.full_name,
      email: emailByUserId.get(profile.id) ?? null,
      mpConnected: Boolean(profile.mp_seller_id ?? profile.mp_receiver_id),
      eventsCount: eventCountByPhotographer.get(profile.id) ?? 0,
      isActive: profile.is_active !== false,
      createdAt: profile.created_at,
    }));

    return NextResponse.json({ photographers });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "No autorizado" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
