import { Mail, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody } from "@/components/ui/Card";
import { getContactEmail, getWhatsAppUrl } from "@/lib/contact";
import { PLATFORM } from "@/lib/platform";

export function ContactHelp({ eventTitle }: { eventTitle?: string }) {
  const wa = getWhatsAppUrl(
    eventTitle
      ? `Hola ${PLATFORM.name}, no encuentro mis fotos en ${eventTitle}. Mi número es: `
      : undefined
  );
  const email = getContactEmail();

  if (!wa && !email) return null;

  return (
    <Card className="buyer-contact-help">
      <CardBody className="buyer-contact-help__body">
        <div className="buyer-contact-help__copy">
          <Badge tone="success">¿Necesitás ayuda?</Badge>
          <p className="ds-body mt-2 font-medium">¿No encontrás tus fotos?</p>
          <p className="ds-caption mt-1">
            Escribinos con tu número. También podés pagar por transferencia o Mercado Pago.
          </p>
        </div>
        <div className="buyer-contact-help__actions">
          {wa && (
            <ButtonLink
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="buyer-contact-help__wa"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp
            </ButtonLink>
          )}
          {email && (
            <ButtonLink href={`mailto:${email}`} variant="secondary">
              <Mail className="h-4 w-4" aria-hidden />
              Email
            </ButtonLink>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
