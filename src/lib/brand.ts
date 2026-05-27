export const BRAND = {
  name: "Victor Films",
  tagline: "Fotografía y video de motocross",
  bannerSrc: "/banner-victor-films.png",
  watermark: "VICTOR FILMS",
  logo: {
    /** Navbar, hero CTA zone — sin slogan */
    horizontal: "/logo/victor-films-horizontal.png",
    /** Footer — con slogan */
    full: "/logo/victor-films-full.png",
    /** Cards, loaders, thumbnails */
    square: "/logo/victor-films-square.png",
    /** Favicon, loading, marca de agua en fotos */
    icon: "/logo/vf-icon.png",
    watermark: "/logo/victor-films-watermark.png",
    /** SVG cuando estén vectorizados (opcional) */
    horizontalSvg: "/logo/victor-films-horizontal.svg",
    iconSvg: "/logo/vf-icon.svg",
  },
  favicon: {
    ico: "/favicons/favicon.ico",
    png32: "/favicons/favicon-32x32.png",
    png16: "/favicons/favicon-16x16.png",
    apple: "/favicons/apple-touch-icon.png",
  },
} as const;

/** @deprecated Usar BRAND.logo.horizontal */
export const LEGACY_LOGO = "/logo-victor-films-transparent.png";
