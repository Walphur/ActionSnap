"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6">
        <motion.p
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55 }}
          className="font-display text-xs uppercase tracking-[0.3em] text-white/70"
        >
          Victor Films Loading
        </motion.p>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{
                y: [0, -8, 0],
                opacity: [0.3, 1, 0.3],
                filter: ["blur(2px)", "blur(0px)", "blur(2px)"],
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
