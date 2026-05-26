import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-12">
      <div className="card mb-8 flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <BrandLogo size="md" href="/" />
          <p className="mt-3 text-sm font-medium text-[var(--text)]">Panel del fotógrafo</p>
          <p className="text-sm text-[var(--muted)]">
            Cargá carreras, subí fotos y etiquetá dorsales. Los corredores compran en el sitio
            público.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/" className="btn-secondary !py-2.5 !text-sm">
            Ver sitio público
          </Link>
          <Link href="/#carreras" className="btn-secondary !py-2.5 !text-sm">
            Carreras publicadas
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
