import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { MainShell } from "@/components/MainShell";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BRAND } from "@/lib/brand";
import { PLATFORM } from "@/lib/platform";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${PLATFORM.name} — ${PLATFORM.taglineEs}`,
  description: PLATFORM.description,
  icons: {
    icon: BRAND.isotipoSrc,
    apple: BRAND.isotipoSrc,
  },
  openGraph: {
    title: `${PLATFORM.name} — ${PLATFORM.heroHeadline}`,
    description: PLATFORM.description,
    url: appUrl,
    siteName: PLATFORM.name,
    images: [{ url: `${appUrl}${BRAND.logoSrc}`, width: 1200, height: 630 }],
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${bebas.variable}`}>
      <body className="relative min-h-screen antialiased">
        <SiteHeader />
        <MainShell>{children}</MainShell>
        <SiteFooter />
      </body>
    </html>
  );
}
