import Link from "next/link";
import { PLATFORM } from "@/lib/platform";

const steps = [
  {
    n: "01",
    title: "Creá tu cuenta",
    text: "Registrate como fotógrafo y conectá tu cuenta de Mercado Pago (receiver ID).",
  },
  {
    n: "02",
    title: "Publicá eventos",
    text: "Motocross, natación, triatlón y más. Subí fotos con marca de agua automática.",
  },
  {
    n: "03",
    title: "Cobrá ventas",
    text: `Te quedás con el ${PLATFORM.photographerSharePercent}% de cada venta. La plataforma retiene ${PLATFORM.commissionPercent}%.`,
  },
];

const perks = [
  "Galería pública por evento",
  "Búsqueda por dorsal",
  "Checkout Mercado Pago",
  "Descarga HD + ZIP",
  "Panel de estadísticas",
  "Pack con descuento",
];

export default function ParaFotografosPage() {
  return (
    <div className="-mx-4 space-y-16 sm:-mx-6 md:space-y-24">
      <section className="relative overflow-hidden border-y border-white/10 px-6 py-20 md:rounded-3xl md:border md:px-14 md:py-28">
        <div className="hero-light absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
            {PLATFORM.name} · Para fotógrafos
          </p>
          <h1 className="font-display mt-6 text-4xl font-extrabold uppercase leading-[0.92] text-white md:text-6xl">
            Tu marketplace de fotos deportivas
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm text-white/75 md:text-base">
            Publicá eventos, vendé por dorsal y cobrá con split automático. Sin armar
            tiendas a mano: todo en un solo lugar.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/fotografos/registro" className="btn-primary cta-pulse">
              Empezar gratis
            </Link>
            <Link href="/fotografos/login" className="btn-secondary border-white/20 bg-black/40">
              Ya tengo cuenta
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/50">
            Comisión plataforma {PLATFORM.commissionPercent}% · Vos cobrás{" "}
            {PLATFORM.photographerSharePercent}%
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-0">
        <h2 className="font-display text-center text-2xl font-bold uppercase md:text-4xl">
          Cómo funciona
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <article key={s.n} className="glass reveal-card rounded-2xl border border-white/10 p-6">
              <p className="font-display text-3xl font-bold text-white/25">{s.n}</p>
              <h3 className="font-display mt-2 text-lg font-bold uppercase">{s.title}</h3>
              <p className="mt-3 text-sm text-white/70">{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-0">
        <div className="rounded-3xl border border-white/10 bg-[var(--surface)] p-8 md:p-12">
          <h2 className="font-display text-2xl font-bold uppercase md:text-3xl">
            Todo lo que necesitás
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-white/80">
                <span className="text-[var(--accent)]">✓</span>
                {p}
              </li>
            ))}
          </ul>
          <Link href="/fotografos/registro" className="btn-primary mt-10 inline-flex">
            Crear cuenta de fotógrafo
          </Link>
        </div>
      </section>
    </div>
  );
}
