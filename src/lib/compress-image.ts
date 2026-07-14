import sharp from "sharp";

const MAX_INPUT_MB = 40;

/** Tope solo para portadas / usos livianos (no para descarga HD). */
const PREVIEWISH_MAX_WIDTH = 2400;

/** En Render Starter (512 MB) Sharp en paralelo se come toda la RAM. */
export function configureSharpForLowMemory() {
  try {
    sharp.concurrency(1);
    sharp.cache(false);
  } catch {
    /* ignore */
  }
}

export type HdOriginalAssets = {
  buffer: Buffer;
  contentType: string;
  width: number | null;
  height: number | null;
};

function looksLikeJpeg(buffer: Buffer, mime: string): boolean {
  if (mime.includes("jpeg") || mime.includes("jpg")) return true;
  // SOI marker
  return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

/**
 * Original de venta a resolución de cámara.
 * JPG: bytes tal cual (cero Sharp) — en 512 MB re-encodear HD mataba el proceso.
 * PNG/WebP: se convierte a JPEG alta calidad sin achicar.
 */
export async function prepareHdOriginal(
  buffer: Buffer,
  mime: string
): Promise<HdOriginalAssets> {
  if (buffer.length > MAX_INPUT_MB * 1024 * 1024) {
    throw new Error(
      `La imagen pesa más de ${MAX_INPUT_MB} MB. Subí JPG/PNG más liviano o comprimí sin bajar resolución.`
    );
  }

  if (looksLikeJpeg(buffer, mime)) {
    return {
      buffer,
      contentType: "image/jpeg",
      width: null,
      height: null,
    };
  }

  configureSharpForLowMemory();

  const converted = await sharp(buffer, {
    failOn: "none",
    sequentialRead: true,
    limitInputPixels: 100_000_000,
  })
    .rotate()
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  const outMeta = await sharp(converted, {
    failOn: "none",
    sequentialRead: true,
  }).metadata();

  return {
    buffer: converted,
    contentType: "image/jpeg",
    width: outMeta.width ?? null,
    height: outMeta.height ?? null,
  };
}

/** Reduce peso para portadas / assets no-HD. */
export async function compressImage(buffer: Buffer, mime: string) {
  if (buffer.length > MAX_INPUT_MB * 1024 * 1024) {
    throw new Error(
      `La imagen pesa más de ${MAX_INPUT_MB} MB. Comprimila antes de subir.`
    );
  }

  configureSharpForLowMemory();

  const pipeline = sharp(buffer, { failOn: "none", sequentialRead: true })
    .rotate()
    .resize({
      width: PREVIEWISH_MAX_WIDTH,
      height: PREVIEWISH_MAX_WIDTH,
      fit: "inside",
      withoutEnlargement: true,
    });

  if (mime.includes("png")) {
    return pipeline.png({ quality: 85, compressionLevel: 8 }).toBuffer();
  }
  if (mime.includes("webp")) {
    return pipeline.webp({ quality: 85 }).toBuffer();
  }

  return pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
}
