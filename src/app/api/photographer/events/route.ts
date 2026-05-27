import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePhotographerProfile } from "@/lib/photographer-auth";

const createSchema = z.object({
  title: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  sport: z.string().min(2),
  event_date: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  price_per_photo_cents: z.number().int().positive(),
  publish: z.boolean(),
  cover_url: z.string().optional(),
});

const patchSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2).optional(),
  sport: z.string().optional(),
  cover_url: z.string().url().nullable().optional(),
  use_first_photo: z.boolean().optional(),
  price_per_photo_cents: z.number().int().positive().optional(),
  pack_discount_percent: z.number().int().min(0).max(80).optional(),
  is_published: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const body = createSchema.parse(await request.json());
    const photographer = await requirePhotographerProfile();
    const supabase = await createClient();

    const coverRaw = body.cover_url?.trim();
    let cover: string | null = null;
    if (coverRaw) {
      try {
        new URL(coverRaw);
        cover = coverRaw;
      } catch {
        return NextResponse.json({ error: "URL de portada inválida" }, { status: 400 });
      }
    }

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        title: body.title,
        slug: body.slug,
        sport: body.sport,
        event_date: body.event_date,
        location: body.location ?? null,
        description: body.description ?? null,
        photographer_id: photographer.id,
        is_published: body.publish,
        price_per_photo_cents: body.price_per_photo_cents,
        cover_url: cover,
      })
      .select("slug")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(event);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = patchSchema.parse(await request.json());
    const photographer = await requirePhotographerProfile();
    const supabase = await createClient();

    const { data: event } = await supabase
      .from("events")
      .select("id, cover_url, photographer_id")
      .eq("slug", body.slug)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    if (event.photographer_id !== photographer.id) {
      // Por RLS esto no debería pasar, pero lo dejamos como defensa extra.
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    let cover_url: string | null | undefined = body.cover_url;

    if (body.use_first_photo) {
      const { data: photo } = await supabase
        .from("photos")
        .select("preview_url")
        .eq("event_id", event.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!photo?.preview_url) {
        return NextResponse.json(
          { error: "No hay fotos en este evento todavía" },
          { status: 400 }
        );
      }

      cover_url = photo.preview_url;
    }

    const updates: Record<string, unknown> = {};
    if (cover_url !== undefined) updates.cover_url = cover_url;
    if (body.title) updates.title = body.title;
    if (body.sport !== undefined) updates.sport = body.sport;
    if (body.price_per_photo_cents !== undefined)
      updates.price_per_photo_cents = body.price_per_photo_cents;
    if (body.pack_discount_percent !== undefined) {
      updates.pack_discount_percent = body.pack_discount_percent;
    }
    if (body.is_published !== undefined) updates.is_published = body.is_published;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const { error } = await supabase.from("events").update(updates).eq("id", event.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true, cover_url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}

