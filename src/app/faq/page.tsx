import { MarketingPage } from "@/components/MarketingPage";
import { Card, CardBody } from "@/components/ui/Card";
import { PLATFORM } from "@/lib/platform";

const faqs = [
  {
    q: "¿Cómo encuentro mis fotos?",
    a: "Elegí un evento desde Explorar y buscá por tu número o color usando los filtros de la galería.",
  },
  {
    q: "¿Cómo recibo las fotos después de pagar?",
    a: "Mercado Pago confirma el pago y recibís el link de descarga en HD por email al instante.",
  },
  {
    q: "¿Cómo vendo como fotógrafo?",
    a: "Registrate, conectá tu cuenta de Mercado Pago con un clic, creá un evento y subí tu galería desde el panel.",
  },
  {
    q: "¿Qué comisión cobra la plataforma?",
    a: `${PLATFORM.commissionPercent}% por venta. El resto es tuyo.`,
  },
];

export const metadata = {
  title: `FAQ — ${PLATFORM.name}`,
};

export default function FaqPage() {
  return (
    <MarketingPage kicker="FAQ" title="Preguntas frecuentes" lead="Respuestas rápidas antes de comprar o vender.">
      <ul className="ds-marketing__faq">
        {faqs.map((f) => (
          <li key={f.q}>
            <Card>
              <CardBody>
                <h2 className="ds-h4">{f.q}</h2>
                <p className="ds-caption mt-2">{f.a}</p>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </MarketingPage>
  );
}
