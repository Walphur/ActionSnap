"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function MainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main
      className={
        isHome
          ? "relative z-10 w-full max-w-none px-0 pb-0 pt-0"
          : "relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-24 md:px-6 md:pb-12 md:pt-28"
      }
    >
      {children}
    </main>
  );
}
