import { NextResponse } from "next/server";
import { fetchSalesSummariesByPhotographer } from "@/lib/photographer-sales";
import { fetchProfileMpExtras } from "@/lib/admin-profile-extras";
import { requireAdminProfile } from "@/lib/admin-auth";
import { sumCommissionOwedByPhotographer } from "@/lib/platform-commission";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireAdminProfile();
    const supabase = createServiceClient();

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("role", "photographer")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const photographerIds = (profiles ?? []).map((p) => p.id);
    const extrasById = await fetchProfileMpExtras(supabase, photographerIds);
    const [salesById, owedById] = await Promise.all([
      fetchSalesSummariesByPhotographer(supabase, photographerIds),
      sumCommissionOwedByPhotographer(supabase, photographerIds),
    ]);

    const { data: events } = photographerIds.length
      ? await supabase
          .from("events")
          .select("id, slug, title, is_published, event_date, photographer_id")
          .in("photographer_id", photographerIds)
          .order("event_date", { ascending: false })
      : { data: [] };

    const eventCountByPhotographer = new Map<string, number>();
    const eventsByPhotographer = new Map<
      string,
      Array<{ slug: string; title: string; isPublished: boolean; eventDate: string }>
    >();

    for (const event of events ?? []) {
      eventCountByPhotographer.set(
        event.photographer_id,
        (eventCountByPhotographer.get(event.photographer_id) ?? 0) + 1
      );
      const list = eventsByPhotographer.get(event.photographer_id) ?? [];
      list.push({
        slug: event.slug,
        title: event.title,
        isPublished: event.is_published,
        eventDate: event.event_date,
      });
      eventsByPhotographer.set(event.photographer_id, list);
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

    const photographers = (profiles ?? []).map((profile) => {
      const extras = extrasById.get(profile.id) ?? { mpConnected: false, isActive: true };
      const sales = salesById.get(profile.id) ?? {
        salesCount: 0,
        grossCents: 0,
        sellerCents: 0,
        platformCents: 0,
      };
      return {
        id: profile.id,
        fullName: profile.full_name,
        email: emailByUserId.get(profile.id) ?? null,
        mpConnected: extras.mpConnected,
        eventsCount: eventCountByPhotographer.get(profile.id) ?? 0,
        events: eventsByPhotographer.get(profile.id) ?? [],
        isActive: extras.isActive,
        createdAt: profile.created_at,
        salesCount: sales.salesCount,
        grossSalesCents: sales.grossCents,
        sellerTotalCents: sales.sellerCents,
        platformFeeCents: sales.platformCents,
        commissionOwedCents: owedById.get(profile.id) ?? 0,
      };
    });

    return NextResponse.json({ photographers });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "No autorizado" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
