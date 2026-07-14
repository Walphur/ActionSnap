import { NextResponse } from "next/server";
import { deletePhotographerPhotos } from "@/lib/delete-photo";
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

export async function DELETE(request: Request) {
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "photographer") {
      return NextResponse.json(
        { success: false, error: "Solo fotógrafos", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      photoId?: string;
      photoIds?: string[];
    };
    const photoIds = [
      ...(Array.isArray(body.photoIds) ? body.photoIds : []),
      ...(body.photoId ? [body.photoId] : []),
    ].filter(Boolean);

    if (photoIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Falta photoId", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const result = await deletePhotographerPhotos({
      photographerId: user.id,
      photoIds,
    });

    if (result.deleted.length === 0) {
      const reason = result.blocked[0]?.reason ?? "No se pudo eliminar";
      return NextResponse.json(
        { success: false, error: reason, blocked: result.blocked },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      blocked: result.blocked,
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Error al eliminar",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
