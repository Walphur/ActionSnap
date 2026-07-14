import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  createHdPresignedPut,
  r2DirectUploadEnabled,
} from "@/lib/r2/presign-upload";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_BYTES = 40 * 1024 * 1024;

type PresignBody = {
  eventSlug?: string;
  fileName?: string;
  contentType?: string;
  byteSize?: number;
};

export async function POST(request: Request) {
  try {
    if (!r2DirectUploadEnabled()) {
      return NextResponse.json(
        { error: "R2 no configurado", code: "R2_DISABLED" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as PresignBody;
    const eventSlug = body.eventSlug?.trim();
    const fileName = body.fileName?.trim() || "foto.jpg";
    const contentType = (body.contentType || "image/jpeg").split(";")[0].trim().toLowerCase();
    const byteSize = typeof body.byteSize === "number" ? body.byteSize : 0;

    if (!eventSlug) {
      return NextResponse.json({ error: "Falta eventSlug" }, { status: 400 });
    }

    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    const allowedExt = ["jpg", "jpeg"];
    if (!allowedExt.includes(ext)) {
      return NextResponse.json(
        {
          error: "Subida directa solo JPG",
          code: "USE_PROXY",
          hint: "PNG/WebP usan el camino clásico.",
        },
        { status: 400 }
      );
    }

    if (!contentType.includes("jpeg") && !contentType.includes("jpg")) {
      return NextResponse.json(
        { error: "Content-Type debe ser image/jpeg", code: "USE_PROXY" },
        { status: 400 }
      );
    }

    if (byteSize <= 0 || byteSize > MAX_BYTES) {
      return NextResponse.json(
        { error: `Archivo inválido o > ${MAX_BYTES / (1024 * 1024)} MB` },
        { status: 413 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "photographer") {
      return NextResponse.json({ error: "Solo fotógrafos" }, { status: 403 });
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, slug, photographer_id")
      .eq("slug", eventSlug)
      .eq("photographer_id", user.id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: `Evento "${eventSlug}" no existe` }, { status: 404 });
    }

    const photoId = randomUUID();
    const signed = await createHdPresignedPut({
      photographerId: user.id,
      eventId: event.id,
      photoId,
      contentType: "image/jpeg",
    });

    return NextResponse.json({
      photoId,
      eventId: event.id,
      objectKey: signed.objectKey,
      uploadUrl: signed.uploadUrl,
      contentType: "image/jpeg",
      expiresIn: signed.expiresIn,
      mode: "direct-r2",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error de presign" },
      { status: 500 }
    );
  }
}
