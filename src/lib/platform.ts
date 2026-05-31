/** Identidad de la plataforma marketplace (independiente del logo del fotógrafo legacy). */
export const PLATFORM = {
  name: "Action Snap",
  tagline: "Marketplace de fotografía deportiva",
  taglineEs: "Marketplace de fotografía deportiva",
  description:
    "Los fotógrafos publican eventos y venden por dorsal. Los atletas encuentran, pagan y descargan sus fotos en HD al instante.",
  heroHeadline: "Cada momento, capturado.",
  heroSubheadline: "Encontrá tu mejor toma. Comprá en HD al instante.",
  commissionPercent: 20,
  photographerSharePercent: 80,
  /** Fondo principal del hero. */
  heroImageSrc: "/hero-motocross.jpg",
  heroPoster: "/hero-motocross.jpg",
} as const;

/** Mínimos de marketing cuando aún no hay datos en BD. */
export const TRUST_BASELINE = {
  events: 120,
  photographers: 80,
  photos: 250_000,
  downloads: 50_000,
} as const;

const SPORT_LABELS: Record<string, string> = {
  motocross: "Motocross",
  natacion: "Natación",
  triatlon: "Triatlón",
  ciclismo: "Ciclismo",
  rally: "Rally",
  cuatri: "Cuatri",
  otros: "Otros",
};

export type HomeStats = {
  events: number;
  photographers: number;
  photos: number;
  downloads: number;
};

function pickStat(actual: number | undefined, baseline: number): number {
  const n = actual ?? 0;
  return n > 0 ? n : baseline;
}

export function mergeHomeStats(partial: Partial<HomeStats>): HomeStats {
  return {
    events: pickStat(partial.events, TRUST_BASELINE.events),
    photographers: pickStat(partial.photographers, TRUST_BASELINE.photographers),
    photos: pickStat(partial.photos, TRUST_BASELINE.photos),
    downloads: pickStat(partial.downloads, TRUST_BASELINE.downloads),
  };
}

/** Formato compacto para stats (+120, 250k+). */
export function formatStatDisplay(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M+`;
  if (value >= 10_000) return `${Math.round(value / 1000)}k+`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
  return `${value}+`;
}

/** Eventos legacy sin columna `sport` se tratan como motocross. */
export function normalizeSport(sport?: string | null): string {
  const s = sport?.trim();
  return s || "motocross";
}

export function formatSportLabel(sport?: string | null): string {
  const key = normalizeSport(sport);
  return SPORT_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}
