import sharp from "sharp";

const MAX_INPUT_MB = 40;

/** Tope solo para portadas / usos livianos (no para descarga HD). */
const PREVIEWISH_MAX_WIDTH = 2400;

/**
 * Original de venta: mantiene la resolución de cámara (ej. 6000×4000).
 * Solo corrige orientación EXIF y re-encodea JPEG de alta calidad.
 * No achicar acá: las gigantografías / banners necesitan el pixel real.
 */
export async function prepareHdOriginal(buffer: Buffer, _mime: string) {
  if (buffer.length > MAX_INPUT_MB * 1024 * 1024) {
    throw new Error(
      `La imagen pesa más de ${MAX_INPUT_MB} MB. Subí JPG/PNG más liviano o comprimí sin bajar resolución.`
    );
  }

  return sharp(buffer, { failOn: "none", limitInputPixels: 100_000_000 })
    .rotate()
    .withMetadata()
    .jpeg({
      quality: 95,
      mozjpeg: true,
      chromaSubsampling: "4:4:4",
    })
    .toBuffer();
}

/** Reduce peso para portadas / assets no-HD. */
export async function compressImage(buffer: Buffer, mime: string) {
  if (buffer.length > MAX_INPUT_MB * 1024 * 1024) {
    throw new Error(
      `La imagen pesa más de ${MAX_INPUT_MB} MB. Comprimila antes de subir.`
    );
  }

  const pipeline = sharp(buffer, { failOn: "none" })
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
