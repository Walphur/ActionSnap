import { MarketingPage } from "@/components/MarketingPage";
import { PLATFORM } from "@/lib/platform";

export const metadata = {
  title: `Contacto — ${PLATFORM.name}`,
};

export default function ContactoPage() {
  return (
    <MarketingPage
      kicker="Contact"
      title="Contacto y soporte"
      lead="Estamos para ayudarte con compras, ventas o tu cuenta de fotógrafo."
    >
      <div className="glass-panel space-y-4 p-6">
        <p>
          <strong className="text-white">Email:</strong>{" "}
          <a href="mailto:hola@actionsnap.store" className="text-[var(--accent)]">
            hola@actionsnap.store
          </a>
        </p>
        <p className="text-sm text-[var(--muted)]">
          Tiempo de respuesta habitual: 24–48 h hábiles. Para urgencias de descarga, incluí el email
          de compra y el evento.
        </p>
      </div>
    </MarketingPage>
  );
}
