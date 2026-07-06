"use client";

import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/ui/cn";
import { createClient } from "@/lib/supabase/client";
import { PLATFORM } from "@/lib/platform";

type Tab = { id: string; label: string };

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
        <div className="ds-dashboard-shell__header-inner">
          <div className="ds-dashboard-shell__top">
            <div>
              <BrandLogo size="header" href="/fotografos" />
              <p className="ds-dashboard-shell__eyebrow ds-overline">
                {PLATFORM.name} · Panel fotógrafo
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
            <div className="ds-dashboard-shell__tabs">
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
            </div>
          )}
        </div>
      </header>
      <div className="ds-dashboard-shell__body">{children}</div>
    </div>
  );
}
