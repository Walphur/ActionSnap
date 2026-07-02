export function isPhotographerPanelPath(pathname: string): boolean {
  if (!pathname.startsWith("/fotografos")) return false;
  if (pathname.startsWith("/fotografos/login") || pathname.startsWith("/fotografos/registro")) {
    return false;
  }
  return true;
}
