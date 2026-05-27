"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderLogo } from "@/components/HeaderLogo";

const LINKS = [
  {
    href: "/explorar",
    label: "Explorar",
    match: (p: string) => p === "/explorar" || p.startsWith("/eventos"),
  },
  { href: "/#buscar", label: "Buscar", match: (p: string) => p === "/" },
  {
    href: "/para-fotografos",
    label: "Para fotógrafos",
    match: (p: string) => p === "/para-fotografos",
  },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "nav-floating",
        scrolled ? "nav-floating--scrolled" : "",
        isHome && !scrolled ? "nav-floating--hero" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="nav-floating-inner">
        <div className="nav-floating-logo">
          <HeaderLogo />
        </div>

        <nav className="nav-floating-links" aria-label="Principal">
          {LINKS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? "nav-link--active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="nav-floating-actions">
          <Link
            href="/fotografos/registro"
            className="btn-primary nav-cta whitespace-nowrap"
          >
            Subir evento
          </Link>
        </div>
      </div>
    </header>
  );
}
