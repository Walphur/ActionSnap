import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PLATFORM } from "@/lib/platform";
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
  title: `${PLATFORM.name} — ${PLATFORM.tagline}`,
  description: PLATFORM.description,
  icons: {
    icon: "/banner-upload-motocross.png",
    apple: "/banner-upload-motocross.png",
  },
  openGraph: {
    title: `${PLATFORM.name} — Fotos deportivas`,
    description: PLATFORM.description,
    url: appUrl,
    siteName: PLATFORM.name,
    images: [{ url: `${appUrl}/banner-upload-motocross.png`, width: 1200, height: 630 }],
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
