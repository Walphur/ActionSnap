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
      return null;
    }
  }

  return getPlatformLogoBuffer();
}

/** Baja la opacidad del logo sin tapar al sujeto. */
async function withAlpha(buffer: Buffer, opacity: number): Promise<Buffer> {
  const alpha = Math.max(0, Math.min(255, Math.round(255 * opacity)));
  return sharp(buffer, { failOn: "none" })
    .ensureAlpha()
    .composite([
      {
        input: Buffer.from([255, 255, 255, alpha]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
}

function escapeSvgText(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Preview con marca de agua suave:
 * texto diagonal fino/transparente + logo chico abajo a la derecha.
 */
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
  const fontSize = Math.max(12, Math.floor(Math.min(w, h) / 36));
  const patternW = Math.max(280, Math.floor(w / 2.2));
  const patternH = Math.max(160, Math.floor(h / 2.8));

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="p" width="${patternW}" height="${patternH}" patternTransform="rotate(-28)" patternUnits="userSpaceOnUse">
      <text x="12" y="${Math.floor(patternH * 0.55)}" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="600" fill="#ffffff" fill-opacity="0.11">${text}</text>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#p)"/>
</svg>`;

  const composites: sharp.OverlayOptions[] = [{ input: Buffer.from(svg), blend: "over" }];

  const logo = await resolveLogoBuffer(options);
  if (logo) {
    const logoW = Math.max(64, Math.floor(w * 0.2));
    const margin = Math.max(12, Math.floor(w * 0.03));
    const logoOverlay = await withAlpha(
      await sharp(logo, { failOn: "none" }).resize(logoW).ensureAlpha().toBuffer(),
      0.38
    );
    const logoMeta = await sharp(logoOverlay).metadata();
    const lh = logoMeta.height ?? Math.floor(logoW * 0.4);
    composites.push({
      input: logoOverlay,
      left: Math.max(0, w - logoW - margin),
      top: Math.max(0, h - lh - margin),
      blend: "over",
    });
  }

  return sharp(input, { failOn: "none", sequentialRead: true })
    .composite(composites)
    .jpeg({ quality: 85 })
    .toBuffer();
}
