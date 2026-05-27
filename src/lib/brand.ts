export const BRAND = {
  name: "Victor Films",
  tagline: "Fotografía y video de motocross",
  bannerSrc: "/banner-victor-films.png",
  watermark: "VICTOR FILMS",
  logo: {
    /** Navbar desktop + hero — VICTOR FILMS (sin slogan) */
    horizontal: "/logo/victor-films-horizontal.png",
    /** Footer — cuadrado con slogan */
    full: "/logo/victor-films-full.png",
    /** Loaders, login admin */
    square: "/logo/victor-films-square.png",
    /** Navbar mobile, hero blur, isotipo */
    icon: "/logo/vf-icon.png",
    /** Marca de agua en fotos */
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
