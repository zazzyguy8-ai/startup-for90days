"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function SectionCard({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`glass rounded-3xl p-6 sm:p-8 ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-white">
          <Icon size={16} />
        </span>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

export function Bullets({
  items,
  accent,
}: {
  items: string[];
  accent?: string;
}) {
  return (
    <ul className="space-y-2">
      {items.map((x) => (
        <li key={x} className="flex gap-2.5 text-sm leading-relaxed">
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: accent ?? "var(--accent)" }}
          />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted">
      {children}
    </h3>
  );
}

export function CanvasBox({
  title,
  items,
  className = "",
}: {
  title: string;
  items: string[] | string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-(--card-border) p-4 ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
        {title}
      </p>
      {Array.isArray(items) ? (
        <ul className="mt-2 space-y-1.5">
          {items.map((x) => (
            <li key={x} className="text-[13px] leading-snug">
              {x}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[13px] leading-snug">{items}</p>
      )}
    </div>
  );
}
