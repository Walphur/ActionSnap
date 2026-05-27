const steps = [
  { title: "Elegí el evento", text: "Motocross, triatlón, rally y más." },
  { title: "Buscá tu dorsal", text: "Filtrá y encontrá tus fotos." },
  { title: "Comprá en HD", text: "Mercado Pago · descarga al instante." },
];

export function HowItWorks() {
  return (
    <section className="section-minimal">
      <h2 className="section-title">Cómo funciona</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {steps.map((s, i) => (
          <article key={s.title} className="minimal-step">
            <span className="text-sm font-medium text-[var(--accent)]">{i + 1}</span>
            <h3 className="mt-2 font-semibold text-white">{s.title}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{s.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
