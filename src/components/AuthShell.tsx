import Link from "next/link";
import { ArrowLeft, Camera, Tags, Wallet } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { PLATFORM } from "@/lib/platform";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const STEPS = [
  { icon: Camera, text: "Creá eventos por deporte y subí lotes con marca de agua" },
  { icon: Tags, text: "Etiquetá dorsales manualmente con atajos rápidos" },
  {
    icon: Wallet,
    text: `Cobrás ${PLATFORM.photographerSharePercent}% — comisión plataforma ${PLATFORM.commissionPercent}%`,
  },
] as const;

export function AuthShell({ title, subtitle, children }: Props) {
  return (
    <div className="ds-auth">
      <div className="ds-auth__grid">
        <aside className="ds-auth__aside" aria-hidden>
          <div className="ds-auth__aside-bg" />
          <div className="ds-auth__aside-content">
            <BrandLogo href="/" size="header" />
            <p className="ds-overline mt-8">{PLATFORM.name}</p>
            <h1 className="ds-h2 mt-3 max-w-md">Vendé fotos de tus eventos deportivos</h1>
            <p className="ds-body-lg mt-4 max-w-sm text-[var(--color-text-secondary)]">
              {PLATFORM.description}
            </p>
          </div>
          <ul className="ds-auth__steps">
            {STEPS.map(({ icon: Icon, text }) => (
              <li key={text} className="ds-auth__step">
                <Badge tone="info" className="shrink-0">
                  <Icon className="h-3 w-3" aria-hidden />
                </Badge>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="ds-auth__main">
          <div className="ds-auth__mobile-logo">
            <BrandLogo size="hero" href="/" />
          </div>
          <div className="ds-auth__form-wrap">
            <h2 className="ds-h3 text-center">{title}</h2>
            <p className="ds-caption mt-2 text-center text-[var(--color-text-secondary)]">
              {subtitle}
            </p>
            <Card className="mt-8">
              <CardBody>{children}</CardBody>
            </Card>
            <Link href="/" className="ds-auth__back">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Volver al marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
