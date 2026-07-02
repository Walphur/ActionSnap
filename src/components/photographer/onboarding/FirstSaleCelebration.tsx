"use client";

import { useEffect, useState } from "react";
import { Share2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ONBOARDING_KEYS, getStorageItem, setStorageItem } from "@/lib/onboarding";

type Props = {
  hasSales: boolean;
  shareSlug?: string;
  shareTitle?: string;
};

export function FirstSaleCelebration({ hasSales, shareSlug, shareTitle }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasSales) return;
    if (getStorageItem(ONBOARDING_KEYS.firstSaleSeen)) return;
    setVisible(true);
  }, [hasSales]);

  if (!visible) return null;

  function dismiss() {
    setStorageItem(ONBOARDING_KEYS.firstSaleSeen, "1");
    setVisible(false);
  }

  return (
    <div className="ds-first-sale" role="status" aria-live="polite">
      <div className="ds-first-sale__inner">
        <Sparkles className="ds-first-sale__icon h-5 w-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="ds-body font-semibold">🎉 ¡Felicitaciones!</p>
          <p className="ds-caption mt-0.5">
            Acabás de vender tus primeras fotos. Compartí nuevamente tu evento para conseguir más
            ventas.
          </p>
          {shareSlug && (
            <div className="mt-3">
              <ButtonLink href={`/fotografos?tab=upload`} variant="secondary" size="sm">
                <Share2 className="h-4 w-4" aria-hidden />
                Compartir {shareTitle ? `“${shareTitle}”` : "evento"}
              </ButtonLink>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={dismiss}
          aria-label="Cerrar"
          className="shrink-0"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
