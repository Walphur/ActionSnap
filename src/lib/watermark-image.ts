import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { BRAND } from "@/lib/brand";

let logoBuffer: Buffer | null = null;

async function getLogoBuffer() {
  if (logoBuffer) return logoBuffer;
  try {
    const p = path.join(process.cwd(), "public", "logo-victor-films-transparent.png");
    logoBuffer = await readFile(p);
    return logoBuffer;
  } catch {
    return null;
  }
}

/** Preview con marca de agua (texto + logo). */
export async function applyWatermark(input: Buffer): Promise<Buffer> {
  const meta = await sharp(input).metadata();
  const w = meta.width ?? 1200;
  const h = meta.height ?? 800;
  const text = BRAND.watermark;
  const fontSize = Math.max(22, Math.floor(Math.min(w, h) / 16));

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="p" width="300" height="140" patternTransform="rotate(-32)" patternUnits="userSpaceOnUse">
      <text x="10" y="70" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff" fill-opacity="0.28">${text}</text>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#p)"/>
</svg>`;

  const composites: sharp.OverlayOptions[] = [
    { input: Buffer.from(svg), blend: "over" },
  ];

  const logo = await getLogoBuffer();
  if (logo) {
    const logoW = Math.floor(w * 0.45);
    const logoOverlay = await sharp(logo)
      .resize(logoW)
      .ensureAlpha()
      .modulate({ brightness: 1.1 })
      .toBuffer();
    composites.push({
      input: logoOverlay,
      gravity: "centre",
      blend: "over",
    });
  }

  return sharp(input).composite(composites).jpeg({ quality: 85 }).toBuffer();
}
