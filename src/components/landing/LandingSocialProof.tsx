import { ShieldCheck, Users } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Pagos seguros con Mercado Pago",
    description: "Cada venta se acredita directo en tu cuenta. Sin intermediarios manuales.",
  },
  {
    icon: Users,
    title: "Hecho para fotógrafos de eventos",
    description: "Subí, etiquetá manualmente y vendé en minutos — sin depender de IA.",
  },
] as const;

export function LandingSocialProof() {
  return (
    <section className="landing-trust" aria-labelledby="trust-heading">
      <div className="landing__container">
        <div className="landing__section-head landing-reveal">
          <p className="landing__kicker ds-overline">Confianza</p>
          <h2 id="trust-heading" className="ds-h2">
            Diseñado para vender coberturas de eventos
          </h2>
          <p className="ds-body-lg mt-4 text-[var(--color-text-secondary)]">
            Action Snap está en beta cerrada con fotógrafos reales. Cada mejora sale del uso en
            cancha, no de suposiciones.
          </p>
        </div>

        <div className="landing-trust__stats">
          {TRUST_POINTS.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="landing-trust__quote landing-reveal">
              <CardBody>
                <Icon className="h-8 w-8 text-[var(--color-primary)]" aria-hidden />
                <h3 className="ds-h4 mt-4">{title}</h3>
                <p className="ds-body mt-2 text-[var(--color-text-secondary)]">{description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
