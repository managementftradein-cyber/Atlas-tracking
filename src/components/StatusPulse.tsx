 "use client";

import { motion } from "motion/react";

export default function StatusPulse({ label = "Live tracking" }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-medium text-cyan-200">
      <span className="relative flex h-2 w-2">
        <motion.span
          animate={{ scale: [1, 1.9, 1], opacity: [0.9, 0, 0.9] }}
          transition={{ duration: 1.7, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-cyan-400"
        />
        <span className="relative h-2 w-2 rounded-full bg-cyan-400" />
      </span>
      {label}
    </div>
  );
}