import { Compass, Link2, UserPlus } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function LandingCta() {
  return (
    <section className="landing-cta landing-reveal" aria-labelledby="cta-heading">
      <div className="landing-cta__inner">
        <BrandLogo href="/" size="lg" />
        <h2 id="cta-heading" className="ds-h2 landing-cta__title">
          Dejá de perder tiempo mandando links por WhatsApp.
        </h2>
        <p className="ds-body-lg landing-cta__lead text-[var(--color-text-secondary)]">
          Un link por evento, cobros automáticos y entregas en HD. Tu cobertura profesional,
          lista para escalar.
        </p>

        <div className="landing-cta__actions">
          <ButtonLink href="/fotografos/registro" variant="primary" size="lg">
            <UserPlus className="h-4 w-4" aria-hidden />
            Registrar fotógrafo
          </ButtonLink>
          <ButtonLink href="/explorar" variant="secondary" size="lg">
            <Compass className="h-4 w-4" aria-hidden />
            Ver eventos
          </ButtonLink>
          <ButtonLink href="/fotografos/registro" variant="outline" size="lg">
            <Link2 className="h-4 w-4" aria-hidden />
            Conectar Mercado Pago
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
