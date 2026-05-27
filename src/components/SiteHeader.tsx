"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeaderLogo } from "@/components/HeaderLogo";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav-floating ${scrolled ? "nav-floating--scrolled" : ""}`}>
      <div className="nav-floating-inner">
        <HeaderLogo />
        <nav className="nav-floating-links">
          <Link href="/explorar" className="nav-link">
            Explorar
          </Link>
          <Link href="/#buscar" className="nav-link">
            Buscar
          </Link>
          <Link href="/para-fotografos" className="nav-link hidden sm:inline">
            Fotógrafos
          </Link>
          <Link href="/fotografos/login" className="nav-link hidden md:inline">
            Ingresar
          </Link>
          <Link href="/fotografos/login?next=/fotografos" className="btn-primary nav-cta">
            Subir evento
          </Link>
        </nav>
      </div>
    </header>
  );
}
