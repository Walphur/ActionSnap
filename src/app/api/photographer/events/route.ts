import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { insertEventRow, listPhotographerEvents, schemaHint, updateEventRow } from "@/lib/events-db";
import { requirePhotographerProfile, isPhotographerAuthError } from "@/lib/photographer-auth";
import { optionalText, optionalUrlText } from "@/lib/zod-form";

const createSchema = z.object({
  title: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  sport: z.string().min(2),
  event_date: z.string(),
  location: optionalText,
  description: optionalText,
  price_per_photo_cents: z.number().int().positive(),
  publish: z.boolean(),
  cover_url: optionalUrlText,
});

export async function GET() {
  try {
    const photographer = await requirePhotographerProfile();
    const supabase = await createClient();

    const { events: list, error } = await listPhotographerEvents(supabase, photographer.id);
    if (error) {
      return NextResponse.json({ error, hint: schemaHint(error) }, { status: 400 });
    }

    const ids = list.map((e) => e.id);

    const photoCounts = new Map<string, number>();
    if (ids.length > 0) {
      const { data: photos } = await supabase.from("photos").select("event_id").in("event_id", ids);
      for (const p of photos ?? []) {
        photoCounts.set(p.event_id, (photoCounts.get(p.event_id) ?? 0) + 1);
      }
    }

    return NextResponse.json({
      events: list.map((e) => ({
        ...e,
        photoCount: photoCounts.get(e.id) ?? 0,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 401 }
    );
  }
}

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

    const collectorId = photographer.mp_seller_id ?? photographer.mp_receiver_id;
    if (body.publish && !collectorId) {
      return NextResponse.json(
        {
          error:
            "Vinculá Mercado Pago antes de publicar. Un evento publicado sin cobros vinculados no puede vender fotos.",
        },
        { status: 422 }
      );
    }

    const { slug, error: insertError } = await insertEventRow(supabase, {
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
    });

    if (insertError || !slug) {
      return NextResponse.json(
        {
          error: insertError ?? "No se pudo crear el evento",
          hint: insertError ? schemaHint(insertError) : undefined,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ slug });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json(
      { error: message },
      { status: isPhotographerAuthError(message) ? 401 : 400 }
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

    if (body.is_published === true) {
      const collectorId = photographer.mp_seller_id ?? photographer.mp_receiver_id;
      if (!collectorId) {
        return NextResponse.json(
          {
            error:
              "Vinculá Mercado Pago antes de publicar. Un evento publicado sin cobros vinculados no puede vender fotos.",
          },
          { status: 422 }
        );
      }

      const { count: photoCount } = await supabase
        .from("photos")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event.id);

      if (!photoCount || photoCount === 0) {
        return NextResponse.json(
          {
            error: "Subí al menos una foto antes de publicar el evento.",
          },
          { status: 422 }
        );
      }
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

    const { error: updateError } = await updateEventRow(supabase, event.id, updates);
    if (updateError) {
      return NextResponse.json(
        { error: updateError, hint: schemaHint(updateError) },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, cover_url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const slug = new URL(request.url).searchParams.get("slug")?.trim();
    if (!slug) {
      return NextResponse.json({ error: "Falta el slug del evento" }, { status: 400 });
    }

    const photographer = await requirePhotographerProfile();
    const supabase = await createClient();

    const { data: event } = await supabase
      .from("events")
      .select("id, photographer_id, title")
      .eq("slug", slug)
      .maybeSingle();

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    if (event.photographer_id !== photographer.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { data: photos } = await supabase
      .from("photos")
      .select("id")
      .eq("event_id", event.id);

    const photoIds = (photos ?? []).map((p) => p.id);
    if (photoIds.length > 0) {
      await supabase.from("photo_numbers").delete().in("photo_id", photoIds);
      await supabase.from("photos").delete().eq("event_id", event.id);
    }

    const { error } = await supabase.from("events").delete().eq("id", event.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, deleted: slug });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 401 }
    );
  }
}

