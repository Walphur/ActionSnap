import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 md:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-black text-black">
            MF
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Moto<span className="text-[var(--accent)]">Fotos</span>
          </span>
        </Link>
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
