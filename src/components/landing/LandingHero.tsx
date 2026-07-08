import { ShieldCheck, Tags, Zap } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PLATFORM } from "@/lib/platform";
import { DashboardMockup } from "@/components/landing/DashboardMockup";

type Props = {
  exploreHref?: string;
};

export function LandingHero({ exploreHref = "#eventos" }: Props) {
  return (
    <section className="landing-hero">
      <div className="landing-hero__bg" aria-hidden>
        <img src={PLATFORM.heroImageSrc} alt="" />
        <div className="landing-hero__overlay" />
      </div>

      <div className="landing-hero__inner">
        <div className="landing-hero__copy landing-reveal landing-reveal--1">
          <p className="landing__kicker ds-overline">
            <Zap className="h-4 w-4" aria-hidden />
            Plataforma para fotógrafos de eventos
          </p>
          <h1 className="ds-h1">
            Tus fotos de eventos, vendidas en piloto automático.
          </h1>
          <p className="landing-hero__lead">
            Subí tu cobertura, etiquetá cada foto en minutos con atajos de teclado y cobrá directo en
            Mercado Pago. Cero administración, 100% ventas.
          </p>

          <div className="landing-hero__trust">
            <span className="landing-hero__trust-item">
              <ShieldCheck className="h-4 w-4 text-[var(--color-success)]" aria-hidden />
              Entrega HD segura
            </span>
            <span className="landing-hero__trust-item">
              <Tags className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
              Etiquetado manual rápido
            </span>
          </div>

          <div className="landing-hero__actions">
            <ButtonLink href="/fotografos/registro" variant="primary" size="lg">
              Empezar gratis
            </ButtonLink>
            <ButtonLink href={exploreHref} variant="ghost" size="lg">
              Explorar eventos
            </ButtonLink>
          </div>
        </div>

        <div className="landing-hero__mockup landing-reveal landing-reveal--2">
          <div className="landing-hero__mockup-wrap">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
