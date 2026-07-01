import Link from "next/link";
import type { ReactNode } from "react";
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
    <article className="legal-doc">
      <header className="legal-doc-header">
        <p className="legal-doc-kicker">Documentación legal</p>
        <h1 className="font-display legal-doc-title">{title}</h1>
        <p className="legal-doc-meta">
          {PLATFORM.name} · Última actualización: {dateLabel}
        </p>
        {intro && <div className="legal-doc-intro">{intro}</div>}
      </header>

      <nav className="legal-doc-toc" aria-label="Índice del documento">
        <p className="legal-doc-toc-label">Contenido</p>
        <ol>
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="legal-doc-body">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="legal-doc-section">
            <h2>{section.title}</h2>
            <div className="legal-doc-prose">{section.content}</div>
          </section>
        ))}
      </div>

      <footer className="legal-doc-footer">
        <p>
          ¿Consultas legales o de privacidad?{" "}
          <a href="mailto:hola@actionsnap.store">hola@actionsnap.store</a>
        </p>
        <div className="legal-doc-footer-links">
          <Link href="/legales/terminos">Términos y Condiciones</Link>
          <Link href="/legales/privacidad">Políticas de Privacidad</Link>
          <Link href="/">Volver al inicio</Link>
        </div>
      </footer>
    </article>
  );
}
