"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import { PLATFORM } from "@/lib/platform";

export function PhotographerShell({ children }: { children: React.ReactNode }) {
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
            <BrandLogo size="md" href="/" />
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
              {PLATFORM.name} · Panel fotógrafo
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Link href="/" className="btn-secondary !py-2 !text-xs md:!text-sm">
              Ver sitio
            </Link>
            <Link
              href="/para-fotografos"
              className="btn-secondary !py-2 !text-xs md:!text-sm"
            >
              Ayuda
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="btn-secondary !py-2 !text-xs md:!text-sm"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>
      <div className="panel-body">{children}</div>
    </div>
  );
}
