"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { BuildTask, TaskCategory } from "@/lib/types";

const CATEGORY_ORDER: TaskCategory[] = [
  "Database",
  "Authentication",
  "Frontend",
  "Backend",
  "API",
  "Payments",
  "Emails",
  "Testing",
  "Deployment",
];

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  Frontend: "var(--accent)",
  Backend: "var(--accent-2)",
  Database: "var(--accent-3)",
  API: "#0ea5e9",
  Authentication: "#f97316",
  Payments: "var(--success)",
  Emails: "#ec4899",
  Testing: "var(--warning)",
  Deployment: "#14b8a6",
};

export default function TaskBoard({
  tasks,
  onToggle,
}: {
  tasks: BuildTask[];
  onToggle: (id: string) => void;
}) {
  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: tasks.filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const done = group.items.filter((t) => t.done).length;
        const color = CATEGORY_COLORS[group.cat];
        return (
          <section key={group.cat} className="glass rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: color }}
                />
                {group.cat}
              </h3>
              <span className="text-xs font-semibold text-muted">
                {done}/{group.items.length}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {group.items.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onToggle(t.id)}
                  className="group flex w-full items-start gap-3 rounded-2xl border border-(--card-border) p-3.5 text-left transition-colors hover:border-accent/40"
                >
                  <motion.span
                    animate={
                      t.done
                        ? { scale: [1, 1.25, 1] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.3 }}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      t.done
                        ? "border-transparent bg-success text-white"
                        : "border-(--card-border) group-hover:border-accent/50"
                    }`}
                  >
                    {t.done && <Check size={13} />}
                  </motion.span>
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-semibold ${
                        t.done ? "text-muted line-through" : ""
                      }`}
                    >
                      {t.title}
                    </span>
                    <span
                      className={`block text-[13px] leading-snug ${
                        t.done ? "text-muted/60" : "text-muted"
                      }`}
                    >
                      {t.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
