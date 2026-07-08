import { MarketingPage } from "@/components/MarketingPage";
import { PLATFORM } from "@/lib/platform";

export const metadata = {
  title: `Nosotros — ${PLATFORM.name}`,
};

export default function NosotrosPage() {
  return (
    <MarketingPage
      kicker="Nosotros"
      title="Sobre Action Snap"
      lead="El marketplace donde la fotografía de eventos se vende sin fricción."
    >
      <p className="ds-body">
        {PLATFORM.name} conecta fotógrafos con las personas que buscan sus mejores tomas.
        Publicás un evento, subís la galería, etiquetás las fotos manualmente y el comprador
        paga y descarga en HD al instante.
      </p>
      <p className="ds-body">
        Nuestro foco: UX simple, búsqueda rápida y compra sin fricción — motocross, automovilismo,
        ciclismo, atletismo, natación, eventos escolares y más, todo en un solo lugar.
      </p>
    </MarketingPage>
  );
}
