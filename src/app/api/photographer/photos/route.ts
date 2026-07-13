import { NextResponse } from "next/server";
import { assertEventOwnedByPhotographer } from "@/lib/photographer-ownership";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("eventSlug")?.trim();
  if (!slug) {
    return NextResponse.json(
      { success: false, error: "Falta eventSlug", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autenticado", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const owned = await assertEventOwnedByPhotographer(supabase, slug, user.id);
    if (!owned.ok) {
      return NextResponse.json(
        { success: false, error: owned.error, code: "FORBIDDEN" },
        { status: owned.status }
      );
    }

    const service = createServiceClient();

    const { data: event } = await service
      .from("events")
      .select("id, title, slug")
      .eq("id", owned.eventId)
      .single();

    const { data: photos } = await service
      .from("photos")
      .select(
        "id, preview_url, original_url, cloudinary_public_id, ai_status, bike_color, rider_color, is_sold, photo_numbers(number)"
      )
      .eq("event_id", owned.eventId)
      .order("created_at", { ascending: true });

    return NextResponse.json({ success: true, event, photos: photos ?? [] });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Error en fotos",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
