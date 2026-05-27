"use client";

import { motion } from "framer-motion";
import { BRAND } from "@/lib/brand";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6">
        <motion.img
          src={BRAND.logoSrc}
          alt={BRAND.name}
          initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.55 }}
          className="h-24 w-auto object-contain"
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="font-display text-xs uppercase tracking-[0.3em] text-white/70"
        >
          Cargando {BRAND.name}
        </motion.p>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{
                y: [0, -8, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: i * 0.12,
                ease: "easeInOut",
              }}
              className="h-2 w-14 rounded-full bg-white/80"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
