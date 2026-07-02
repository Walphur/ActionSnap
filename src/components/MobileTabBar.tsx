"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Compass, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { isPhotographerPanelPath, isAdminPath } from "@/lib/routes";

const TABS = [
  {
    href: "/explorar",
    label: "Explorar",
    icon: Compass,
    match: (path: string) => path === "/explorar" || path.startsWith("/eventos"),
  },
  {
    href: "/mis-compras",
    label: "Mis compras",
    icon: ShoppingBag,
    match: (path: string) => path.startsWith("/mis-compras"),
  },
  {
    href: "/fotografos",
    label: "Fotógrafo",
    icon: Camera,
    match: (path: string) =>
      path.startsWith("/fotografos") ||
      path === "/para-fotografos" ||
      path === "/precios",
  },
] as const;

const HIDDEN_PREFIXES = ["/admin", "/auth", "/compra", "/fotografos/login", "/fotografos/registro"];

export function MobileTabBar() {
  const pathname = usePathname();

  if (
    HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    isPhotographerPanelPath(pathname) ||
    isAdminPath(pathname)
  ) {
    return null;
  }

  return (
    <nav className="ds-tab-bar md:hidden" aria-label="Navegación principal móvil">
      <ul className="ds-tab-bar__list">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn("ds-tab-bar__link", active && "ds-tab-bar__link--active")}
              >
                <Icon className="h-5 w-5" aria-hidden strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
