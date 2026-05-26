import { BRAND } from "@/lib/brand";

export function getWhatsAppUrl(message?: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, "") ?? "";
  if (!phone) return null;
  const text = encodeURIComponent(
    message ?? `Hola ${BRAND.name}, no encuentro mis fotos de carrera.`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export function getContactEmail() {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;
}
