import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api-guard";
import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  photoId: z.string().uuid(),
  dorsal: z.string().regex(/^\d{1,3}$/).optional(),
  numbers: z.array(z.string().regex(/^\d{1,3}$/)).min(1).optional(),
  bike_color: z.string().nullable().optional(),
  rider_color: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = schema.parse(await request.json());
    const nums = body.dorsal ? [body.dorsal] : (body.numbers ?? []);
    if (nums.length === 0) {
      return NextResponse.json({ error: "Falta dorsal" }, { status: 400 });
    }

    const supabase = createServiceClient();
    await supabase.from("photo_numbers").delete().eq("photo_id", body.photoId);

    const { error } = await supabase.from("photo_numbers").insert(
      nums.map((number) => ({
        photo_id: body.photoId,
        number,
        confidence: 1,
      }))
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase
      .from("photos")
      .update({
        ai_status: "manual",
        bike_color: body.bike_color ?? null,
        rider_color: body.rider_color ?? null,
      })
      .eq("id", body.photoId);

    return NextResponse.json({ ok: true, numbers: nums });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
