"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isPhotographerPanelPath } from "@/lib/routes";

export function MainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isPanel = isPhotographerPanelPath(pathname);
  const hideMobileTabPadding =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/fotografos/login") ||
    pathname.startsWith("/fotografos/registro");
  const mobileTabClass = !hideMobileTabPadding ? "main-shell--mobile-tabs" : "";

  if (isHome || isPanel) {
    return (
      <main className={`relative z-10 w-full max-w-none px-0 pb-0 pt-0 ${mobileTabClass}`}>
        {children}
      </main>
    );
  }

  return (
    <main
      className={[
        "relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-24 md:px-6 md:pb-12 md:pt-28",
        mobileTabClass,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </main>
  );
}
