import { NextResponse } from "next/server";
import { requireAdminProfile } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ slug: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { slug } = await params;
    const normalized = slug.trim().toLowerCase();

    if (!normalized) {
      return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: event } = await supabase
      .from("events")
      .select("id, title, slug, photographer_id")
      .eq("slug", normalized)
      .maybeSingle();

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const { data: photos } = await supabase
      .from("photos")
      .select("id")
      .eq("event_id", event.id);

    const photoIds = (photos ?? []).map((p) => p.id);
    if (photoIds.length > 0) {
      await supabase.from("purchase_items").delete().in("photo_id", photoIds);
      await supabase.from("photo_numbers").delete().in("photo_id", photoIds);
      await supabase.from("photos").delete().eq("event_id", event.id);
    }

    const { error } = await supabase.from("events").delete().eq("id", event.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      deleted: event.slug,
      title: event.title,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No autorizado" },
      { status: 401 }
    );
  }
}
