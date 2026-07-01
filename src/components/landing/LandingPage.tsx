import Link from "next/link";
import {
  Banknote,
  Brain,
  Share2,
  ShieldCheck,
  Sparkles,
  Upload,
  Wallet,
  Zap,
} from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { BrandLogo } from "@/components/BrandLogo";
import type { EventWithCover } from "@/lib/event-cover";
import { PLATFORM } from "@/lib/platform";

type Props = {
  events: EventWithCover[];
  configError?: boolean;
};

const benefits = [
  {
    icon: Sparkles,
    title: "Etiquetado con IA",
    description:
      "Olvidate de ordenar carpetas. Nuestra IA lee los números de las motos y los cascos para que los pilotos se encuentren en segundos.",
  },
  {
    icon: Wallet,
    title: "Cobros directos",
    description:
      "Vinculá tu cuenta de Mercado Pago y recibí tu dinero al instante con cada descarga. Sin demoras ni transferencias manuales.",
  },
  {
    icon: ShieldCheck,
    title: "Entrega inmediata y segura",
    description:
      "El piloto paga y descarga el original en HD automáticamente. Todo protegido bajo enlaces seguros.",
  },
] as const;

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Subís la galería en bloque",
    description: "Arrastrá cientos de fotos. Nosotros generamos las previews con marca de agua.",
  },
  {
    icon: Brain,
    step: "02",
    title: "La IA hace el trabajo pesado",
    description: "Detectamos dorsales y organizamos la galería para que cualquiera encuentre su foto.",
  },
  {
    icon: Share2,
    step: "03",
    title: "Compartís el link en tus redes",
    description: "Un solo link por evento. WhatsApp, Instagram o Telegram: listo para viralizar.",
  },
  {
    icon: Banknote,
    step: "04",
    title: "Cobrás mientras descansás",
    description: "Cada venta va directo a tu Mercado Pago. Vos seguís cubriendo la próxima carrera.",
  },
] as const;

