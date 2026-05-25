import { NextResponse } from "next/server";
import { tagPhotoWithAI, hasOpenAI } from "@/lib/analyze-photo";
import { getCloudBlockReason, getDetectionProviders, isCloudBlocked } from "@/lib/detect-numbers";
import { runPool } from "@/lib/pool";
import { createServiceClient } from "@/lib/supabase/server";

export const maxDuration = 300;

const BATCH_SIZE = 25;
const CONCURRENCY = 2;

export async function POST(request: Request) {
  if (!hasOpenAI()) {
    return NextResponse.json(
      {
        error: "Detección desactivada",
        hint: "El OCR local debería estar activo. No pongas DETECTION_DISABLE_LOCAL=true.",
      },
      { status: 400 }
    );
  }

  const body = (await request.json()) as {
    eventSlug?: string;
    onlyPending?: boolean;
    limit?: number;
  };

  const eventSlug = body.eventSlug?.trim();
  if (!eventSlug) {
    return NextResponse.json({ error: "Falta eventSlug" }, { status: 400 });
  }

  const limit = Math.min(body.limit ?? BATCH_SIZE, 50);
  const onlyPending = body.onlyPending !== false;

  const supabase = createServiceClient();
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("slug", eventSlug)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Carrera no encontrada" }, { status: 404 });
  }

  const { data: allPhotos } = await supabase
    .from("photos")
    .select("id, preview_url, ai_status, photo_numbers(number)")
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
    const result = await tagPhotoWithAI(supabase, photo.id, photo.preview_url);
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
    providers: getDetectionProviders(),
    cloudBlocked: isCloudBlocked(),
    cloudNote: isCloudBlocked() ? getCloudBlockReason() : null,
    done: remaining === 0,
    message:
      remaining > 0
        ? `Procesadas ${batch.length} fotos. Quedan ${remaining} — volvé a pulsar Analizar.`
        : `Listo: ${tagged} con dorsal de ${allPhotos?.length ?? 0} fotos.`,
  });
}
