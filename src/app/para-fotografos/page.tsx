import { LandingCta } from "@/components/landing/LandingCta";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingSteps } from "@/components/landing/LandingSteps";

export default function ParaFotografosPage() {
  return (
    <div className="landing">
      <LandingHero />
      <LandingFeatures />
      <LandingSteps />
      <div className="landing__container">
        <LandingCta />
      </div>
    </div>
  );
}
