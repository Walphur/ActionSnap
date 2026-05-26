import { getContactEmail, getWhatsAppUrl } from "@/lib/contact";
import { BRAND } from "@/lib/brand";

export function ContactHelp({ eventTitle }: { eventTitle?: string }) {
  const wa = getWhatsAppUrl(
    eventTitle
      ? `Hola ${BRAND.name}, no encuentro mis fotos en ${eventTitle}. Mi dorsal es: `
      : undefined
  );
  const email = getContactEmail();

  if (!wa && !email) return null;

  return (
    <div className="card mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">¿No encontrás tus fotos?</p>
        <p className="text-sm text-[var(--muted)]">
          Escribinos con tu dorsal. También podés pagar por transferencia / Mercado Pago.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !bg-[#25D366] !text-white !shadow-none hover:!bg-[#20bd5a]"
          >
            WhatsApp
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="btn-secondary">
            Email
          </a>
        )}
      </div>
    </div>
  );
}
