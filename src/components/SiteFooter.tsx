import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { BRAND } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <BrandLogo href="/" size="md" />
            <p className="mt-4 max-w-xs text-sm text-white/65">
              {BRAND.tagline}. Produccion visual premium para riders, equipos y sponsors.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Corredores
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/#carreras" className="hover:text-white">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/mis-compras" className="hover:text-white">
                  Mis compras
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-white">
                  Servicios
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Confianza
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Checkout seguro Mercado Pago</li>
              <li>Descarga inmediata HD + ZIP</li>
              <li>Verificacion anti-bot y panel privado</li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs uppercase tracking-[0.16em] text-white/45">
          © {new Date().getFullYear()} {BRAND.name}
        </p>
      </div>
    </footer>
  );
}
