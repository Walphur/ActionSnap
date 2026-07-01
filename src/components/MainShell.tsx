"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function MainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const hideMobileTabPadding =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/fotografos/login") ||
    pathname.startsWith("/fotografos/registro");
  const mobileTabClass = !hideMobileTabPadding ? "main-shell--mobile-tabs" : "";

  return (
    <main
      className={
        isHome
          ? `relative z-10 w-full max-w-none px-0 pb-0 pt-0 ${mobileTabClass}`
          : [
              "relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-24 md:px-6 md:pb-12 md:pt-28",
              mobileTabClass,
            ]
              .filter(Boolean)
              .join(" ")
      }
    >
      {children}
    </main>
  );
}
