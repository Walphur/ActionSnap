import Link from "next/link";
import { HeaderLogo } from "@/components/HeaderLogo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-3.5">
        <HeaderLogo />
        <nav className="flex items-center gap-2 text-sm uppercase tracking-widest md:gap-3">
          <Link
            href="/"
            className="hidden rounded-md px-3 py-2 text-white/70 transition hover:text-white sm:inline-block"
          >
            Inicio
          </Link>
          <Link
            href="/#eventos"
            className="hidden rounded-md px-3 py-2 text-white/70 transition hover:text-white sm:inline-block"
          >
            Eventos
          </Link>
          <Link
            href="/para-fotografos"
            className="hidden rounded-md px-3 py-2 text-white/70 transition hover:text-white md:inline-block"
          >
            Fotógrafos
          </Link>
          <Link
            href="/#buscar-fotos"
            className="hidden rounded-md px-3 py-2 text-white/70 transition hover:text-white lg:inline-block"
          >
            Buscar fotos
          </Link>
          <Link
            href="/fotografos/login"
            className="rounded-md border border-white/20 px-3 py-2 text-[10px] text-white/85 transition hover:border-white/50 hover:text-white md:text-xs"
          >
            Iniciar sesión
          </Link>
          <Link href="/fotografos/login?next=/fotografos" className="btn-racing text-[10px] md:text-xs">
            Subir evento
          </Link>
        </nav>
      </div>
    </header>
  );
}
