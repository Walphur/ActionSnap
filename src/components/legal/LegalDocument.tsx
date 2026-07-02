import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { PLATFORM } from "@/lib/platform";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type Props = {
  title: string;
  updatedAt?: string;
  intro?: ReactNode;
  sections: LegalSection[];
};

export function LegalDocument({ title, updatedAt, intro, sections }: Props) {
  const dateLabel =
    updatedAt ??
    new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

  return (
    <article className="ds-legal">
      <header className="ds-legal__head">
        <p className="ds-overline">Documentación legal</p>
        <h1 className="ds-h1">{title}</h1>
        <p className="ds-caption mt-2">
          {PLATFORM.name} · Última actualización: {dateLabel}
        </p>
        {intro && <div className="ds-legal__intro ds-body-lg">{intro}</div>}
      </header>

      <Card className="ds-legal__toc">
        <CardBody>
          <p className="ds-overline">Contenido</p>
          <nav aria-label="Índice del documento">
            <ol className="ds-legal__toc-list">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </nav>
        </CardBody>
      </Card>

      <div className="ds-legal__body">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="ds-legal__section">
            <h2 className="ds-h3">{section.title}</h2>
            <div className="ds-legal__prose ds-body">{section.content}</div>
          </section>
        ))}
      </div>

      <footer className="ds-legal__footer">
        <p className="ds-caption">
          ¿Consultas legales o de privacidad?{" "}
          <a href="mailto:hola@actionsnap.store">hola@actionsnap.store</a>
        </p>
        <div className="ds-legal__footer-links">
          <Link href="/legales/terminos">Términos y Condiciones</Link>
          <Link href="/legales/privacidad">Políticas de Privacidad</Link>
          <Link href="/" className="inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Volver al inicio
          </Link>
        </div>
      </footer>
    </article>
  );
}
