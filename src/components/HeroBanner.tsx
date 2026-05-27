import Link from "next/link";
import { BRAND } from "@/lib/brand";

type Props = {
  hasEvents: boolean;
};

export function HeroBanner({ hasEvents }: Props) {
  return (
    <section className="relative -mx-4 mb-16 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] md:-mx-0">
      <img
        src={BRAND.bannerSrc}
        alt={`${BRAND.name} — ${BRAND.tagline}`}
        className="block w-full object-cover"
        style={{ maxHeight: "min(420px, 55vw)" }}
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap items-end justify-between gap-4 p-6 md:p-8">
        <p className="max-w-md text-sm text-white/90 drop-shadow-md md:text-base">
          Encontrá tus fotos por dorsal, elegí las mejores y descargalas en HD.
        </p>
        <div className="flex flex-wrap gap-2">
          {hasEvents ? (
            <a href="#carreras" className="btn-primary">
              Ver carreras
            </a>
          ) : (
            <span className="btn-primary opacity-80">Próximas carreras</span>
          )}
          <Link href="#como-funciona" className="btn-secondary">
            Cómo funciona
          </Link>
        </div>
      </div>
    </section>
  );
}
