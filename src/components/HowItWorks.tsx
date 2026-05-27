"use client";

import { motion } from "framer-motion";

const steps = [
  { title: "Elegí el evento", text: "Motocross, triatlón, rally, ciclismo y más." },
  { title: "Buscá tu dorsal", text: "Filtrá y encontrá tus fotos en segundos." },
  { title: "Comprá en HD", text: "Mercado Pago · descarga instantánea + ZIP." },
];

export function HowItWorks() {
  return (
    <section className="how-premium">
      <p className="trust-kicker text-center">How it works</p>
      <h2 className="font-display section-heading text-center">Cómo funciona</h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {steps.map((s, i) => (
          <motion.article
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="how-premium-card glass-panel"
          >
            <span className="how-premium-num font-display">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 font-display text-xl uppercase tracking-wide text-white">{s.title}</h3>
            <p className="mt-2 text-sm text-white/65">{s.text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
