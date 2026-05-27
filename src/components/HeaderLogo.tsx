"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { BrandLogo } from "@/components/BrandLogo";

/** Triple clic abre /admin/login (acceso oculto para el fotógrafo). */
export function HeaderLogo() {
  const router = useRouter();
  const clicks = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onClick(e: React.MouseEvent) {
    clicks.current += 1;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      clicks.current = 0;
    }, 900);

    if (clicks.current >= 3) {
      e.preventDefault();
      e.stopPropagation();
      clicks.current = 0;
      router.push("/admin/login");
    }
  }

  return (
    <span onClick={onClick} className="inline-block">
      <span className="sm:hidden">
        <BrandLogo variant="icon" height={40} href="/" priority />
      </span>
      <span className="hidden sm:inline-block">
        <BrandLogo variant="horizontal" height={44} href="/" priority />
      </span>
    </span>
  );
}
