import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  kicker?: string;
  title: string;
  lead?: string;
  children: ReactNode;
};

export function MarketingPage({ kicker, title, lead, children }: Props) {
  return (
    <article className="ds-marketing">
      <header className="ds-marketing__head">
        {kicker && <p className="ds-overline">{kicker}</p>}
        <h1 className="ds-h1">{title}</h1>
        {lead && <p className="ds-body-lg ds-marketing__lead">{lead}</p>}
      </header>
      <div className="ds-marketing__body">{children}</div>
      <Link href="/" className="ds-marketing__footer-link">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver al inicio
      </Link>
    </article>
  );
}
