import { BRAND } from "@/lib/brand";

export async function sendPurchaseEmail(
  to: string,
  downloadUrl: string,
  eventTitle: string,
  misComprasUrl?: string
) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key || !to.includes("@")) return false;

  const from = process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Tus fotos — ${eventTitle}`,
      html: `
        <p>¡Gracias por tu compra en <strong>${BRAND.name}</strong>!</p>
        <p>Evento: ${eventTitle}</p>
        <p><a href="${downloadUrl}">Descargar mis fotos en alta resolución</a></p>
        ${
          misComprasUrl
            ? `<p>O recuperá tus compras en cualquier momento: <a href="${misComprasUrl}">Mis compras</a></p>`
            : ""
        }
        <p style="color:#666;font-size:12px">Si el link no funciona, guardá este correo y probá más tarde.</p>
      `,
    }),
  });

  return res.ok;
}
