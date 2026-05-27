"use client";

import { motion } from "framer-motion";
import type { HomeStats } from "@/lib/platform";
import { AnimatedCounter } from "./AnimatedCounter";

const SPORTS = ["Motocross", "Triatlón", "Rally", "Ciclismo", "Fútbol", "Automovilismo"];

type Props = { stats: HomeStats };

export function TrustSection({ stats }: Props) {
  return (
    <section className="trust-section section-slab">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="trust-section-inner"
      >
        <p className="trust-kicker">Elegido por fotógrafos</p>
        <h2 className="font-display section-heading">Confianza real en cada evento</h2>
        <p className="section-lead mx-auto max-w-2xl text-center">
          Fotógrafos profesionales, galerías verificadas y miles de descargas en HD.
        </p>

        <div className="trust-stats-grid">
          <AnimatedCounter value={stats.events} label="Eventos" delay={0} />
          <AnimatedCounter value={stats.photographers} label="Fotógrafos" delay={0.08} />
          <AnimatedCounter value={stats.photos} label="Fotos" delay={0.16} />
          <AnimatedCounter value={stats.downloads} label="Descargas" delay={0.24} />
        </div>

        <div className="trust-sports">
          {SPORTS.map((s) => (
            <span key={s} className="trust-sport-pill">
              {s}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
