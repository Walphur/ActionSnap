import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <BrandLogo size="sm" />
        <nav className="flex items-center gap-2 text-sm md:gap-4">
          <Link
            href="/#carreras"
            className="hidden rounded-md px-3 py-2 text-[var(--muted)] transition hover:text-[var(--text)] sm:inline-block"
          >
            Carreras
          </Link>
          <Link
            href="/#como-funciona"
            className="hidden rounded-md px-3 py-2 text-[var(--muted)] transition hover:text-[var(--text)] sm:inline-block"
          >
            Cómo funciona
          </Link>
          <Link href="/admin" className="btn-secondary !py-2 !text-xs md:!text-sm">
            Fotógrafo
          </Link>
        </nav>
      </div>
    </header>
  );
}
