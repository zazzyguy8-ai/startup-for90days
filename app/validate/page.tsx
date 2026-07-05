"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lightbulb, Users, Globe, Swords, Sparkles, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Paywall from "@/components/Paywall";
import { newId, saveIdea } from "@/lib/store";
import { deriveIndustry, deriveTags, deriveTitle } from "@/lib/mock";
import {
  FREE_LIMIT,
  canValidate,
  getPlan,
  incrementUsage,
  remainingValidations,
} from "@/lib/billing";
import type { IdeaInput, SavedIdea, ValidationReport } from "@/lib/types";

interface Step {
  title: string;
  subs: string[];
}

// Personalized analysis steps — each sub-activity is shown live while the
// report is being generated and verified server-side.
function buildSteps(input: IdeaInput): Step[] {
  const audience = input.audience || "your target users";
  const competitors = (input.competitors ?? "")
    .split(/[,\n]/)
    .map((c) => c.trim())
    .filter(Boolean);
  const firstWords = input.idea.split(" ").slice(0, 5).join(" ");

  return [
    {
      title: "Analyzing the problem space",
      subs: [
        `Parsing the core promise: “${firstWords}…”`,
        "Separating the problem from the proposed solution",
        `Estimating how often ${audience} hit this problem`,
        "Scoring pain, urgency and frequency independently",
      ],
    },
    {
      title: "Profiling your target customer",
      subs: [
        `Segmenting “${audience}” into buyer profiles`,
        "Mapping who feels the pain vs who holds the budget",
        "Locating where they spend time online",
        "Modeling their typical buying behavior",
      ],
    },
    {
      title: "Scanning the competitive landscape",
      subs: competitors.length
        ? [
            ...competitors
              .slice(0, 3)
              .map((c) => `Evaluating ${c}: strengths, weaknesses, pricing`),
            "Searching for gaps none of them cover",
          ]
        : [
            "Identifying direct and indirect competitors",
            "Checking the “spreadsheet + manual work” alternative",
            "Ranking incumbents by threat level",
            "Searching for gaps in the market",
          ],
    },
    {
      title: "Estimating market size",
      subs: [
        "Sizing the total addressable market (TAM)",
        "Narrowing to the serviceable segment (SAM)",
        "Projecting a realistic obtainable share (SOM)",
        "Cross-checking the numbers against the niche",
      ],
    },
    {
      title: "Modeling pricing & willingness to pay",
      subs: [
        `Benchmarking what ${audience} pay for similar tools`,
        "Pricing against the cost of the manual alternative",
        "Testing freemium vs paid-only economics",
        "Setting monthly and annual price points",
      ],
    },
    {
      title: "Drafting MVP roadmap & go-to-market",
      subs: [
        "Cutting the feature list down to a true MVP",
        "Ordering the build week by week",
        "Planning the path to the first 100 users",
        "Selecting communities and content angles",
      ],
    },
    {
      title: "Stress-testing risks",
      subs: [
        "Listing the ways startups like this usually die",
        "Checking platform and technical dependencies",
        "Weighing distribution risk against product risk",
      ],
    },
    {
      title: "Verifying & scoring the final verdict",
      subs: [
        "Running a skeptical second-pass review",
        "Correcting over-optimistic scores",
        "Making the verdict consistent with the evidence",
        "Compiling the full report",
      ],
    },
  ];
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ValidatePage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [audience, setAudience] = useState("");
  const [website, setWebsite] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [step, setStep] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [quota, setQuota] = useState<{ plan: string; left: number } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuota({ plan: getPlan(), left: remainingValidations() });
  }, [showPaywall]);

  const canSubmit = idea.trim().length >= 12 && audience.trim().length >= 3;

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [log]);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  async function handleValidate() {
    if (!canSubmit || loading) return;
    if (!canValidate()) {
      setShowPaywall(true);
      return;
    }
    const input: IdeaInput = {
      idea: idea.trim(),
      audience: audience.trim(),
      website: website.trim() || undefined,
      competitors: competitors.trim() || undefined,
    };
    const seq = buildSteps(input);
    setSteps(seq);
    setLoading(true);
    setError("");
    setStep(0);
    setLog([]);
    setElapsed(0);

    // The report request and the visible analysis sequence run in parallel;
    // we only move on when BOTH are finished.
    const request = (async () => {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Request failed");
      return (await res.json()) as { report: ValidationReport };
    })();

    const sequence = (async () => {
      for (let i = 0; i < seq.length; i++) {
        setStep(i);
        for (const sub of seq[i].subs) {
          setLog((l) => [...l, sub]);
          await delay(750 + Math.random() * 650);
        }
      }
      setStep(seq.length);
    })();

    try {
      const [{ report }] = await Promise.all([request, sequence]);
      const saved: SavedIdea = {
        id: newId(),
        title: deriveTitle(input),
        input,
        report,
        createdAt: new Date().toISOString(),
        status: "Validated",
        industry: deriveIndustry(report),
        tags: deriveTags(input, report),
      };
      await saveIdea(saved);
      incrementUsage();
      await delay(700);
      router.push(`/idea/${saved.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-32">
        {!loading ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-balance text-4xl font-bold tracking-tight">
              Validate a <span className="text-gradient">startup idea</span>
            </h1>
            <p className="mt-3 text-muted">
              The more specific you are, the sharper the report.
            </p>

            <div className="glass mt-8 space-y-5 rounded-3xl p-6 sm:p-8">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Lightbulb size={15} className="text-accent" /> Startup idea *
                </label>
                <textarea
                  className="input-glass min-h-28 resize-y"
                  placeholder="e.g. An AI tool that turns podcast episodes into ready-to-post LinkedIn carousels for B2B founders…"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Users size={15} className="text-accent" /> Target audience *
                </label>
                <input
                  className="input-glass"
                  placeholder="e.g. B2B founders and marketing leads at seed-stage startups"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Globe size={15} className="text-accent" /> Website{" "}
                    <span className="text-xs text-muted">(optional)</span>
                  </label>
                  <input
                    className="input-glass"
                    placeholder="https://…"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Swords size={15} className="text-accent" /> Competitors{" "}
                    <span className="text-xs text-muted">(optional)</span>
                  </label>
                  <input
                    className="input-glass"
                    placeholder="e.g. Repurpose.io, Descript"
                    value={competitors}
                    onChange={(e) => setCompetitors(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm font-medium text-danger">{error}</p>
              )}

              <button
                onClick={handleValidate}
                disabled={!canSubmit}
                className="btn-primary w-full py-3.5 text-base"
              >
                <Sparkles size={17} /> Validate
              </button>
              <p className="text-center text-xs text-muted">
                Deep analysis takes ~30 seconds · every report is verified in a
                second review pass
                {quota &&
                  (quota.plan === "pro" ? (
                    <span className="ml-1 font-semibold text-accent">
                      · Founder — unlimited
                    </span>
                  ) : (
                    <span className="ml-1">
                      · {quota.left} of {FREE_LIMIT} free left this month
                    </span>
                  ))}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-strong mt-6 rounded-3xl p-6 sm:p-10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-white shadow-xl">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="inline-flex"
                  >
                    <Sparkles size={20} />
                  </motion.span>
                </span>
                <div>
                  <h2 className="font-bold leading-tight">
                    Analyzing your idea
                  </h2>
                  <p className="text-xs text-muted">
                    {Math.min(step + 1, steps.length)} of {steps.length} stages ·{" "}
                    {elapsed}s
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gradient">
                {Math.min(Math.round((step / steps.length) * 100), 99)}%
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--ring-track)">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                animate={{
                  width: `${Math.min((step / steps.length) * 100, 99)}%`,
                }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_1fr]">
              {/* Stage list */}
              <div className="space-y-2.5">
                {steps.map((s, i) => (
                  <div
                    key={s.title}
                    className="flex items-center gap-2.5 text-sm"
                    style={{ opacity: i <= step ? 1 : 0.35 }}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                        i < step
                          ? "bg-success text-white"
                          : i === step
                            ? "shimmer bg-accent/30"
                            : "bg-(--ring-track)"
                      }`}
                    >
                      {i < step && <Check size={11} />}
                    </span>
                    <span className={i <= step ? "" : "text-muted"}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Live activity log */}
              <div
                ref={logRef}
                className="max-h-64 overflow-y-auto rounded-2xl border border-(--card-border) bg-(--ring-track) p-4 font-mono text-[11.5px] leading-relaxed"
              >
                {log.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: i === log.length - 1 ? 1 : 0.55 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-2"
                  >
                    <span className="shrink-0 text-success">
                      {i === log.length - 1 ? "▸" : "✓"}
                    </span>
                    <span>{line}</span>
                  </motion.p>
                ))}
                {log.length > 0 && (
                  <motion.span
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                    className="ml-5 inline-block h-3 w-1.5 bg-accent"
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </main>
      {showPaywall && (
        <Paywall
          onClose={() => setShowPaywall(false)}
          onUnlocked={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
}
