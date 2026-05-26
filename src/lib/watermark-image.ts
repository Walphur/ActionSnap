import sharp from "sharp";
import { BRAND } from "@/lib/brand";

/** Genera preview con marca de agua repetida (para galería pública). */
export async function applyWatermark(input: Buffer): Promise<Buffer> {
  const meta = await sharp(input).metadata();
  const w = meta.width ?? 1200;
  const h = meta.height ?? 800;
  const text = BRAND.watermark;
  const fontSize = Math.max(22, Math.floor(Math.min(w, h) / 16));
  const big = Math.floor(fontSize * 1.4);

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="p" width="300" height="140" patternTransform="rotate(-32)" patternUnits="userSpaceOnUse">
      <text x="10" y="70" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff" fill-opacity="0.32">${text}</text>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#p)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial,Helvetica,sans-serif" font-size="${big}" font-weight="800" fill="#ffffff" fill-opacity="0.38">${text}</text>
</svg>`;

  return sharp(input)
    .composite([{ input: Buffer.from(svg), blend: "over" }])
    .jpeg({ quality: 85 })
    .toBuffer();
}
