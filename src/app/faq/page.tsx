import { MarketingPage } from "@/components/MarketingPage";
import { PLATFORM } from "@/lib/platform";

const faqs = [
  {
    q: "¿Cómo encuentro mis fotos?",
    a: "Elegí el evento e ingresá tu número de dorsal en el buscador de la home o en la página del evento.",
  },
  {
    q: "¿Cómo recibo las fotos después de pagar?",
    a: "Mercado Pago confirma el pago y recibís el link de descarga en HD por email al instante.",
  },
  {
    q: "¿Cómo vendo como fotógrafo?",
    a: "Registrate, conectá Mercado Pago (receiver ID), creá un evento y subí tu galería desde el panel.",
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
      <ul className="space-y-4">
        {faqs.map((f) => (
          <li key={f.q} className="glass-panel p-5">
            <h2 className="font-semibold text-white">{f.q}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{f.a}</p>
          </li>
        ))}
      </ul>
    </MarketingPage>
  );
}
