import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Victor Films — Tus fotos de carrera",
  description:
    "Victor Films: encontrá tus fotos de motocross por dorsal. Pagá online y descargá en alta resolución.",
  icons: { icon: "/logo-victor-films-transparent.png", apple: "/logo-victor-films-transparent.png" },
  openGraph: {
    title: "Victor Films — Fotos de motocross",
    description: BRAND.tagline,
    url: appUrl,
    siteName: BRAND.name,
    images: [{ url: `${appUrl}/banner-victor-films.png`, width: 1200, height: 630 }],
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${syne.variable}`}>
      <body className="relative min-h-screen antialiased">
        <SiteHeader />
        <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
