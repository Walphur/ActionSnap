/** Colores sugeridos para etiquetado manual — el fotógrafo puede escribir cualquier otro. */
export const SUGGESTED_BIKE_COLORS = [
  "rojo",
  "rojo flúor",
  "naranja",
  "naranja KTM",
  "amarillo",
  "amarillo neón",
  "azul",
  "azul Francia",
  "verde",
  "verde lima",
  "blanco",
  "blanco perlado",
  "negro",
  "gris",
  "gris mate",
  "rosa",
  "violeta",
  "celeste",
] as const;

export const SUGGESTED_RIDER_COLORS = [
  "rojo",
  "naranja",
  "amarillo",
  "azul",
  "verde",
  "blanco",
  "negro",
  "gris",
  "rosa",
  "violeta",
  "celeste",
  "flúor",
] as const;

/** Filtros de galería pública (valores fijos). */
export const COLOR_FILTER_OPTIONS = [
  "todos",
  "rojo",
  "naranja",
  "amarillo",
  "azul",
  "verde",
  "blanco",
  "negro",
  "rosa",
  "gris",
] as const;

export type BikeColor = (typeof COLOR_FILTER_OPTIONS)[number];
