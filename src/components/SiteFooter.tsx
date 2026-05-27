import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { PLATFORM } from "@/lib/platform";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/[0.08]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <BrandLogo href="/" size="hero" />
            <p className="mt-4 text-sm text-[var(--muted)]">{PLATFORM.description}</p>
          </div>
          <div className="flex flex-wrap gap-10 text-sm text-[var(--muted)]">
            <div>
              <p className="mb-2 font-medium text-white">Compradores</p>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/#eventos" className="hover:text-white">
                    Eventos
                  </Link>
                </li>
                <li>
                  <Link href="/mis-compras" className="hover:text-white">
                    Mis compras
                  </Link>
                </li>
                <li>
                  <Link href="/#buscar" className="hover:text-white">
                    Buscar fotos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-medium text-white">Fotógrafos</p>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/para-fotografos" className="hover:text-white">
                    Cómo funciona
                  </Link>
                </li>
                <li>
                  <Link href="/fotografos/registro" className="hover:text-white">
                    Crear cuenta
                  </Link>
                </li>
                <li>
                  <Link href="/fotografos/login" className="hover:text-white">
                    Ingresar
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} {PLATFORM.name}
        </p>
      </div>
    </footer>
  );
}
