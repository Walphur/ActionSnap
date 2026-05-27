"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
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
    <div className="photographer-panel -mx-4 sm:-mx-6">
      <header className="panel-header">
        <div className="panel-header-inner">
          <div>
            <BrandLogo size="header" href="/" />
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
              {PLATFORM.name} · Panel fotógrafo
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Link href="/" className="btn-secondary !py-2 !text-xs md:!text-sm">
              Ver sitio
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="btn-secondary !py-2 !text-xs md:!text-sm"
            >
              Salir
            </button>
          </nav>
        </div>
        {tabs && onTabChange && (
          <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                className={`dashboard-tab ${activeTab === t.id ? "dashboard-tab--active" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </header>
      <div className="panel-body">{children}</div>
    </div>
  );
}
