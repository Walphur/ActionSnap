import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { PLATFORM } from "@/lib/platform";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: Props) {
  return (
    <div className="auth-shell -mx-4 -mt-10 sm:-mx-6 md:-mt-10">
      <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />
          <div className="relative z-10">
            <BrandLogo href="/" size="md" />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
              {PLATFORM.name}
            </p>
            <h1 className="font-display mt-4 max-w-md text-4xl font-extrabold uppercase leading-[0.95] text-white">
              Vendé fotos de tus eventos deportivos
            </h1>
            <p className="mt-4 max-w-sm text-sm text-white/70">{PLATFORM.description}</p>
          </div>
          <ul className="relative z-10 space-y-3 text-sm text-white/75">
            <li className="flex gap-3">
              <span className="badge-sport shrink-0">1</span>
              Creá eventos por deporte y subí lotes con marca de agua
            </li>
            <li className="flex gap-3">
              <span className="badge-sport shrink-0">2</span>
              Los corredores buscan por dorsal y compran al instante
            </li>
            <li className="flex gap-3">
              <span className="badge-sport shrink-0">3</span>
              Cobrás {PLATFORM.photographerSharePercent}% — comisión plataforma{" "}
              {PLATFORM.commissionPercent}%
            </li>
          </ul>
        </div>

        <div className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-14">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLogo size="lg" href="/" />
          </div>
          <div className="mx-auto w-full max-w-sm">
            <h2 className="font-display text-center text-2xl font-bold">{title}</h2>
            <p className="mb-8 mt-2 text-center text-sm text-[var(--muted)]">{subtitle}</p>
            <div className="card p-6">{children}</div>
            <p className="mt-6 text-center text-xs text-[var(--muted)]">
              <Link href="/" className="text-[var(--accent)] hover:underline">
                ← Volver al marketplace
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
