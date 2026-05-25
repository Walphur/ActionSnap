import sharp from "sharp";

const MAX_INPUT_MB = 25;
const MAX_WIDTH = 2400;

/** Reduce peso de fotos grandes (común en JPG "scaled" de motos) */
export async function compressImage(buffer: Buffer, mime: string) {
  if (buffer.length > MAX_INPUT_MB * 1024 * 1024) {
    throw new Error(
      `La imagen pesa más de ${MAX_INPUT_MB} MB. Comprimila antes de subir.`
    );
  }

  const pipeline = sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({
      width: MAX_WIDTH,
      height: MAX_WIDTH,
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
