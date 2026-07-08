import type { LucideIcon } from "lucide-react";
import { Banknote, Share2, Tags, Upload } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";

type Step = {
  icon: LucideIcon;
  step: string;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    icon: Upload,
    step: "01",
    title: "Subís la galería en bloque",
    description: "Arrastrá cientos de fotos. Nosotros generamos las previews con marca de agua.",
  },
  {
    icon: Tags,
    step: "02",
    title: "Etiquetás cada foto a mano",
    description:
      "Con atajos y aplicación en lote etiquetás cientos de fotos rápido, sin depender de herramientas externas.",
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
    description: "Cada venta va directo a tu Mercado Pago. Vos seguís cubriendo el próximo evento.",
  },
];

export function LandingSteps() {
  return (
    <section className="landing__section" aria-labelledby="steps-heading">
      <div className="landing__container">
        <div className="landing__section-head landing-reveal">
          <p className="landing__kicker ds-overline">Cómo funciona</p>
          <h2 id="steps-heading" className="ds-h2">
            Cuatro pasos. Cero fricción.
          </h2>
        </div>

        <ol className="landing-steps">
          {STEPS.map(({ icon: Icon, step, title, description }) => (
            <li key={step}>
              <Card className="landing-step ds-hover-lift landing-reveal">
                <CardBody>
                  <div className="landing-step__marker">
                    <Icon className="h-5 w-5" aria-hidden />
                    <span className="landing-step__num">{step}</span>
                  </div>
                  <h3 className="ds-h4">{title}</h3>
                  <p className="ds-caption mt-2">{description}</p>
                </CardBody>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
