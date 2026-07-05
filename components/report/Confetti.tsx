"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

// Lightweight celebration burst shown once for high-scoring verdicts.
export default function Confetti() {
  const [pieces, setPieces] = useState<
    { x: number; delay: number; color: string; size: number; drift: number }[]
  >([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 5 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 200,
      }))
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: "110vh",
            x: p.drift,
            opacity: [1, 1, 0.8, 0],
            rotate: 720,
          }}
          transition={{ duration: 3 + Math.random() * 1.5, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
