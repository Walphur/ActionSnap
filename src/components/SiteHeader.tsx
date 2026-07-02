"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { HeaderLogo } from "@/components/HeaderLogo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/ui/cn";

const LINKS = [
  {
    href: "/explorar",
    label: "Explorar",
    match: (p: string) => p === "/explorar" || p.startsWith("/eventos"),
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
            Ingresar
          </ButtonLink>
          <ButtonLink href="/fotografos/registro" variant="primary" size="sm">
            Empezar gratis
          </ButtonLink>
          <button
            type="button"
            className="ds-header__menu-btn"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="ds-header__mobile-panel ds-animate-slide-down md:hidden">
          <nav className="ds-header__mobile-links" aria-label="Principal móvil">
            {LINKS.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "ds-header__mobile-link",
                    active && "ds-header__mobile-link--active"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ds-header__mobile-cta">
            <ButtonLink href="/fotografos/login" variant="secondary" className="w-full">
              Ingresar
            </ButtonLink>
            <ButtonLink href="/fotografos/registro" variant="primary" className="w-full">
              Empezar gratis
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
