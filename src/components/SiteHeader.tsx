import Link from "next/link";
import { HeaderLogo } from "@/components/HeaderLogo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 md:px-6 md:py-4">
        <HeaderLogo />
        <nav className="flex items-center gap-2 text-sm uppercase tracking-widest md:gap-4">
          <Link
            href="/#carreras"
            className="hidden rounded-md px-3 py-2 text-white/70 transition hover:text-white sm:inline-block"
          >
            Galería
          </Link>
          <Link
            href="/#services"
            className="hidden rounded-md px-3 py-2 text-white/70 transition hover:text-white sm:inline-block"
          >
            Servicios
          </Link>
          <Link
            href="/mis-compras"
            className="rounded-md border border-white/20 px-3 py-2 text-[10px] text-white/85 transition hover:border-white/50 hover:text-white md:text-xs"
          >
            Mis compras
          </Link>
        </nav>
      </div>
    </header>
  );
}
