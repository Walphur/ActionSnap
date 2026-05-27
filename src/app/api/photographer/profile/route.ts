import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePhotographerProfile } from "@/lib/photographer-auth";

const patchSchema = z.object({
  mp_receiver_id: z.string().min(2).optional().nullable(),
  mp_seller_id: z.string().min(2).optional().nullable(),
});

export async function GET() {
  try {
    const profile = await requirePhotographerProfile();
    return NextResponse.json({
      id: profile.id,
      mp_receiver_id: profile.mp_receiver_id,
      mp_seller_id: profile.mp_seller_id,
    });
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

    const updates: Record<string, unknown> = {};
    if (body.mp_receiver_id !== undefined) updates.mp_receiver_id = body.mp_receiver_id;
    if (body.mp_seller_id !== undefined) updates.mp_seller_id = body.mp_seller_id;

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

