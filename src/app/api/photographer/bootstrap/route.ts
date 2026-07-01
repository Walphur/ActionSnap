import { NextResponse } from "next/server";
import { ensurePhotographerProfileRow, requirePhotographerProfile } from "@/lib/photographer-auth";
import { createClient } from "@/lib/supabase/server";

/** Repara perfiles faltantes tras registro/login (idempotente). */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await ensurePhotographerProfileRow(user);
    const profile = await requirePhotographerProfile();

    return NextResponse.json({
      ok: true,
      profile: {
        id: profile.id,
        role: profile.role,
        full_name: profile.full_name,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
