import { MarketingPage } from "@/components/MarketingPage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody } from "@/components/ui/Card";
import { PLATFORM } from "@/lib/platform";

export const metadata = {
  title: `Precios — ${PLATFORM.name}`,
};

export default function PreciosPage() {
  return (
    <MarketingPage
      kicker="Precios"
      title="Precios transparentes"
      lead="Sin cuota mensual para empezar. Pagás comisión solo cuando vendés."
    >
      <Card>
        <CardBody>
          <div className="ds-marketing__pricing-block">
            <h2 className="ds-h3">Fotógrafos</h2>
            <p className="ds-body mt-2 text-[var(--color-text-secondary)]">
              Comisión plataforma <strong className="text-[var(--color-text-primary)]">{PLATFORM.commissionPercent}%</strong>{" "}
              por venta. Te quedás con{" "}
              <strong className="text-[var(--color-text-primary)]">{PLATFORM.photographerSharePercent}%</strong>{" "}
              vía Mercado Pago marketplace.
            </p>
          </div>
          <div className="ds-marketing__pricing-block">
            <h2 className="ds-h3">Compradores</h2>
            <p className="ds-body mt-2 text-[var(--color-text-secondary)]">
              Precio por foto definido por cada fotógrafo en su evento. Packs con descuento cuando el
              fotógrafo los habilita.
            </p>
          </div>
        </CardBody>
      </Card>
      <ButtonLink href="/fotografos/registro" variant="primary" className="mt-8">
        Crear cuenta gratis
      </ButtonLink>
    </MarketingPage>
  );
}
