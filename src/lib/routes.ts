export function isPhotographerPanelPath(pathname: string): boolean {
  if (!pathname.startsWith("/fotografos")) return false;
  if (pathname.startsWith("/fotografos/login") || pathname.startsWith("/fotografos/registro")) {
    return false;
  }
  return true;
}

/** Rutas del comprador con layout full-bleed (hero, checkout success). */
export function isBuyerFullBleedPath(pathname: string): boolean {
  return pathname.startsWith("/eventos") || pathname.startsWith("/compra");
}
