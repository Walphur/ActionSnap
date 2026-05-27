import { MarketingPage } from "@/components/MarketingPage";
import { PLATFORM } from "@/lib/platform";

export const metadata = {
  title: `Términos — ${PLATFORM.name}`,
};

export default function TerminosPage() {
  return (
    <MarketingPage kicker="Legal" title="Términos de uso">
      <p className="text-sm text-[var(--muted)]">
        Al usar {PLATFORM.name} aceptás que las fotos se licencian según lo definido por cada
        fotógrafo al publicar el evento. La plataforma actúa como intermediario tecnológico entre
        fotógrafos y compradores. Los pagos se procesan mediante Mercado Pago.
      </p>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Este documento es un resumen informativo. Para condiciones completas contactá{" "}
        <a href="mailto:hola@actionsnap.store" className="text-[var(--accent)]">
          hola@actionsnap.store
        </a>
        .
      </p>
    </MarketingPage>
  );
}
