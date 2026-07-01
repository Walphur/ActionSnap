import { NextResponse } from "next/server";
import { getRacerSession } from "@/lib/racer-auth";
import { getRacerPurchasesGrouped } from "@/lib/racer-purchases";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const session = await getRacerSession();
    if (!session.ok) {
      const status = session.reason === "unauthenticated" ? 401 : 403;
      const message =
        session.reason === "not-racer"
          ? "Esta cuenta no es de piloto/atleta."
          : "Iniciá sesión para ver tus compras.";
      return NextResponse.json({ error: message }, { status });
    }

    const supabase = createServiceClient();
    const events = await getRacerPurchasesGrouped(
      supabase,
      session.userId,
      session.email
    );

    const totalPhotos = events.reduce((sum, group) => sum + group.photos.length, 0);

    return NextResponse.json({
      email: session.email,
      fullName: session.profile.full_name,
      events,
      totalPhotos,
    });
  } catch (e) {
    console.error("racer/purchases:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al cargar compras" },
      { status: 500 }
    );
  }
}
