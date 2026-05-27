import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { PLATFORM } from "@/lib/platform";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <BrandLogo href="/" size="md" />
            <p className="mt-4 max-w-xs text-sm text-white/65">
              {PLATFORM.description}
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Compradores
            </p>
            <ul className="space-y-2 text-sm text-white/70">
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
                <Link href="/#buscar-fotos" className="hover:text-white">
                  Buscar fotos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Confianza
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Pago seguro con Mercado Pago</li>
              <li>Descarga inmediata en HD + ZIP</li>
              <li>Verificación anti-bot y panel privado</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Fotógrafos
            </p>
            <ul className="space-y-2 text-sm text-white/70">
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
                  Ingresar panel
                </Link>
              </li>
              <li className="text-white/55">
                Comisión plataforma {PLATFORM.commissionPercent}%
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs uppercase tracking-[0.16em] text-white/45">
          © {new Date().getFullYear()} {PLATFORM.name}
        </p>
      </div>
    </footer>
  );
}
