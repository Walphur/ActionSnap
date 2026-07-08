import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveHdDownloadUrl } from "@/lib/photo-download";
import { getRacerSession } from "@/lib/racer-auth";
import { userOwnsPhoto } from "@/lib/racer-purchases";
import { createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  photoId: z.string().uuid(),
  fileName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getRacerSession();
    if (!session.ok) {
      const status = session.reason === "unauthenticated" ? 401 : 403;
      return NextResponse.json(
        {
          error:
            session.reason === "not-racer"
              ? "Esta cuenta no es de cliente/comprador."
              : "Iniciá sesión para descargar.",
        },
        { status }
      );
    }

    const json = await request.json();
    const { photoId, fileName } = bodySchema.parse(json);

    const supabase = createServiceClient();
    const owned = await userOwnsPhoto(
      supabase,
      session.userId,
      session.email,
      photoId
    );

    if (!owned) {
      return NextResponse.json(
        { error: "No tenés acceso a esta foto." },
        { status: 403 }
      );
    }

    const downloadUrl = await resolveHdDownloadUrl(
      owned.originalUrl,
      owned.cloudinaryPublicId,
      3600
    );

    return NextResponse.json({
      downloadUrl,
      fileName: fileName ?? `action-snap-${photoId.slice(0, 8)}.jpg`,
    });
  } catch (e) {
    console.error("racer/download:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo generar la descarga" },
      { status: 500 }
    );
  }
}
