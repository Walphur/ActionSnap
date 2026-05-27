const steps = [
  {
    step: "01",
    title: "Elegí el evento",
    text: "Motocross, natación, triatlón y más. Cada evento tiene su galería pública.",
  },
  {
    step: "02",
    title: "Buscá tu dorsal",
    text: "Filtrá por número y encontrá tus fotos en segundos.",
  },
  {
    step: "03",
    title: "Comprá y descargá HD",
    text: "Pago seguro con Mercado Pago. Descarga individual o ZIP.",
  },
];

export function HowItWorks() {
  return (
    <section className="space-y-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8 md:p-12">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
          Para corredores
        </p>
        <h2 className="font-display mt-2 text-3xl font-extrabold uppercase md:text-4xl">
          Cómo comprar tus fotos
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((s) => (
          <article key={s.step} className="how-step" data-step={s.step}>
            <h3 className="font-display text-lg font-bold uppercase">{s.title}</h3>
            <p className="mt-2 text-sm text-white/70">{s.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
