"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { formatStatDisplay } from "@/lib/platform";

type Props = {
  value: number;
  label: string;
  delay?: number;
};

export function AnimatedCounter({ value, label, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(formatStatDisplay(0));

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const startAt = performance.now() + delay * 1000;

    const tick = (now: number) => {
      const elapsed = now - startAt;
      if (elapsed < 0) {
        requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(formatStatDisplay(Math.round(eased * value)));
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [inView, value, delay]);

  return (
    <div ref={ref} className="trust-stat">
      <p className="trust-stat-value font-display">{display}</p>
      <p className="trust-stat-label">{label}</p>
    </div>
  );
}
