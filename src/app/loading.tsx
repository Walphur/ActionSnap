"use client";

import { motion } from "framer-motion";
import { BRAND } from "@/lib/brand";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[var(--bg)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-5"
      >
        <motion.img
          src={BRAND.logoSrc}
          alt={BRAND.name}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="h-28 w-auto max-w-[min(360px,80vw)] object-contain md:h-32"
        />
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-8 rounded-full bg-[var(--accent)]"
              animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
