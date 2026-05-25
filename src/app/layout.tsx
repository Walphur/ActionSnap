import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moto Fotos — Fotos de carrera",
  description:
    "Encontrá tus fotos de motocross por número de dorsal, pagá online y descargá en alta resolución.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <header className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              <span className="text-[var(--accent)]">Moto</span> Fotos
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="font-medium text-[var(--text)] hover:text-[var(--accent)]"
              >
                Inicio
              </Link>
              <Link
                href="/admin"
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--text)]"
              >
                Acceso fotógrafo
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
