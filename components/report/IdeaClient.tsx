"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileDown,
  FileText,
  Wrench,
  LineChart,
  Palette,
  MessageSquare,
  Hammer,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ScoreRing, { scoreColor } from "@/components/ScoreRing";
import ReportView from "./ReportView";
import Toolkit from "./Toolkit";
import Financials from "./Financials";
import Assets from "./Assets";
import ChatPanel from "./ChatPanel";
import Confetti from "./Confetti";
import { getIdea, updateIdeaStatus } from "@/lib/store";
import { exportReportPdf } from "@/lib/pdf";
import type { IdeaStatus, SavedIdea } from "@/lib/types";

const TABS = [
  { id: "report", label: "Report", icon: FileText },
  { id: "toolkit", label: "Toolkit", icon: Wrench },
  { id: "financials", label: "Financials", icon: LineChart },
  { id: "assets", label: "Assets", icon: Palette },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
] as const;

type TabId = (typeof TABS)[number]["id"];

const STATUSES: IdeaStatus[] = ["Validated", "In Progress", "Building", "Parked"];

export default function IdeaClient({ id }: { id: string }) {
  const [idea, setIdea] = useState<SavedIdea | null | undefined>(undefined);
  const [tab, setTab] = useState<TabId>("report");

  useEffect(() => {
    getIdea(id).then((i) => setIdea(i));
  }, [id]);

  if (idea === undefined) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 pt-40">
          <div className="glass shimmer h-64 rounded-3xl" />
        </main>
      </div>
    );
  }

  if (idea === null) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-xl px-4 pt-40 text-center">
          <h1 className="text-3xl font-bold">Idea not found</h1>
          <p className="mt-3 text-muted">
            It may have been deleted, or it lives in a different browser.
          </p>
          <Link href="/dashboard" className="btn-primary mt-6 inline-flex px-6 py-3">
            Back to dashboard
          </Link>
        </main>
      </div>
    );
  }

  const v = idea.report.verdict;
  const verdictColor = scoreColor(v.score);

  return (
    <div className="min-h-screen">
      <Navbar />
      {v.score >= 75 && <Confetti />}
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-28">
        <Link
          href="/dashboard"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} /> Dashboard
        </Link>

        {/* Verdict hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong rounded-3xl p-7 sm:p-10"
        >
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
            <div className="min-w-0 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">
                AI Verdict
              </p>
              <h1 className="mt-1.5 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                {idea.title}
              </h1>
              <span
                className="chip mt-3 text-sm"
                style={{
                  color: verdictColor,
                  borderColor: `color-mix(in srgb, ${verdictColor} 45%, transparent)`,
                  background: `color-mix(in srgb, ${verdictColor} 8%, transparent)`,
                }}
              >
                {v.label}
              </span>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
                {v.explanation}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Link
                  href={`/idea/${idea.id}/build`}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  <Hammer size={15} />
                  {idea.build ? "Open build workspace" : "Build My Startup"}
                </Link>
                <select
                  value={idea.status}
                  onChange={async (e) => {
                    const status = e.target.value as IdeaStatus;
                    setIdea({ ...idea, status });
                    await updateIdeaStatus(idea.id, status);
                  }}
                  className="input-glass !w-auto !rounded-full !py-2 text-sm"
                  aria-label="Idea status"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => exportReportPdf(idea)}
                  className="btn-ghost px-4 py-2 text-sm"
                >
                  <FileDown size={15} /> Export PDF
                </button>
              </div>
            </div>
            <ScoreRing score={v.score} size={190} label="/ 100" />
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="sticky top-20 z-40 mt-6">
          <div className="glass flex gap-1 overflow-x-auto rounded-2xl p-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  tab === t.id ? "text-white" : "text-muted hover:text-foreground"
                }`}
              >
                {tab === t.id && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent to-accent-2"
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <t.icon size={14} />
                  <span className="hidden sm:inline">{t.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === "report" && <ReportView idea={idea} />}
            {tab === "toolkit" && <Toolkit idea={idea} />}
            {tab === "financials" && <Financials idea={idea} />}
            {tab === "assets" && <Assets idea={idea} />}
            {tab === "chat" && <ChatPanel idea={idea} />}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
