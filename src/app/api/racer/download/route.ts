import { NextResponse } from "next/server";
import { z } from "zod";
import { signedDownloadUrl } from "@/lib/cloudinary";
import { getRacerSession } from "@/lib/racer-auth";
import { userOwnsPhoto } from "@/lib/racer-purchases";
import { isHdStoragePath } from "@/lib/supabase/photo-storage";
import { createHdDownloadUrl } from "@/lib/supabase/signed-url";
import { createServiceClient } from "@/lib/supabase/server";
import { hasCloudinary } from "@/lib/storage";

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
              ? "Esta cuenta no es de piloto/atleta."
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

    let downloadUrl = owned.originalUrl;

    if (isHdStoragePath(owned.originalUrl)) {
      downloadUrl = await createHdDownloadUrl(owned.originalUrl, 3600);
    } else if (hasCloudinary() && owned.cloudinaryPublicId) {
      downloadUrl = signedDownloadUrl(owned.cloudinaryPublicId);
    }

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
