/** Identidad de la plataforma marketplace (independiente del logo del fotógrafo legacy). */
export const PLATFORM = {
  name: "Fotogramos",
  tagline: "Marketplace de fotografía deportiva",
  description:
    "Encontrá tus fotos por dorsal, pagá online y descargá en HD. Los fotógrafos publican eventos y cobran con split automático.",
  commissionPercent: 20,
  photographerSharePercent: 80,
} as const;

const SPORT_LABELS: Record<string, string> = {
  motocross: "Motocross",
  natacion: "Natación",
  triatlon: "Triatlón",
  ciclismo: "Ciclismo",
  otros: "Otros",
};

/** Eventos legacy sin columna `sport` se tratan como motocross. */
export function normalizeSport(sport?: string | null): string {
  const s = sport?.trim();
  return s || "motocross";
}

export function formatSportLabel(sport?: string | null): string {
  const key = normalizeSport(sport);
  return SPORT_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}
