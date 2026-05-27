import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  kicker?: string;
  title: string;
  lead?: string;
  children: ReactNode;
};

export function MarketingPage({ kicker, title, lead, children }: Props) {
  return (
    <article className="marketing-page">
      <header className="marketing-page-header glass-panel">
        {kicker && <p className="trust-kicker">{kicker}</p>}
        <h1 className="font-display marketing-page-title">{title}</h1>
        {lead && <p className="marketing-page-lead">{lead}</p>}
      </header>
      <div className="marketing-page-body">{children}</div>
      <p className="mt-12 text-center text-sm text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">
          ← Volver al inicio
        </Link>
      </p>
    </article>
  );
}
