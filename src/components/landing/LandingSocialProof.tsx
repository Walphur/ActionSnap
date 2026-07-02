import { Quote } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";

const LOGO_SLOTS = 5;
const STAT_PLACEHOLDERS = [
  { label: "Eventos cubiertos", hint: "Métrica en vivo próximamente" },
  { label: "Fotos en plataforma", hint: "Métrica en vivo próximamente" },
  { label: "Fotógrafos activos", hint: "Métrica en vivo próximamente" },
  { label: "Descargas HD", hint: "Métrica en vivo próximamente" },
] as const;

export function LandingSocialProof() {
  return (
    <section className="landing-trust" aria-labelledby="trust-heading">
      <div className="landing__container">
        <div className="landing__section-head landing-reveal">
          <p className="landing__kicker ds-overline">Confianza</p>
          <h2 id="trust-heading" className="ds-h2">
            La plataforma que eligen los fotógrafos deportivos
          </h2>
          <p className="ds-body-lg mt-4 text-[var(--color-text-secondary)]">
            Próximamente: logos de partners, estadísticas en tiempo real y testimonios de la
            comunidad.
          </p>
        </div>

        <div className="landing-trust__logos" aria-label="Logos de partners — próximamente">
          {Array.from({ length: LOGO_SLOTS }).map((_, i) => (
            <div key={i} className="landing-trust__logo-slot">
              Logo
            </div>
          ))}
        </div>

        <div className="landing-trust__stats" aria-label="Estadísticas — próximamente">
          {STAT_PLACEHOLDERS.map(({ label, hint }) => (
            <div key={label} className="landing-trust__stat-card landing-reveal">
              <p className="landing-trust__stat-value" aria-hidden>
                —
              </p>
              <p className="landing-trust__stat-label">{label}</p>
              <p className="landing-trust__stat-hint">{hint}</p>
            </div>
          ))}
        </div>

        <div className="landing-trust__testimonials" aria-label="Testimonios — próximamente">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="landing-trust__quote landing-reveal">
              <CardBody>
                <div className="landing-trust__quote-placeholder">
                  <Quote className="landing-trust__quote-icon h-8 w-8" aria-hidden />
                  <p className="ds-caption">Testimonio de fotógrafo — próximamente</p>
                  <p className="ds-caption text-[var(--color-text-disabled)]">
                    Nombre y evento
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
