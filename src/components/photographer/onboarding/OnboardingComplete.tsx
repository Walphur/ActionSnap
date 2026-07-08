"use client";

import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ONBOARDING_KEYS, getStorageItem, setStorageItem } from "@/lib/onboarding";

export function OnboardingComplete() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!getStorageItem(ONBOARDING_KEYS.checklistCompleteSeen));
  }, []);

  if (!visible) return null;

  function dismiss() {
    setStorageItem(ONBOARDING_KEYS.checklistCompleteSeen, "1");
    setVisible(false);
  }

  return (
    <Card className="ds-onboarding-complete ds-dash-reveal">
      <CardBody>
        <div className="ds-onboarding-complete__inner">
          <span className="ds-onboarding-complete__icon" aria-hidden>
            <PartyPopper className="h-6 w-6" />
          </span>
          <div>
            <h2 className="ds-h4">¡Felicitaciones!</h2>
            <p className="ds-body mt-1 text-[var(--color-text-secondary)]">
              Completaste todos los pasos iniciales. Tu galería está lista para vender — seguí
              compartiendo tus eventos para llegar a más personas.
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={dismiss}>
            Continuar
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
