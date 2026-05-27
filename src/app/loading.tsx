import { BRAND } from "@/lib/brand";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-4">
        <img
          src={BRAND.logoSrc}
          alt={BRAND.name}
          className="h-28 w-auto max-w-[min(360px,80vw)] object-contain md:h-32"
        />
        <p className="text-sm text-[var(--muted)]">Cargando…</p>
      </div>
    </div>
  );
}
