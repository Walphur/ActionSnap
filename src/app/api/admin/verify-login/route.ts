import { NextResponse } from "next/server";
import { getAdminProfile } from "@/lib/admin-auth";

export async function POST() {
  const profile = await getAdminProfile();

  if (!profile) {
    return NextResponse.json(
      { error: "Esta cuenta no tiene permisos de administrador." },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true, profile: { id: profile.id, fullName: profile.full_name } });
}
