import Link from "next/link";
import { HeaderLogo } from "@/components/HeaderLogo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 md:px-6 md:py-3">
        <HeaderLogo />
        <nav className="flex items-center gap-1.5 text-xs uppercase tracking-widest md:gap-2 md:text-sm">
          <Link
            href="/#eventos"
            className="rounded-md px-2.5 py-2 text-white/75 transition hover:text-white md:px-3"
          >
            Eventos
          </Link>
          <Link
            href="/#buscar-fotos"
            className="rounded-md px-2.5 py-2 text-white/75 transition hover:text-white md:px-3"
          >
            Buscar
          </Link>
          <Link
            href="/fotografos/login"
            className="hidden rounded-md border border-white/20 px-2.5 py-2 text-white/85 transition hover:border-white/50 hover:text-white sm:inline-block md:px-3"
          >
            Ingresar
          </Link>
          <Link
            href="/fotografos/login?next=/fotografos"
            className="btn-racing whitespace-nowrap px-3 py-2 text-[10px] md:text-xs"
          >
            Subir evento
          </Link>
        </nav>
      </div>
    </header>
  );
}
