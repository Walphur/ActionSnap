import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { BRAND } from "@/lib/brand";
import { fetchImageBuffer } from "@/lib/fetch-image";
import { DEFAULT_WATERMARK, type WatermarkOptions } from "@/lib/watermark-config";

let platformLogoBuffer: Buffer | null = null;

async function getPlatformLogoBuffer() {
  if (platformLogoBuffer) return platformLogoBuffer;
  try {
    const p = path.join(process.cwd(), "public", BRAND.logoSrc.replace(/^\//, ""));
    platformLogoBuffer = await readFile(p);
    return platformLogoBuffer;
  } catch {
    return null;
  }
}

async function resolveLogoBuffer(options: WatermarkOptions): Promise<Buffer | null> {
  if (!options.useLogo) return null;

  if (options.logoUrl) {
    try {
      const { buffer } = await fetchImageBuffer(options.logoUrl);
      return buffer;
    } catch {
      // Si falla el logo propio, no caemos al de Action Snap (sería confuso).
      return null;
    }
  }

  return getPlatformLogoBuffer();
}

function escapeSvgText(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Preview con marca de agua (texto + logo propio o Action Snap). */
export async function applyWatermark(
  input: Buffer,
  options: WatermarkOptions = DEFAULT_WATERMARK
): Promise<Buffer> {
  try {
    sharp.concurrency(1);
    sharp.cache(false);
  } catch {
    /* ignore */
  }

  const meta = await sharp(input, { failOn: "none", sequentialRead: true }).metadata();
  const w = meta.width ?? 1200;
  const h = meta.height ?? 800;
  const text = escapeSvgText(options.text);
  const fontSize = Math.max(22, Math.floor(Math.min(w, h) / 16));

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="p" width="300" height="140" patternTransform="rotate(-32)" patternUnits="userSpaceOnUse">
      <text x="10" y="70" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff" fill-opacity="0.28">${text}</text>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#p)"/>
</svg>`;

  const composites: sharp.OverlayOptions[] = [{ input: Buffer.from(svg), blend: "over" }];

  const logo = await resolveLogoBuffer(options);
  if (logo) {
    const logoW = Math.floor(w * 0.45);
    const logoOverlay = await sharp(logo, { failOn: "none" })
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

  return sharp(input, { failOn: "none", sequentialRead: true })
    .composite(composites)
    .jpeg({ quality: 85 })
    .toBuffer();
}
