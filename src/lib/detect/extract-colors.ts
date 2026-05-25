import sharp from "sharp";

const COLORS: { name: string; rgb: [number, number, number]; minSat?: number }[] = [
  { name: "rojo", rgb: [210, 50, 45] },
  { name: "naranja", rgb: [235, 130, 25] },
  { name: "amarillo", rgb: [245, 215, 35], minSat: 0.25 },
  { name: "verde", rgb: [45, 150, 65] },
  { name: "azul", rgb: [35, 85, 210] },
  { name: "rosa", rgb: [230, 90, 150] },
  { name: "blanco", rgb: [245, 245, 245] },
  { name: "negro", rgb: [25, 25, 28] },
  { name: "gris", rgb: [120, 120, 125] },
];

function rgbToHsv(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return { h, s, v };
}

function nearestColor(r: number, g: number, b: number, sat: number) {
  if (sat < 0.12 && r > 200 && g > 200 && b > 200) return "blanco";
  if (sat < 0.12 && r < 55 && g < 55 && b < 55) return "negro";
  if (sat < 0.15) return "gris";

  let best = COLORS[0];
  let bestDist = Infinity;
  for (const c of COLORS) {
    if (c.minSat && sat < c.minSat) continue;
    const [cr, cg, cb] = c.rgb;
    const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best.name;
}

async function dominantInRegion(buffer: Buffer, region: "bike" | "rider") {
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 1;
  const h = meta.height ?? 1;

  const extract =
    region === "rider"
      ? { left: Math.floor(w * 0.2), top: 0, width: Math.floor(w * 0.6), height: Math.floor(h * 0.35) }
      : {
          left: Math.floor(w * 0.1),
          top: Math.floor(h * 0.35),
          width: Math.floor(w * 0.8),
          height: Math.floor(h * 0.55),
        };

  const { data, info } = await sharp(buffer)
    .extract(extract)
    .resize(80, 80)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const counts = new Map<string, number>();
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const { s } = rgbToHsv(r, g, b);
    const name = nearestColor(r, g, b, s);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted[0]?.[0] ?? "gris";
  if (top === "gris" && sorted[1]) return sorted[1][0];
  return top;
}

export async function extractBikeAndRiderColors(buffer: Buffer) {
  const rgb = await sharp(buffer).rotate().toBuffer();
  const rider_color = await dominantInRegion(rgb, "rider");
  const bike_color = await dominantInRegion(rgb, "bike");
  return { rider_color, bike_color };
}
