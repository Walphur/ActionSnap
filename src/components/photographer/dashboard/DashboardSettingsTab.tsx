import { DashboardMpCard } from "@/components/photographer/dashboard/DashboardMpCard";
import { WatermarkSettings } from "@/components/photographer/WatermarkSettings";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

type Props = {
  mpConnected: boolean;
  mpReceiverId: string;
  mpSaving: boolean;
  onSaveMpManual: () => void;
  onMpIdChange: (value: string) => void;
  onStatus: (msg: string, ok: boolean) => void;
};

export function DashboardSettingsTab({
  mpConnected,
  mpReceiverId,
  mpSaving,
  onSaveMpManual,
  onMpIdChange,
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

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardMpCard
          mpConnected={mpConnected}
          mpReceiverId={mpReceiverId}
          mpSaving={mpSaving}
          onSaveManual={onSaveMpManual}
          onMpIdChange={onMpIdChange}
        />

        <Card>
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
