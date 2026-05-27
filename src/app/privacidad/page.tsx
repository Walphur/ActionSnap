import { MarketingPage } from "@/components/MarketingPage";
import { PLATFORM } from "@/lib/platform";

export const metadata = {
  title: `Privacidad — ${PLATFORM.name}`,
};

export default function PrivacidadPage() {
  return (
    <MarketingPage kicker="Legal" title="Política de privacidad">
      <p className="text-sm text-[var(--muted)]">
        Recopilamos email y datos de compra para entregar descargas y soporte. Los fotógrafos son
        responsables del contenido que suben. No vendemos datos personales a terceros. Los pagos los
        procesa Mercado Pago bajo sus propias políticas.
      </p>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Consultas:{" "}
        <a href="mailto:hola@actionsnap.store" className="text-[var(--accent)]">
          hola@actionsnap.store
        </a>
      </p>
    </MarketingPage>
  );
}
