"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  title: string;
  children: React.ReactNode;
  onDismiss: () => void;
};

export function OnboardingTip({ title, children, onDismiss }: Props) {
  return (
    <div className="ds-onboarding-tip" role="note">
      <div className="ds-onboarding-tip__content">
        <p className="ds-onboarding-tip__title">{title}</p>
        <p className="ds-onboarding-tip__body">{children}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="ds-onboarding-tip__close"
        onClick={onDismiss}
        aria-label="Cerrar ayuda"
      >
        <X className="h-4 w-4" aria-hidden />
        Entendido
      </Button>
    </div>
  );
}
