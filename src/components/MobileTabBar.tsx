"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Compass, HelpCircle, LogIn, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { isPhotographerPanelPath, isAdminPath, isAuthPath } from "@/lib/routes";

const TABS = [
  {
    href: "/explorar",
    label: "Eventos",
    icon: Compass,
    match: (path: string) => path === "/explorar" || path.startsWith("/eventos"),
  },
  {
    href: "/mis-compras",
    label: "Compras",
    icon: ShoppingBag,
    match: (path: string) => path.startsWith("/mis-compras"),
  },
  {
    href: "/para-fotografos",
    label: "Fotógrafos",
    icon: Camera,
    match: (path: string) => path === "/para-fotografos" || path === "/precios",
  },
  {
    href: "/faq",
    label: "FAQ",
    icon: HelpCircle,
    match: (path: string) => path === "/faq",
  },
  {
    href: "/fotografos/login",
    label: "Ingresar",
    icon: LogIn,
    match: (path: string) => path === "/fotografos/login",
  },
] as const;

const HIDDEN_PREFIXES = ["/admin", "/auth", "/compra", "/fotografos/login", "/fotografos/registro"];

export function MobileTabBar() {
  const pathname = usePathname();

  if (
    HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    isPhotographerPanelPath(pathname) ||
    isAdminPath(pathname) ||
    isAuthPath(pathname)
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
