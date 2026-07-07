"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Rocket, UserRound } from "lucide-react";
import { HeaderLogo } from "@/components/HeaderLogo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/ui/cn";
import { isPublicChromeHiddenPath } from "@/lib/routes";

const LINKS = [
  {
    href: "/explorar",
    label: "Eventos",
    match: (p: string) => p === "/explorar" || p.startsWith("/eventos"),
  },
  {
    href: "/mis-compras",
    label: "Mis compras",
    match: (p: string) => p.startsWith("/mis-compras"),
  },
  {
    href: "/para-fotografos",
    label: "Para fotógrafos",
    match: (p: string) => p === "/para-fotografos" || p === "/precios",
  },
  {
    href: "/faq",
    label: "FAQ",
    match: (p: string) => p === "/faq",
  },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const hideChrome = isPublicChromeHiddenPath(pathname);

  useEffect(() => {
    if (hideChrome) return;
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideChrome]);

  if (hideChrome) {
    return null;
  }

  return (
    <header className={cn("ds-header", scrolled && "ds-header--scrolled")}>
      <div className="ds-header__inner">
        <div className="ds-header__logo">
          <HeaderLogo />
        </div>

        <nav className="ds-header__nav" aria-label="Principal">
          {LINKS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("ds-header__link", active && "ds-header__link--active")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ds-header__actions">
          <ButtonLink
            href="/fotografos/login"
            variant="ghost"
            size="sm"
            className="ds-header__login"
          >
            <UserRound className="h-4 w-4 md:hidden" aria-hidden />
            Ingresar
          </ButtonLink>
          <ButtonLink href="/fotografos/registro" variant="primary" size="sm">
            <Rocket className="h-4 w-4 md:hidden" aria-hidden />
            Empezar gratis
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
