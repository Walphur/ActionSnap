import { Alert } from "@/components/ui/Alert";
import type { EventWithCover } from "@/lib/event-cover";
import { LandingCta } from "@/components/landing/LandingCta";
import { LandingEvents } from "@/components/landing/LandingEvents";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingSocialProof } from "@/components/landing/LandingSocialProof";
import { LandingSteps } from "@/components/landing/LandingSteps";

type Props = {
  events: EventWithCover[];
  configError?: boolean;
};

export function LandingPage({ events, configError = false }: Props) {
  return (
    <div className="landing">
      <LandingHero />

      {configError && (
        <div className="landing__container">
          <Alert tone="warning" title="Configuración pendiente" className="mt-6">
            Conectá Supabase en <code>.env.local</code> para mostrar eventos reales.
          </Alert>
        </div>
      )}

      <LandingSocialProof />
      <LandingFeatures />
      <LandingSteps />
      <LandingEvents events={events} />

      <div className="landing__container">
        <LandingCta />
      </div>
    </div>
  );
}
