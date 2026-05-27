import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { PLATFORM } from "@/lib/platform";

const links = {
  producto: [
    { href: "/explorar", label: "Explorar eventos" },
    { href: "/#buscar", label: "Buscar fotos" },
    { href: "/mis-compras", label: "Mis compras" },
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
    { href: "/terminos", label: "Términos" },
    { href: "/privacidad", label: "Privacidad" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <BrandLogo href="/" size="lg" />
          <p className="mt-4 max-w-xs text-sm text-[var(--muted)]">{PLATFORM.description}</p>
          <div className="mt-4 flex gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social"
              aria-label="Instagram"
            >
              IG
            </a>
            <a
              href="mailto:hola@actionsnap.store"
              className="footer-social"
              aria-label="Email"
            >
              ✉
            </a>
          </div>
        </div>

        {Object.entries(links).map(([group, items]) => (
          <div key={group} className="site-footer-col">
            <p className="site-footer-heading">
              {group === "producto"
                ? "Producto"
                : group === "fotografos"
                  ? "Fotógrafos"
                  : group === "empresa"
                    ? "Empresa"
                    : "Legal"}
            </p>
            <ul className="site-footer-list">
              {items.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="site-footer-bottom">
        <p>
          © {new Date().getFullYear()} {PLATFORM.name} · {PLATFORM.taglineEs}
        </p>
        <p className="text-[var(--muted)]">Soporte: hola@actionsnap.store</p>
      </div>
    </footer>
  );
}
