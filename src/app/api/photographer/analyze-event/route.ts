import { NextResponse } from "next/server";
import { tagPhotoWithGoogleVision } from "@/lib/analyze-photo-google";
import { hasGoogleVision } from "@/lib/detect/google-vision";
import { getDetectionProviders } from "@/lib/detect-numbers";
import { runPool } from "@/lib/pool";
import { createClient } from "@/lib/supabase/server";
import { resolvePhotoAnalysisUrl } from "@/lib/supabase/photo-storage";

export const maxDuration = 300;

const BATCH_SIZE = 25;
const CONCURRENCY = 2;

type AnalyzeBody = {
  eventSlug?: string;
  photoId?: string;
  onlyPending?: boolean;
  limit?: number;
};

export async function POST(request: Request) {
  try {
    if (!hasGoogleVision()) {
      return NextResponse.json(
        {
          error: "Google Cloud Vision no configurado",
          hint: "Configurá GOOGLE_CLIENT_EMAIL y GOOGLE_PRIVATE_KEY en las variables de entorno.",
        },
        { status: 400 }
      );
    }

    const body = (await request.json()) as AnalyzeBody;
    const eventSlug = body.eventSlug?.trim();
    const photoId = body.photoId?.trim();

    if (!eventSlug && !photoId) {
      return NextResponse.json(
        { error: "Falta eventSlug o photoId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (photoId) {
      const { data: photo, error } = await supabase
        .from("photos")
        .select("id, original_url, event_id, events!inner(slug, photographer_id)")
        .eq("id", photoId)
        .single();

      if (error || !photo) {
        return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
      }

      const event = Array.isArray(photo.events) ? photo.events[0] : photo.events;
      if (!event || event.photographer_id !== user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }

      const imageUrl = await resolvePhotoAnalysisUrl(photo.original_url);
      const result = await tagPhotoWithGoogleVision(supabase, photo.id, imageUrl);

      return NextResponse.json({
        processed: 1,
        tagged: result.status === "done" ? 1 : 0,
        failed: result.status === "failed" ? 1 : 0,
        remaining: 0,
        total: 1,
        photoId: photo.id,
        dorsales: result.numbers,
        labels: result.labels,
        providers: getDetectionProviders(),
        done: true,
        message:
          result.status === "done"
            ? `Dorsales detectados: ${result.numbers.join(", ")}`
            : result.status === "no_numbers"
              ? "No se detectaron dorsales en esta foto."
              : "Error al analizar la foto.",
      });
    }

    const limit = Math.min(body.limit ?? BATCH_SIZE, 50);
    const onlyPending = body.onlyPending !== false;

    const { data: event } = await supabase
      .from("events")
      .select("id, slug")
      .eq("slug", eventSlug!)
      .eq("photographer_id", user.id)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const { data: allPhotos } = await supabase
      .from("photos")
      .select("id, original_url, ai_status, photo_numbers(number)")
      .eq("event_id", event.id)
      .order("created_at", { ascending: true });

    const photos = (allPhotos ?? []).filter((p) => {
      if (!onlyPending) return true;
      const hasNumbers = (p.photo_numbers?.length ?? 0) > 0;
      const needsWork =
        !hasNumbers ||
        p.ai_status === "skipped" ||
        p.ai_status === "pending" ||
        p.ai_status === "failed" ||
        p.ai_status === "processing";
      return needsWork;
    });

    const batch = photos.slice(0, limit);
    let tagged = 0;
    let failed = 0;

    await runPool(batch, CONCURRENCY, async (photo) => {
      const imageUrl = await resolvePhotoAnalysisUrl(photo.original_url);
      const result = await tagPhotoWithGoogleVision(supabase, photo.id, imageUrl);
      if (result.status === "done") tagged++;
      if (result.status === "failed") failed++;
    });

    const remaining = Math.max(0, photos.length - batch.length);

    return NextResponse.json({
      processed: batch.length,
      tagged,
      failed,
      remaining,
      total: allPhotos?.length ?? 0,
      pendingTotal: photos.length,
      providers: ["Google Cloud Vision", ...getDetectionProviders()],
      done: remaining === 0,
      message:
        remaining > 0
          ? `Procesadas ${batch.length} fotos con Google Vision. Quedan ${remaining} — volvé a pulsar Analizar.`
          : `Listo: ${tagged} con dorsal de ${allPhotos?.length ?? 0} fotos.`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en analyze-event" },
      { status: 500 }
    );
  }
}
