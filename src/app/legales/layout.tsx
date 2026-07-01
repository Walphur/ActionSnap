import type { ReactNode } from "react";

export default function LegalesLayout({ children }: { children: ReactNode }) {
  return <div className="legal-layout">{children}</div>;
}
