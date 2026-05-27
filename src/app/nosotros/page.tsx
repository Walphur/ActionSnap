import { MarketingPage } from "@/components/MarketingPage";
import { PLATFORM } from "@/lib/platform";

export const metadata = {
  title: `Nosotros — ${PLATFORM.name}`,
};

export default function NosotrosPage() {
  return (
    <MarketingPage
      kicker="About"
      title="Sobre Action Snap"
      lead="El marketplace donde la fotografía deportiva se vende en automático."
    >
      <p>
        {PLATFORM.name} conecta fotógrafos de competencia con atletas y público que buscan sus
        mejores tomas. Publicás un evento, subís la galería, etiquetamos dorsales y el comprador
        paga y descarga en HD al instante.
      </p>
      <p className="mt-4">
        Nuestro foco: UX simple, búsqueda rápida y compra sin fricción — motocross, triatlón,
        rally, ciclismo y más deportes en un solo lugar.
      </p>
    </MarketingPage>
  );
}
