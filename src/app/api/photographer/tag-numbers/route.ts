import { NextResponse } from "next/server";
import { z } from "zod";
import { assertPhotoOwnedByPhotographer } from "@/lib/photographer-ownership";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  photoId: z.string().uuid().optional(),
  photoIds: z.array(z.string().uuid()).min(1).max(50).optional(),
  dorsal: z.string().regex(/^\d{1,4}$/).optional(),
  numbers: z.array(z.string().regex(/^\d{1,4}$/)).min(1).optional(),
  bike_color: z.string().nullable().optional(),
  rider_color: z.string().nullable().optional(),
});

function normalizeColor(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function tagOnePhoto(
  authClient: Awaited<ReturnType<typeof createClient>>,
  service: ReturnType<typeof createServiceClient>,
  userId: string,
  photoId: string,
  nums: string[],
  bike_color: string | null | undefined,
  rider_color: string | null | undefined
) {
  const owned = await assertPhotoOwnedByPhotographer(authClient, photoId, userId);
  if (!owned.ok) {
    return { ok: false as const, error: owned.error, status: owned.status };
  }

  const bikeColor = normalizeColor(bike_color);
  const riderColor = normalizeColor(rider_color);

  if (nums.length > 0) {
    await service.from("photo_numbers").delete().eq("photo_id", photoId);

    const { error } = await service.from("photo_numbers").insert(
      nums.map((number) => ({
        photo_id: photoId,
        number,
        confidence: 1,
      }))
    );

    if (error) {
      return { ok: false as const, error: error.message, status: 400 };
    }
  }

  const { error: photoError } = await service
    .from("photos")
    .update({
      ai_status: "manual",
      bike_color: bikeColor,
      rider_color: riderColor,
    })
    .eq("id", photoId);

  if (photoError) {
    return { ok: false as const, error: photoError.message, status: 400 };
  }

  return { ok: true as const, numbers: nums };
}

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const nums = body.dorsal ? [body.dorsal] : body.numbers ?? [];
    const bikeColor = normalizeColor(body.bike_color);
    const riderColor = normalizeColor(body.rider_color);

    if (nums.length === 0 && !bikeColor && !riderColor) {
      return NextResponse.json(
        { error: "Agregá un número o al menos un color." },
        { status: 400 }
      );
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
    const service = createServiceClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (targetIds.length === 1) {
      const result = await tagOnePhoto(
        supabase,
        service,
        user.id,
        targetIds[0],
        nums,
        bikeColor,
        riderColor
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
        service,
        user.id,
        photoId,
        nums,
        bikeColor,
        riderColor
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
