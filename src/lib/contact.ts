import { PLATFORM } from "@/lib/platform";

export function getWhatsAppUrl(message?: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, "") ?? "";
  if (!phone) return null;
  const text = encodeURIComponent(
    message ?? `Hola ${PLATFORM.name}, no encuentro mis fotos del evento.`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export function getContactEmail() {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;
}
