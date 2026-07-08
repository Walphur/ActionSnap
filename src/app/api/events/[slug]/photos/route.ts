import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PhotoWithNumbers } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 48;

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const url = new URL(request.url);

    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number(url.searchParams.get("limit") ?? String(DEFAULT_LIMIT)) || DEFAULT_LIMIT)
    );
    const numero = url.searchParams.get("numero")?.trim().replace(/\D/g, "") || "";
    const color = url.searchParams.get("color")?.trim() || "";

    const supabase = await createClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, sport, is_published")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // El filtro de color aplica a todos los deportes/eventos (universal).
    const showColorFilter = true;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let filteredPhotoIds: string[] | null = null;

    if (numero) {
      const { data: eventPhotos } = await supabase
        .from("photos")
        .select("id")
        .eq("event_id", event.id)
        .eq("is_sold", false);

      const eventPhotoIds = (eventPhotos ?? []).map((p) => p.id);

      if (eventPhotoIds.length === 0) {
        return NextResponse.json({
          photos: [],
          page,
          limit,
          hasMore: false,
          total: 0,
        });
      }

      const { data: matched } = await supabase
        .from("photo_numbers")
        .select("photo_id")
        .eq("number", numero)
        .in("photo_id", eventPhotoIds);

      filteredPhotoIds = [...new Set((matched ?? []).map((m) => m.photo_id))];

      if (filteredPhotoIds.length === 0) {
        const { count: taggedCount } = await supabase
          .from("photo_numbers")
          .select("photo_id", { count: "exact", head: true })
          .in("photo_id", eventPhotoIds);

        return NextResponse.json({
          photos: [],
          page,
          limit,
          hasMore: false,
          total: 0,
          taggedCount: taggedCount ?? 0,
        });
      }
    }

    let query = supabase
      .from("photos")
      .select("*, photo_numbers(number, confidence)", { count: "exact" })
      .eq("event_id", event.id)
      .eq("is_sold", false)
      .order("created_at", { ascending: false });

    if (filteredPhotoIds) {
      query = query.in("id", filteredPhotoIds);
    }

    if (showColorFilter && color && color !== "todos") {
      query = query.or(`bike_color.eq.${color},rider_color.eq.${color}`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count ?? 0;
    const photos = (data ?? []) as PhotoWithNumbers[];
    const hasMore = from + photos.length < total;

    return NextResponse.json({
      photos,
      page,
      limit,
      hasMore,
      total,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al cargar fotos" },
      { status: 500 }
    );
  }
}
