import { NextResponse } from "next/server";
import { z } from "zod";
import { assertPhotoOwnedByPhotographer } from "@/lib/photographer-ownership";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  photoId: z.string().uuid().optional(),
  photoIds: z.array(z.string().uuid()).min(1).max(50).optional(),
  dorsal: z.string().regex(/^\d{1,3}$/).optional(),
  numbers: z.array(z.string().regex(/^\d{1,3}$/)).min(1).optional(),
  bike_color: z.string().nullable().optional(),
  rider_color: z.string().nullable().optional(),
});

async function tagOnePhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  photoId: string,
  nums: string[],
  bike_color: string | null | undefined,
  rider_color: string | null | undefined
) {
  const owned = await assertPhotoOwnedByPhotographer(supabase, photoId, userId);
  if (!owned.ok) {
    return { ok: false as const, error: owned.error, status: owned.status };
  }

  await supabase.from("photo_numbers").delete().eq("photo_id", photoId);

  const { error } = await supabase.from("photo_numbers").insert(
    nums.map((number) => ({
      photo_id: photoId,
      number,
      confidence: 1,
    }))
  );

  if (error) {
    return { ok: false as const, error: error.message, status: 400 };
  }

  await supabase
    .from("photos")
    .update({
      ai_status: "manual",
      bike_color: bike_color ?? null,
      rider_color: rider_color ?? null,
    })
    .eq("id", photoId);

  return { ok: true as const, numbers: nums };
}

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const nums = body.dorsal ? [body.dorsal] : body.numbers ?? [];

    if (nums.length === 0) {
      return NextResponse.json({ error: "Falta dorsal" }, { status: 400 });
    }

    const targetIds = body.photoIds?.length
      ? body.photoIds
      : body.photoId
        ? [body.photoId]
        : [];

    if (targetIds.length === 0) {
      return NextResponse.json({ error: "Falta photoId o photoIds" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (targetIds.length === 1) {
      const result = await tagOnePhoto(
        supabase,
        user.id,
        targetIds[0],
        nums,
        body.bike_color,
        body.rider_color
      );
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({ ok: true, numbers: nums, updated: 1 });
    }

    let updated = 0;
    const errors: string[] = [];
    for (const photoId of targetIds) {
      const result = await tagOnePhoto(
        supabase,
        user.id,
        photoId,
        nums,
        body.bike_color,
        body.rider_color
      );
      if (result.ok) updated++;
      else errors.push(result.error);
    }

    return NextResponse.json({
      ok: updated > 0,
      numbers: nums,
      updated,
      failed: targetIds.length - updated,
      errors: errors.length > 0 ? errors.slice(0, 3) : undefined,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
