"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { isPublicChromeHiddenPath } from "@/lib/routes";
import { PLATFORM } from "@/lib/platform";

const LINKS = {
  producto: [
    { href: "/explorar", label: "Explorar eventos" },
    { href: "/mis-compras", label: "Mis compras" },
    { href: "/#eventos", label: "Eventos destacados" },
  ],
  fotografos: [
    { href: "/para-fotografos", label: "Para fotógrafos" },
    { href: "/precios", label: "Precios" },
    { href: "/fotografos/registro", label: "Crear cuenta" },
    { href: "/fotografos/login", label: "Ingresar" },
  ],
  empresa: [
    { href: "/nosotros", label: "Nosotros" },
    { href: "/faq", label: "FAQ" },
    { href: "/contacto", label: "Contacto" },
  ],
  legal: [
    { href: "/legales/terminos", label: "Términos" },
    { href: "/legales/privacidad", label: "Privacidad" },
  ],
} as const;

const GROUP_LABELS: Record<keyof typeof LINKS, string> = {
  producto: "Producto",
  fotografos: "Fotógrafos",
  empresa: "Empresa",
  legal: "Legal",
};

export function SiteFooter() {
  const pathname = usePathname();

  if (isPublicChromeHiddenPath(pathname)) {
    return null;
  }

  return (
    <footer className="ds-footer">
      <div className="ds-footer__inner">
        <div>
          <BrandLogo href="/" size="lg" />
          <p className="ds-footer__brand-desc">{PLATFORM.description}</p>
          <div className="ds-footer__social">
            <a
              href="mailto:hola@actionsnap.store"
              className="ds-footer__social-link"
              aria-label="Email de soporte"
            >
              <Mail className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>

        {(Object.keys(LINKS) as Array<keyof typeof LINKS>).map((group) => (
          <div key={group}>
            <p className="ds-footer__heading">{GROUP_LABELS[group]}</p>
            <ul className="ds-footer__list">
              {LINKS[group].map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="ds-footer__bottom">
        <p>
          © {new Date().getFullYear()} {PLATFORM.name} · {PLATFORM.taglineEs}
        </p>
        <p>Soporte: hola@actionsnap.store</p>
      </div>
    </footer>
  );
}
