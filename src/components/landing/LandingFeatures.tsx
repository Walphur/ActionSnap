import type { LucideIcon } from "lucide-react";
import { ShieldCheck, Tags, Wallet } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";

type Feature = {
  icon: LucideIcon;
  title: string;
  problem: string;
  solution: string;
  benefit: string;
};

const FEATURES: Feature[] = [
  {
    icon: Tags,
    title: "Etiquetado manual veloz",
    problem: "Ordenar cientos de fotos por dorsal consume horas después de cada carrera.",
    solution:
      "Panel con atajos de teclado, multiselección y aplicación en lote para etiquetar sin fricción.",
    benefit: "Publicás la galería el mismo día con un flujo simple y predecible.",
  },
  {
    icon: Wallet,
    title: "Cobros directos",
    problem: "Transferencias manuales, links rotos y cobros pendientes por WhatsApp.",
    solution: "Mercado Pago conectado: cada venta se acredita al instante en tu cuenta.",
    benefit: "Cobrás mientras descansás, sin perseguir pagos ni conciliar transferencias.",
  },
  {
    icon: ShieldCheck,
    title: "Entrega HD segura",
    problem: "Enviar originales por Drive o WhatsApp expone tu trabajo y complica la entrega.",
    solution: "El piloto paga y descarga el original en HD con un enlace seguro y único.",
    benefit: "Protegés tu material y entregás una experiencia profesional al instante.",
  },
];

export function LandingFeatures() {
  return (
    <section className="landing__section" aria-labelledby="features-heading">
      <div className="landing__container">
        <div className="landing__section-head landing-reveal">
          <p className="landing__kicker ds-overline">Funcionalidades</p>
          <h2 id="features-heading" className="ds-h2">
            Menos laburo manual. Más tiempo disparando.
          </h2>
        </div>

        <div className="landing-features__grid">
          {FEATURES.map(({ icon: Icon, title, problem, solution, benefit }) => (
            <Card key={title} className="landing-feature-card ds-hover-lift landing-reveal">
              <CardBody>
                <div className="landing-feature-card__icon">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="ds-h4">{title}</h3>
                <div className="landing-feature-card__meta">
                  <div className="landing-feature-card__row">
                    <span className="landing-feature-card__tag">Problema</span>
                    <p className="ds-caption">{problem}</p>
                  </div>
                  <div className="landing-feature-card__row">
                    <span className="landing-feature-card__tag">Solución</span>
                    <p className="ds-caption">{solution}</p>
                  </div>
                  <div className="landing-feature-card__row">
                    <span className="landing-feature-card__tag">Beneficio</span>
                    <p className="ds-body">{benefit}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
