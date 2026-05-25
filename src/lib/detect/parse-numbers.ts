/** Extrae dorsales 1-3 cifras de texto OCR o JSON */
export function parseNumbersFromText(text: string): { number: string; confidence: number }[] {
  const found = new Set<string>();
  const results: { number: string; confidence: number }[] = [];

  const matches = text.match(/\b\d{1,3}\b/g) ?? [];
  for (const raw of matches) {
    const n = raw.replace(/^0+/, "") || "0";
    if (n.length > 3) continue;
    if (["0", "1"].includes(n) && matches.length > 3) continue;
    if (parseInt(n, 10) > 999) continue;
    if (found.has(n)) continue;
    found.add(n);
    results.push({ number: n, confidence: 0.75 });
  }
  return results;
}

export function parseNumbersFromJson(raw: string): { number: string; confidence: number }[] {
  try {
    const parsed = JSON.parse(raw) as {
      numbers?: Array<string | { value?: string; number?: string; confidence?: number }>;
    };
    const list = parsed.numbers ?? [];
    return list
      .map((item) => {
        if (typeof item === "string") {
          const n = item.replace(/\D/g, "");
          return { number: n, confidence: 0.9 };
        }
        const n = String(item.value ?? item.number ?? "").replace(/\D/g, "");
        return {
          number: n,
          confidence: Math.min(1, item.confidence ?? 0.9),
        };
      })
      .filter((x) => /^\d{1,3}$/.test(x.number));
  } catch {
    return parseNumbersFromText(raw);
  }
}

export function mergeDetections(
  lists: { number: string; confidence: number }[][]
): { number: string; confidence: number }[] {
  const map = new Map<string, number>();
  for (const list of lists) {
    for (const { number, confidence } of list) {
      const prev = map.get(number) ?? 0;
      map.set(number, Math.max(prev, confidence));
    }
  }
  return [...map.entries()]
    .map(([number, confidence]) => ({ number, confidence }))
    .sort((a, b) => b.confidence - a.confidence);
}
