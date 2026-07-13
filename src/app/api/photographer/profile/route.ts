import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePhotographerProfile } from "@/lib/photographer-auth";
import { normalizeWatermarkText } from "@/lib/watermark-config";

const patchSchema = z.object({
  watermark_text: z.string().max(32).optional().nullable(),
  watermark_use_logo: z.boolean().optional(),
  accepts_bank_transfer: z.boolean().optional(),
  bank_cbu: z.string().max(22).optional().nullable(),
  bank_alias: z.string().max(64).optional().nullable(),
  bank_holder_name: z.string().max(120).optional().nullable(),
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
      accepts_bank_transfer: profile.accepts_bank_transfer ?? false,
      bank_cbu: profile.bank_cbu ?? null,
      bank_alias: profile.bank_alias ?? null,
      bank_holder_name: profile.bank_holder_name ?? null,
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
    if (body.watermark_text !== undefined) {
      updates.watermark_text =
        body.watermark_text === null || body.watermark_text.trim() === ""
          ? null
          : normalizeWatermarkText(body.watermark_text);
    }
    if (body.watermark_use_logo !== undefined) {
      updates.watermark_use_logo = body.watermark_use_logo;
    }
    if (body.accepts_bank_transfer !== undefined) {
      updates.accepts_bank_transfer = body.accepts_bank_transfer;
    }
    if (body.bank_cbu !== undefined) {
      updates.bank_cbu = body.bank_cbu?.trim() || null;
    }
    if (body.bank_alias !== undefined) {
      updates.bank_alias = body.bank_alias?.trim() || null;
    }
    if (body.bank_holder_name !== undefined) {
      updates.bank_holder_name = body.bank_holder_name?.trim() || null;
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
