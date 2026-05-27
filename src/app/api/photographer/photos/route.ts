import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("eventSlug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Falta eventSlug" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: event } = await supabase
      .from("events")
      .select("id, title, slug")
      .eq("slug", slug)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const { data: photos } = await supabase
      .from("photos")
      .select(
        "id, preview_url, original_url, cloudinary_public_id, ai_status, bike_color, rider_color, photo_numbers(number)"
      )
      .eq("event_id", event.id)
      .order("created_at", { ascending: true });

    return NextResponse.json({ event, photos: photos ?? [] });
  } catch (e) {
    return NextResponse.json({ error: "Error en fotos" }, { status: 500 });
  }
}

