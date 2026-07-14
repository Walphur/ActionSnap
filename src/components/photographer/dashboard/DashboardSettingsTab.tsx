import { DashboardBankCard } from "@/components/photographer/dashboard/DashboardBankCard";
import { DashboardMpCard } from "@/components/photographer/dashboard/DashboardMpCard";
import { WatermarkSettings } from "@/components/photographer/WatermarkSettings";
import { OnboardingTip } from "@/components/photographer/onboarding/OnboardingTip";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

type Props = {
  mpConnected: boolean;
  mpReceiverId: string;
  dataReady?: boolean;
  showSettingsTip: boolean;
  showMpTip: boolean;
  onDismissSettingsTip: () => void;
  onDismissMpTip: () => void;
  onStatus: (msg: string, ok: boolean) => void;
};

export function DashboardSettingsTab({
  mpConnected,
  mpReceiverId,
  dataReady = true,
  showSettingsTip,
  showMpTip,
  onDismissSettingsTip,
  onDismissMpTip,
  onStatus,
}: Props) {
  return (
    <div className="ds-dashboard">
      <section className="ds-dash-section">
        <div className="ds-dash-section__head">
          <div>
            <p className="ds-overline">Configuración</p>
            <h2 className="ds-h3 mt-1">Cuenta y pagos</h2>
          </div>
        </div>
      </section>

      {showSettingsTip && (
        <OnboardingTip title="Configuración" onDismiss={onDismissSettingsTip}>
          Acá vinculás Mercado Pago y personalizás tu marca de agua. Conectá tu cuenta antes de
          publicar para poder cobrar.
        </OnboardingTip>
      )}

      {dataReady && showMpTip && !mpConnected && (
        <OnboardingTip title="Mercado Pago" onDismiss={onDismissMpTip}>
          Sin Mercado Pago no podés recibir pagos. La conexión es segura y solo toma unos segundos.
        </OnboardingTip>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {dataReady ? (
          <DashboardMpCard
            mpConnected={mpConnected}
            mpReceiverId={mpReceiverId}
            highlight={!mpConnected}
          />
        ) : (
          <Card>
            <CardBody>
              <p className="ds-caption text-[var(--color-text-secondary)]">
                Cargando estado de Mercado Pago…
              </p>
            </CardBody>
          </Card>
        )}

        <DashboardBankCard onStatus={onStatus} />

        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="ds-h4">Marca de agua</h2>
            <p className="ds-caption mt-1">Personalizá el texto en las previews.</p>
          </CardHeader>
          <CardBody>
            <WatermarkSettings onStatus={onStatus} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
