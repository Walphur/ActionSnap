import { NextResponse } from "next/server";
import sharp from "sharp";
import { configureSharpForLowMemory } from "@/lib/compress-image";
import { requirePhotographerProfile } from "@/lib/photographer-auth";
import { profilesSchemaHint, updateProfileRow } from "@/lib/profiles-db";
import { createServiceClient } from "@/lib/supabase/server";
import { PREVIEW_BUCKET } from "@/lib/supabase/photo-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_MB = 8;
const LOGO_MAX_EDGE = 1200;

async function prepareLogoPng(buffer: Buffer): Promise<Buffer> {
  configureSharpForLowMemory();
  return sharp(buffer, { failOn: "none", sequentialRead: true, limitInputPixels: 40_000_000 })
    .rotate()
    .resize({
      width: LOGO_MAX_EDGE,
      height: LOGO_MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .ensureAlpha()
    .png({ compressionLevel: 8 })
    .toBuffer();
}

/** Sube el logo del fotógrafo para la marca de agua (reemplaza Action Snap). */
export async function POST(request: Request) {
  try {
    const photographer = await requirePhotographerProfile();
    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file?.size) {
      return NextResponse.json({ error: "Falta el archivo de logo" }, { status: 400 });
    }

    if (file.size > MAX_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `El logo pesa más de ${MAX_MB} MB. Usá PNG/JPG más liviano.` },
        { status: 413 }
      );
    }

    let png: Buffer;
    try {
      png = await prepareLogoPng(Buffer.from(await file.arrayBuffer()));
    } catch (err) {
      return NextResponse.json(
        {
          error: err instanceof Error ? err.message : "No se pudo procesar el logo",
          hint: "Usá PNG o JPG (ideal con fondo transparente).",
        },
        { status: 400 }
      );
    }

    const service = createServiceClient();
    const storagePath = `${photographer.id}/watermark-logo.png`;

    const { error: uploadError } = await service.storage
      .from(PREVIEW_BUCKET)
      .upload(storagePath, png, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      if (uploadError.message.includes("Bucket not found")) {
        return NextResponse.json(
          {
            error: "Falta el bucket public-previews en Supabase",
            hint: "Ejecutá supabase/create-storage-buckets.sql.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: pub } = service.storage.from(PREVIEW_BUCKET).getPublicUrl(storagePath);
    // cache-bust para que el preview del panel se actualice
    const logoUrl = `${pub.publicUrl}?v=${Date.now()}`;

    const { ok, error, skippedKeys } = await updateProfileRow(service, photographer.id, {
      watermark_logo_url: logoUrl,
      watermark_use_logo: true,
    });

    if (!ok) {
      return NextResponse.json(
        {
          error: error ?? "Logo subido pero no se pudo guardar en el perfil",
          hint: profilesSchemaHint(error ?? "") ?? "Ejecutá supabase/fix-watermark-logo-url.sql",
          skippedKeys: skippedKeys.length ? skippedKeys : undefined,
        },
        { status: 400 }
      );
    }

    if (skippedKeys.includes("watermark_logo_url")) {
      return NextResponse.json(
        {
          error: "Falta la columna watermark_logo_url",
          hint: "En Supabase SQL Editor ejecutá supabase/fix-watermark-logo-url.sql",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, watermark_logo_url: logoUrl });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 401 }
    );
  }
}

/** Quita el logo propio (vuelve al de Action Snap si el check está activo). */
export async function DELETE() {
  try {
    const photographer = await requirePhotographerProfile();
    const service = createServiceClient();
    const storagePath = `${photographer.id}/watermark-logo.png`;

    await Promise.allSettled([
      service.storage.from(PREVIEW_BUCKET).remove([storagePath]),
    ]);

    const { ok, error } = await updateProfileRow(service, photographer.id, {
      watermark_logo_url: null,
    });

    if (!ok) {
      return NextResponse.json(
        {
          error: error ?? "No se pudo quitar el logo",
          hint: profilesSchemaHint(error ?? ""),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, watermark_logo_url: null });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 401 }
    );
  }
}
