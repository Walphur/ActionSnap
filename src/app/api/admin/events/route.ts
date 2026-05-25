import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
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
});

/** MVP: sin auth — en producción proteger con Supabase Auth rol photographer */
const DEMO_PHOTOGRAPHER_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = schema.parse(json);
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
