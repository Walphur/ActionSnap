import type { LucideIcon } from "lucide-react";
import {
  CalendarPlus,
  FolderUp,
  Settings,
  ShoppingBag,
  Tags,
} from "lucide-react";

type Tab = "overview" | "events" | "upload" | "settings";

type Props = {
  onNavigate: (tab: Tab) => void;
};

const ACTIONS: {
  id: string;
  label: string;
  tab: Tab;
  icon: LucideIcon;
}[] = [
  { id: "create", label: "Crear evento", tab: "events", icon: CalendarPlus },
  { id: "upload", label: "Subir fotos", tab: "upload", icon: FolderUp },
  { id: "tag", label: "Etiquetar", tab: "upload", icon: Tags },
  { id: "sales", label: "Ver ventas", tab: "overview", icon: ShoppingBag },
  { id: "settings", label: "Configuración", tab: "settings", icon: Settings },
];

export function DashboardQuickActions({ onNavigate }: Props) {
  return (
    <section className="ds-dash-section ds-dash-reveal" aria-labelledby="quick-actions-title">
      <div className="ds-dash-section__head">
        <div>
          <p className="ds-overline">Acciones rápidas</p>
          <h2 id="quick-actions-title" className="ds-h3 mt-1">
            ¿Qué querés hacer ahora?
          </h2>
        </div>
      </div>
      <div className="ds-dash-quick">
        {ACTIONS.map(({ id, label, tab, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className="ds-dash-quick__action ds-pressable"
            onClick={() => onNavigate(tab)}
          >
            <span className="ds-dash-quick__action-icon">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
