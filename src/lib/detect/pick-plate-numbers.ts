type OcrWord = {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
};

type Candidate = {
  number: string;
  height: number;
  area: number;
  centerY: number;
  centerX: number;
  confidence: number;
};

/** Une "2" + "7" en la misma línea → "27" */
function mergeWordsIntoPlates(words: OcrWord[], imageW: number, imageH: number): Candidate[] {
  const chars = words
    .map((w) => {
      const t = w.text.replace(/[^\d]/g, "");
      if (!t) return null;
      const height = w.bbox.y1 - w.bbox.y0;
      const width = w.bbox.x1 - w.bbox.x0;
      return {
        text: t,
        height,
        width,
        x0: w.bbox.x0,
        y0: w.bbox.y0,
        x1: w.bbox.x1,
        y1: w.bbox.y1,
        cx: (w.bbox.x0 + w.bbox.x1) / 2,
        cy: (w.bbox.y0 + w.bbox.y1) / 2,
        conf: w.confidence,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.conf >= 25);

  if (chars.length === 0) return [];

  const avgH =
    chars.reduce((s, c) => s + c.height, 0) / chars.length || 20;
  const used = new Set<number>();
  const plates: Candidate[] = [];

  for (let i = 0; i < chars.length; i++) {
    if (used.has(i)) continue;
    const group = [chars[i]];
    used.add(i);

    for (let j = i + 1; j < chars.length; j++) {
      if (used.has(j)) continue;
      const a = group[group.length - 1];
      const b = chars[j];
      const sameLine = Math.abs(a.cy - b.cy) < avgH * 0.85;
      const closeX = b.x0 - a.x1 < avgH * 2.5 && b.x0 >= a.x0;
      if (sameLine && closeX) {
        group.push(b);
        used.add(j);
      }
    }

    group.sort((a, b) => a.x0 - b.x0);
    const number = group.map((g) => g.text).join("").replace(/^0+/, "") || "0";
    if (!/^\d{1,3}$/.test(number)) continue;
    const v = parseInt(number, 10);
    if (v < 1 || v > 199) continue;

    const x0 = Math.min(...group.map((g) => g.x0));
    const y0 = Math.min(...group.map((g) => g.y0));
    const x1 = Math.max(...group.map((g) => g.x1));
    const y1 = Math.max(...group.map((g) => g.y1));
    const height = y1 - y0;
    const area = (x1 - x0) * height;

    plates.push({
      number,
      height,
      area,
      centerY: (y0 + y1) / 2 / imageH,
      centerX: (x0 + x1) / 2 / imageW,
      confidence: group.reduce((s, g) => s + g.conf, 0) / group.length / 100,
    });
  }

  return plates;
}

function scorePlate(c: Candidate): number {
  let score = c.height * 4 + c.area * 0.01 + c.confidence * 50;
  if (c.number.length >= 2) score += 80;
  if (c.number.length === 3) score += 20;
  if (c.centerY < 0.55) score += 40;
  if (c.centerX > 0.25 && c.centerX < 0.75) score += 30;
  if (c.number === "2" && c.height < 40) score -= 60;
  if (c.number === "3" || c.number === "5" || c.number === "7") score -= 15;
  return score;
}

/** Un solo dorsal: el del tablero grande (ej. 27, no 2+3+5 sueltos) */
export function pickPlateNumbers(
  words: OcrWord[],
  imageWidth: number,
  imageHeight: number
): { number: string; confidence: number }[] {
  const plates = mergeWordsIntoPlates(words, imageWidth, imageHeight);
  if (plates.length === 0) return [];

  const best = plates.sort((a, b) => scorePlate(b) - scorePlate(a))[0];
  return [
    {
      number: best.number,
      confidence: Math.min(0.98, 0.75 + scorePlate(best) / 200),
    },
  ];
}
