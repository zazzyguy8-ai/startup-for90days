"use client";

import { motion } from "framer-motion";

export function scoreColor(score: number, max = 100): string {
  const pct = score / max;
  if (pct >= 0.75) return "var(--success)";
  if (pct >= 0.55) return "var(--accent)";
  if (pct >= 0.38) return "var(--warning)";
  return "var(--danger)";
}

export default function ScoreRing({
  score,
  max = 100,
  size = 180,
  stroke = 12,
  label,
}: {
  score: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / max));
  const color = scoreColor(score, max);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 12px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="font-bold tracking-tight"
          style={{ fontSize: size / 3.6, color }}
        >
          {Math.round(score)}
        </motion.span>
        {label && (
          <span className="text-xs font-medium text-muted">{label}</span>
        )}
      </div>
    </div>
  );
}
