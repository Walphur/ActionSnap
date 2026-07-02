import { LayoutDashboard, Tags, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function DashboardMockup() {
  return (
    <div className="landing-mockup" aria-hidden>
      <div className="landing-mockup__bar">
        <span className="landing-mockup__dot" />
        <span className="landing-mockup__dot" />
        <span className="landing-mockup__dot" />
      </div>
      <div className="landing-mockup__body">
        <aside className="landing-mockup__sidebar">
          <div className="landing-mockup__logo">AS</div>
          <div className="landing-mockup__nav-item landing-mockup__nav-item--active">
            <LayoutDashboard className="sr-only" />
          </div>
          <div className="landing-mockup__nav-item" />
          <div className="landing-mockup__nav-item" />
        </aside>
        <div className="landing-mockup__main">
          <div className="landing-mockup__header">
            <div>
              <p className="ds-overline landing__kicker--muted">Evento activo</p>
              <p className="ds-h4 landing-mockup__event-title">GP Motocross — San Luis</p>
            </div>
            <Badge tone="success">MP conectado</Badge>
          </div>

          <div className="landing-mockup__stats">
            <div className="landing-mockup__stat">
              <span className="landing-mockup__stat-value">1.248</span>
              <span className="landing-mockup__stat-label">Fotos subidas</span>
            </div>
            <div className="landing-mockup__stat">
              <span className="landing-mockup__stat-value">892</span>
              <span className="landing-mockup__stat-label">Dorsales listos</span>
            </div>
            <div className="landing-mockup__stat">
              <span className="landing-mockup__stat-value">47</span>
              <span className="landing-mockup__stat-label">Ventas hoy</span>
            </div>
          </div>

          <div className="landing-mockup__grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="landing-mockup__thumb" />
            ))}
          </div>

          <div className="landing-mockup__footer">
            <Badge tone="info">
              <Tags className="h-3 w-3" aria-hidden />
              Etiquetando…
            </Badge>
            <Badge tone="warning">
              <Wallet className="h-3 w-3" aria-hidden />
              +$12.400 hoy
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
