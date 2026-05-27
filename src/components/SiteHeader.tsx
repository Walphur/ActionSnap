import Link from "next/link";
import { HeaderLogo } from "@/components/HeaderLogo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
        <HeaderLogo />
        <nav className="flex items-center gap-1 text-sm text-white/80 md:gap-3">
          <Link href="/#eventos" className="rounded-lg px-2.5 py-2 transition hover:text-white md:px-3">
            Eventos
          </Link>
          <Link
            href="/#buscar"
            className="rounded-lg px-2.5 py-2 transition hover:text-white md:px-3"
          >
            Buscar
          </Link>
          <Link
            href="/fotografos/login"
            className="hidden rounded-lg px-2.5 py-2 transition hover:text-white sm:inline-block md:px-3"
          >
            Ingresar
          </Link>
          <Link
            href="/fotografos/login?next=/fotografos"
            className="btn-primary ml-1 whitespace-nowrap px-4 py-2 text-xs md:text-sm"
          >
            Subir evento
          </Link>
        </nav>
      </div>
    </header>
  );
}
