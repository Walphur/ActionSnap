"use client";

import { useRouter } from "next/navigation";
import { LayoutDashboard, CalendarDays, Upload, Settings, type LucideIcon } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/ui/cn";
import { createClient } from "@/lib/supabase/client";

type Tab = { id: string; label: string };

const TAB_ICONS: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  events: CalendarDays,
  upload: Upload,
  settings: Settings,
};

type Props = {
  children: React.ReactNode;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
};

export function PhotographerShell({ children, tabs, activeTab, onTabChange }: Props) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/fotografos/login");
    router.refresh();
  }

  return (
    <div className="ds-dashboard-shell">
      <header className="ds-dashboard-shell__header">
        <div className="ds-dashboard-shell__bar">
          <div className="ds-dashboard-shell__top">
            <div className="ds-dashboard-shell__brand">
              <BrandLogo size="navbar" href="/fotografos" />
              <p className="ds-dashboard-shell__eyebrow ds-overline">
                Panel fotógrafo
              </p>
            </div>
            <div className="ds-dashboard-shell__actions">
              <ButtonLink href="/" variant="ghost" size="sm">
                Ver sitio
              </ButtonLink>
              <Button type="button" variant="ghost" size="sm" onClick={() => void logout()}>
                Salir
              </Button>
            </div>
          </div>

          {tabs && onTabChange && activeTab && (
            <nav className="ds-dashboard-shell__tabs" aria-label="Panel fotógrafo">
              <div className="ds-tabs__list" role="tablist">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === t.id}
                    data-selected={activeTab === t.id || undefined}
                    className={cn("ds-tabs__trigger")}
                    onClick={() => onTabChange(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>
      <div className="ds-dashboard-shell__body">{children}</div>

      {tabs && onTabChange && activeTab && (
        <nav className="ds-dash-tabbar md:hidden" aria-label="Panel fotógrafo móvil">
          {tabs.map((t) => {
            const Icon = TAB_ICONS[t.id] ?? LayoutDashboard;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-selected={active}
                data-selected={active || undefined}
                className="ds-dash-tabbar__item"
                onClick={() => onTabChange(t.id)}
              >
                <Icon className="h-5 w-5" aria-hidden strokeWidth={active ? 2.5 : 2} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
