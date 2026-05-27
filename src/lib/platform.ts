/** Identidad de la plataforma marketplace (independiente del logo del fotógrafo legacy). */
export const PLATFORM = {
  name: "Fotogramos",
  tagline: "Marketplace de fotografía deportiva",
  description:
    "Encontrá tus fotos por dorsal, pagá online y descargá en HD. Los fotógrafos publican eventos y cobran con split automático.",
  commissionPercent: 20,
  photographerSharePercent: 80,
} as const;

export function formatSportLabel(sport: string) {
  const map: Record<string, string> = {
    motocross: "Motocross",
    natacion: "Natación",
    triatlon: "Triatlón",
    ciclismo: "Ciclismo",
    otros: "Otros",
  };
  return map[sport] ?? sport.charAt(0).toUpperCase() + sport.slice(1);
}
