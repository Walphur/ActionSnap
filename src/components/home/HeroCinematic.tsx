"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PLATFORM } from "@/lib/platform";

export function HeroCinematic() {
  return (
    <section className="hero-cinematic">
      <div className="hero-cinematic-media" aria-hidden>
        <img
          src={PLATFORM.heroImageSrc}
          alt=""
          className="hero-cinematic-img"
          fetchPriority="high"
        />
        <video
          className="hero-cinematic-video"
          autoPlay
          muted
          loop
          playsInline
          poster={PLATFORM.heroPoster}
        >
          <source src={PLATFORM.heroVideoSrc} type="video/mp4" />
          <source src={PLATFORM.heroVideoSrcHd} type="video/mp4" />
        </video>
      </div>
      <div className="hero-cinematic-vignette" />
      <div className="hero-cinematic-glow" />

      <div className="hero-cinematic-inner">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-eyebrow"
        >
          {PLATFORM.taglineEs}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="font-display hero-headline"
        >
          {PLATFORM.heroHeadline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="hero-subline"
        >
          {PLATFORM.heroSubheadline}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24 }}
          className="hero-cta-row"
        >
          <Link href="#eventos" className="btn-hero btn-hero--primary">
            Explorar eventos
          </Link>
          <Link href="#buscar" className="btn-hero btn-hero--ghost">
            Buscar mis fotos
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
