import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePhotographerProfile } from "@/lib/photographer-auth";
import { normalizeWatermarkText } from "@/lib/watermark-config";

const patchSchema = z.object({
  mp_receiver_id: z.string().min(2).optional().nullable(),
  mp_seller_id: z.string().min(2).optional().nullable(),
  watermark_text: z.string().max(32).optional().nullable(),
  watermark_use_logo: z.boolean().optional(),
});

export async function GET() {
  try {
    const profile = await requirePhotographerProfile();
    return NextResponse.json({
      id: profile.id,
      full_name: profile.full_name,
      mp_receiver_id: profile.mp_receiver_id,
      mp_seller_id: profile.mp_seller_id,
      watermark_text: profile.watermark_text,
      watermark_use_logo: profile.watermark_use_logo,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 401 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = patchSchema.parse(await request.json());
    const photographer = await requirePhotographerProfile();
    const supabase = await createClient();

    const updates: Record<string, unknown> = {};
    if (body.mp_receiver_id !== undefined) updates.mp_receiver_id = body.mp_receiver_id;
    if (body.mp_seller_id !== undefined) updates.mp_seller_id = body.mp_seller_id;
    if (body.watermark_text !== undefined) {
      updates.watermark_text =
        body.watermark_text === null || body.watermark_text.trim() === ""
          ? null
          : normalizeWatermarkText(body.watermark_text);
    }
    if (body.watermark_use_logo !== undefined) {
      updates.watermark_use_logo = body.watermark_use_logo;
    }

    const { error } = await supabase.from("profiles").update(updates).eq("id", photographer.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
