import { MarketingPage } from "@/components/MarketingPage";
import { Card, CardBody } from "@/components/ui/Card";
import { getContactEmail } from "@/lib/contact";
import { PLATFORM } from "@/lib/platform";

export const metadata = {
  title: `Contacto — ${PLATFORM.name}`,
};

export default function ContactoPage() {
  const supportEmail = getContactEmail();

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
            <a href={`mailto:${supportEmail}`} className="text-[var(--color-primary)]">
              {supportEmail}
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
