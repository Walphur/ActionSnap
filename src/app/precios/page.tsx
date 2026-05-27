import Link from "next/link";
import { MarketingPage } from "@/components/MarketingPage";
import { PLATFORM } from "@/lib/platform";

export const metadata = {
  title: `Precios — ${PLATFORM.name}`,
};

export default function PreciosPage() {
  return (
    <MarketingPage
      kicker="Pricing"
      title="Precios transparentes"
      lead="Sin cuota mensual para empezar. Pagás comisión solo cuando vendés."
    >
      <div className="glass-panel mt-6 space-y-4 p-6">
        <div>
          <h2 className="font-display text-2xl uppercase text-white">Fotógrafos</h2>
          <p className="mt-2 text-[var(--muted)]">
            Comisión plataforma <strong className="text-white">{PLATFORM.commissionPercent}%</strong>{" "}
            por venta. Te quedás con{" "}
            <strong className="text-white">{PLATFORM.photographerSharePercent}%</strong> vía Mercado
            Pago marketplace.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl uppercase text-white">Compradores</h2>
          <p className="mt-2 text-[var(--muted)]">
            Precio por foto definido por cada fotógrafo en su evento. Packs con descuento cuando el
            fotógrafo los habilita.
          </p>
        </div>
      </div>
      <Link href="/fotografos/registro" className="btn-primary mt-8 inline-flex">
        Crear cuenta gratis
      </Link>
    </MarketingPage>
  );
}
