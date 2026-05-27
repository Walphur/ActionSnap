"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PLATFORM } from "@/lib/platform";

const features = [
  {
    title: "Vendé en automático",
    text: "Subí galerías, etiquetá dorsales y vendé sin armar tiendas a mano.",
  },
  {
    title: "Marca de agua",
    text: "Personalizá el texto en previews; el cliente recibe HD al pagar.",
  },
  {
    title: "Cobros online",
    text: "Mercado Pago con split: vos cobrás el 80%, plataforma el 20%.",
  },
  {
    title: "Entrega instantánea",
    text: "Descarga inmediata y ZIP para packs — cero fricción post-venta.",
  },
];

export function PhotographerPitch() {
  return (
    <section id="fotografos" className="photographer-pitch section-slab">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="photographer-pitch-inner glass-panel"
      >
        <p className="trust-kicker">Para fotógrafos</p>
        <h2 className="font-display section-heading text-left md:text-center">
          Vendé fotos deportivas en automático
        </h2>
        <p className="section-lead max-w-2xl md:mx-auto md:text-center">
          {PLATFORM.name} es tu marketplace: publicá, cobrá y entregá sin perder tiempo en
          administración.
        </p>

        <div className="photographer-features">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="photographer-feature reveal-card"
            >
              <h3 className="font-display text-lg uppercase tracking-wide text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-white/70">{f.text}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/fotografos/registro" className="btn-hero btn-hero--primary">
            Empezar gratis
          </Link>
          <Link href="/para-fotografos" className="btn-hero btn-hero--ghost">
            Ver planes y detalles
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