export function LandingPage({ events, configError = false }: Props) {
  const featuredEvents = events.slice(0, 4);

  return (
    <div className="landing-page">
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-bg" aria-hidden>
          <img src={PLATFORM.heroImageSrc} alt="" className="landing-hero-bg-img" />
          <div className="landing-hero-bg-overlay" />
        </div>

        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <p className="landing-kicker">
              <Zap className="inline h-4 w-4" aria-hidden />
              Plataforma para fotógrafos deportivos
            </p>
            <h1 className="font-display landing-hero-title">
              Tus fotos deportivas, vendidas en piloto automático.
            </h1>
            <p className="landing-hero-subtitle">
              Subí tu cobertura, nuestra IA etiqueta los dorsales y la plata va directo a tu
              Mercado Pago. Cero administración, 100% ventas.
            </p>
            <div className="landing-hero-actions">
              <Link href="/fotografos/registro" className="btn-hero btn-hero--primary">
                Empezar gratis
              </Link>
              <Link href="#eventos" className="btn-hero btn-hero--ghost">
                Explorar eventos
              </Link>
            </div>
          </div>

          <div className="landing-hero-mockup" aria-hidden>
            <div className="landing-mockup-window">
              <div className="landing-mockup-bar">
                <span />
                <span />
                <span />
              </div>
              <div className="landing-mockup-body">
                <div className="landing-mockup-sidebar">
                  <div className="landing-mockup-logo">AS</div>
                  <div className="landing-mockup-nav-item landing-mockup-nav-item--active" />
                  <div className="landing-mockup-nav-item" />
                  <div className="landing-mockup-nav-item" />
                </div>
                <div className="landing-mockup-main">
                  <div className="landing-mockup-header">
                    <div>
                      <p className="landing-mockup-label">Evento activo</p>
                      <p className="landing-mockup-event">GP Motocross — San Luis</p>
                    </div>
                    <span className="landing-mockup-badge">MP conectado</span>
                  </div>
                  <div className="landing-mockup-stats">
                    <div className="landing-mockup-stat">
                      <span className="landing-mockup-stat-value">1.248</span>
                      <span className="landing-mockup-stat-label">Fotos subidas</span>
                    </div>
                    <div className="landing-mockup-stat">
                      <span className="landing-mockup-stat-value">892</span>
                      <span className="landing-mockup-stat-label">Dorsales IA</span>
                    </div>
                    <div className="landing-mockup-stat">
                      <span className="landing-mockup-stat-value">47</span>
                      <span className="landing-mockup-stat-label">Ventas hoy</span>
                    </div>
                  </div>
                  <div className="landing-mockup-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="landing-mockup-thumb" />
                    ))}
                  </div>
                  <div className="landing-mockup-footer">
                    <span className="landing-mockup-pill">IA etiquetando…</span>
                    <span className="landing-mockup-pill landing-mockup-pill--accent">
                      +$12.400 hoy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-body">
        {configError && (
          <p className="landing-alert">
            Conectá Supabase en <code>.env.local</code> para mostrar eventos reales.
          </p>
        )}

        {/* Benefits */}
        <section className="landing-section">
          <div className="landing-section-head">
            <p className="landing-kicker">Por qué elegirnos</p>
            <h2 className="font-display landing-section-title">
              Menos laburo manual. Más tiempo disparando.
            </h2>
          </div>
          <div className="landing-benefits">
            {benefits.map(({ icon: Icon, title, description }) => (
              <article key={title} className="landing-benefit-card">
                <div className="landing-benefit-icon">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="landing-section landing-section--steps">
          <div className="landing-section-head">
            <p className="landing-kicker">Cómo funciona</p>
            <h2 className="font-display landing-section-title">Cuatro pasos. Cero fricción.</h2>
          </div>
          <ol className="landing-steps">
            {steps.map(({ icon: Icon, step, title, description }) => (
              <li key={step} className="landing-step">
                <div className="landing-step-marker">
                  <Icon className="h-5 w-5" aria-hidden />
                  <span className="landing-step-num">{step}</span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Featured events */}
        <section id="eventos" className="landing-section">
          <div className="landing-section-head landing-section-head--row">
            <div>
              <p className="landing-kicker">Prueba social</p>
              <h2 className="font-display landing-section-title">
                Eventos recientes cubiertos con {PLATFORM.name}
              </h2>
            </div>
            <Link href="/explorar" className="btn-ghost hidden text-sm sm:inline-flex">
              Ver todos →
            </Link>
          </div>

          {featuredEvents.length > 0 ? (
            <div className="landing-events-grid">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="landing-events-empty card px-8 py-12 text-center">
              <p className="font-display text-xl font-bold">Próximamente nuevas coberturas</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
                Los fotógrafos ya están subiendo eventos. Volvé pronto o creá el tuyo primero.
              </p>
              <Link href="/fotografos/registro" className="btn-primary mt-6 inline-flex">
                Publicar mi evento
              </Link>
            </div>
          )}

          <Link href="/explorar" className="btn-secondary mx-auto mt-8 inline-flex sm:hidden">
            Ver todos los eventos
          </Link>
        </section>

        {/* Final CTA + footer nav */}
        <section className="landing-cta">
          <div className="landing-cta-inner">
            <div className="mb-6 flex justify-center">
              <BrandLogo href="/" size="lg" />
            </div>
            <h2 className="font-display landing-cta-title">
              Dejá de perder tiempo mandando links por WhatsApp.
            </h2>
            <p className="landing-cta-lead">
              Un link por evento, cobros automáticos y entregas en HD. Tu cobertura profesional,
              lista para escalar.
            </p>
            <Link href="/fotografos/registro" className="btn-hero btn-hero--primary">
              Crear cuenta de fotógrafo
            </Link>
            <nav className="landing-cta-nav" aria-label="Enlaces del pie de landing">
              <Link href="/fotografos/login">Ingresar</Link>
              <Link href="/fotografos/registro">Registrarse</Link>
              <Link href="/contacto">Contacto</Link>
              <Link href="/legales/terminos">Términos y Condiciones</Link>
            </nav>
          </div>
        </section>
      </div>
    </div>
  );
}
