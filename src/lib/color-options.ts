/** Solo constantes — seguro para componentes cliente */
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
