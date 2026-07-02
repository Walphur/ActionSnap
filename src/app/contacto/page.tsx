import { MarketingPage } from "@/components/MarketingPage";
import { Card, CardBody } from "@/components/ui/Card";
import { PLATFORM } from "@/lib/platform";

export const metadata = {
  title: `Contacto — ${PLATFORM.name}`,
};

export default function ContactoPage() {
  return (
    <MarketingPage
      kicker="Contacto"
      title="Contacto y soporte"
      lead="Estamos para ayudarte con compras, ventas o tu cuenta de fotógrafo."
    >
      <Card>
        <CardBody className="space-y-4">
          <p className="ds-body">
            <strong className="text-[var(--color-text-primary)]">Email:</strong>{" "}
            <a href="mailto:hola@actionsnap.store" className="text-[var(--color-primary)]">
              hola@actionsnap.store
            </a>
          </p>
          <p className="ds-caption">
            Tiempo de respuesta habitual: 24–48 h hábiles. Para urgencias de descarga, incluí el
            email de compra y el evento.
          </p>
        </CardBody>
      </Card>
    </MarketingPage>
  );
}
