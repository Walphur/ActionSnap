"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getTipsSeen,
  markTipSeen,
  type OnboardingTipId,
} from "@/lib/onboarding";

export function useOnboardingTips() {
  const [ready, setReady] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSeen(getTipsSeen());
    setReady(true);
  }, []);

  const shouldShow = useCallback(
    (tipId: OnboardingTipId) => ready && !seen.has(tipId),
    [ready, seen]
  );

  const dismiss = useCallback((tipId: OnboardingTipId) => {
    markTipSeen(tipId);
    setSeen((prev) => new Set([...prev, tipId]));
  }, []);

  return { shouldShow, dismiss, ready };
}
