"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Compass, ShoppingBag } from "lucide-react";

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

const HIDDEN_PREFIXES = ["/admin", "/auth", "/fotografos/login", "/fotografos/registro"];

export function MobileTabBar() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <nav
      className="mobile-tab-bar fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[var(--bg)]/95 backdrop-blur-md md:hidden"
      aria-label="Navegación principal móvil"
    >
      <ul className="mobile-tab-bar-list">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`mobile-tab-bar-link ${active ? "mobile-tab-bar-link--active" : ""}`}
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
