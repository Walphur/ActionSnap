import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const createSchema = z.object({
  title: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  event_date: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  price_per_photo_cents: z.number().int().positive(),
  publish: z.boolean(),
  cover_url: z.string().optional(),
});

const patchSchema = z.object({
  slug: z.string().min(2),
  cover_url: z.string().url().nullable().optional(),
  use_first_photo: z.boolean().optional(),
});

const DEMO_PHOTOGRAPHER_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = createSchema.parse(json);
    const supabase = createServiceClient();

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: DEMO_PHOTOGRAPHER_ID,
        full_name: "Fotógrafo",
        role: "photographer",
      },
      { onConflict: "id" }
    );

    if (profileError) {
      return NextResponse.json(
        {
          error: profileError.message,
          hint: "¿Ejecutaste supabase/schema.sql y supabase/seed.sql en el SQL Editor?",
        },
        { status: 400 }
      );
    }

    const coverRaw = data.cover_url?.trim();
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
        title: data.title,
        slug: data.slug,
        event_date: data.event_date,
        location: data.location ?? null,
        description: data.description ?? null,
        photographer_id: DEMO_PHOTOGRAPHER_ID,
        is_published: data.publish,
        price_per_photo_cents: data.price_per_photo_cents,
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
    const supabase = createServiceClient();

    const { data: event } = await supabase
      .from("events")
      .select("id, cover_url")
      .eq("slug", body.slug)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Carrera no encontrada" }, { status: 404 });
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
          { error: "No hay fotos en esta carrera todavía" },
          { status: 400 }
        );
      }
      cover_url = photo.preview_url;
    }

    if (cover_url === undefined) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const { error } = await supabase
      .from("events")
      .update({ cover_url })
      .eq("id", event.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, cover_url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
