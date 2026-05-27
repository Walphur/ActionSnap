import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { BRAND } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-20 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <BrandLogo href="/" size="md" />
            <p className="mt-4 max-w-xs text-sm text-[var(--muted)]">
              {BRAND.tagline}. Buscá tus fotos por dorsal, pagá online y descargá en alta
              resolución.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Corredores
            </p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>
                <Link href="/#carreras" className="hover:text-[var(--text)]">
                  Ver carreras
                </Link>
              </li>
              <li>
                <Link href="/mis-compras" className="hover:text-[var(--text)]">
                  Mis compras
                </Link>
              </li>
              <li>
                <Link href="/#como-funciona" className="hover:text-[var(--text)]">
                  Cómo comprar
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Confianza
            </p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>Pago seguro con Mercado Pago</li>
              <li>Descarga inmediata en HD</li>
              <li>Vista previa con marca de agua</li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-[var(--border-subtle)] pt-6 text-center text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} {BRAND.name}
        </p>
      </div>
    </footer>
  );
}
