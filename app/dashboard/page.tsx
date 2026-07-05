"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Trash2, Calendar, Factory, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { scoreColor } from "@/components/ScoreRing";
import { deleteIdea, listIdeas } from "@/lib/store";
import type { SavedIdea } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  Validated: "var(--success)",
  "In Progress": "var(--accent)",
  Building: "var(--accent-2)",
  Parked: "var(--warning)",
};

function MiniRing({ score }: { score: number }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg width={64} height={64} className="-rotate-90">
        <circle cx={32} cy={32} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={5} />
        <motion.circle
          cx={32}
          cy={32}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-sm font-bold"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [ideas, setIdeas] = useState<SavedIdea[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listIdeas().then(setIdeas);
  }, []);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this idea and its report?")) return;
    await deleteIdea(id);
    setIdeas((prev) => prev?.filter((i) => i.id !== id) ?? null);
  }

  const filtered = (ideas ?? []).filter(
    (i) =>
      !query ||
      (i.title + i.industry + i.tags.join(" "))
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-32">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Your ideas</h1>
            <p className="mt-2 text-muted">
              {ideas === null
                ? "Loading…"
                : `${ideas.length} validated ${ideas.length === 1 ? "idea" : "ideas"}`}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              className="input-glass !pl-10"
              placeholder="Search ideas, tags, industry…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {ideas !== null && ideas.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mt-12 rounded-3xl p-14 text-center"
          >
            <h2 className="text-2xl font-bold">No ideas yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-muted">
              Validate your first startup idea and it will show up here with its
              score, status and full report.
            </p>
            <Link href="/validate" className="btn-primary mt-6 inline-flex px-6 py-3">
              <Plus size={16} /> Validate your first idea
            </Link>
          </motion.div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((idea, i) => (
              <motion.div
                key={idea.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link
                  href={`/idea/${idea.id}`}
                  className="glass glass-hover group block rounded-3xl p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <MiniRing score={idea.report.verdict.score} />
                    <button
                      onClick={(e) => handleDelete(e, idea.id)}
                      aria-label="Delete idea"
                      className="rounded-full p-2 text-muted opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <h3 className="mt-3 line-clamp-2 font-semibold leading-snug">
                    {idea.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(idea.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Factory size={11} />
                      {idea.industry}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span
                      className="chip"
                      style={{
                        color: STATUS_COLORS[idea.status] ?? "var(--muted)",
                        borderColor: `color-mix(in srgb, ${
                          STATUS_COLORS[idea.status] ?? "var(--muted)"
                        } 40%, transparent)`,
                      }}
                    >
                      {idea.status}
                    </span>
                    {idea.tags.map((t) => (
                      <span key={t} className="chip text-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
        </div>
      </main>
    </div>
  );
}
