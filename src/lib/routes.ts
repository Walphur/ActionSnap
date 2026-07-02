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

export function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export function isAuthPath(pathname: string): boolean {
  return (
    pathname.startsWith("/fotografos/login") ||
    pathname.startsWith("/fotografos/registro") ||
    pathname === "/admin/login"
  );
}

export function isPublicChromeHiddenPath(pathname: string): boolean {
  return isPhotographerPanelPath(pathname) || isAdminPath(pathname) || isAuthPath(pathname);
}
