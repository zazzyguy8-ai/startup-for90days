"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Hammer,
  FileText,
  KanbanSquare,
  Code2,
  Bot,
  Globe,
  Rocket,
  RefreshCw,
  Check,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getIdea, saveBuild } from "@/lib/store";
import type {
  BuildKit,
  BuildSectionId,
  BuildTask,
  SavedIdea,
} from "@/lib/types";
import BlueprintView from "./sections/BlueprintView";
import TaskBoard from "./sections/TaskBoard";
import FullProjectView from "./sections/FullProjectView";
import CodeView from "./sections/CodeView";
import PromptsView from "./sections/PromptsView";
import PagesView from "./sections/PagesView";
import LaunchView from "./sections/LaunchView";
import { generateProjectFiles } from "@/lib/project-generator";
import type { ProjectSpec } from "@/lib/types";
import { FolderGit2 } from "lucide-react";

const SECTIONS: {
  id: BuildSectionId;
  label: string;
  step: string;
  icon: typeof FileText;
  desc: string;
}[] = [
  { id: "blueprint", label: "Product Blueprint", step: "Step 1", icon: FileText, desc: "PRD, user stories, schema, API, auth, file structure" },
  { id: "tasks", label: "Development Tasks", step: "Step 2", icon: KanbanSquare, desc: "Complete task board across the whole stack" },
  { id: "project", label: "Startup Builder", step: "Step 3", icon: FolderGit2, desc: "Your app, built live — preview, reshape, download" },
  { id: "code", label: "Upgrade Modules", step: "Step 4", icon: Code2, desc: "Auth, usage metering, Stripe webhooks for scale" },
  { id: "prompts", label: "AI Builder", step: "Step 5", icon: Bot, desc: "Copy-paste prompts for Cursor, Claude Code, Lovable…" },
  { id: "pages", label: "Landing & Legal", step: "Step 6", icon: Globe, desc: "Landing, pricing, FAQ, terms, privacy, SEO, blog" },
  { id: "launch", label: "Launch Kit", step: "Step 7", icon: Rocket, desc: "Product Hunt, social posts, cold email, demo script" },
];

// What the AI CTO is "doing" while each section generates — shown live.
const SECTION_ACTIVITY: Record<BuildSectionId, string[]> = {
  blueprint: [
    "Writing the PRD: overview, goals, success metrics…",
    "Deriving user stories from the target customer profile…",
    "Designing the Postgres schema with row-level security…",
    "Mapping user flows and the API surface…",
    "Choosing the tech stack layer by layer…",
  ],
  tasks: [
    "Breaking the build into concrete engineering tasks…",
    "Ordering tasks: database → auth → core → payments…",
    "Estimating scope for each category…",
    "Adding testing and deployment checklists…",
  ],
  project: [
    "Designing your product's core workflow and inputs…",
    "Writing the production AI prompt of your app…",
    "Generating the full codebase: landing, pricing, app, dashboard…",
    "Wiring the OpenAI endpoint with a demo fallback…",
    "Connecting Stripe checkout and the README…",
  ],
  code: [
    "Writing the Supabase server client and auth guard…",
    "Implementing usage metering with monthly resets…",
    "Building the Stripe webhook with plan sync…",
    "Adding the paywall component…",
  ],
  prompts: [
    "Splitting the project into AI-tool-sized tasks…",
    "Embedding product context into every prompt…",
    "Adding acceptance criteria per task…",
  ],
  pages: [
    "Writing landing and pricing copy from the report…",
    "Drafting the FAQ from real objections…",
    "Generating Terms of Service and Privacy Policy…",
    "Compiling SEO metadata and blog angles…",
  ],
  launch: [
    "Writing the Product Hunt listing and first comment…",
    "Drafting X and LinkedIn launch posts…",
    "Planning the Reddit strategy per subreddit…",
    "Writing cold email sequences and the demo script…",
  ],
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateSection(
  section: BuildSectionId,
  idea: SavedIdea
): Promise<unknown> {
  const res = await fetch("/api/build", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section, input: idea.input, report: idea.report }),
  });
  if (!res.ok) throw new Error(`Failed to generate ${section}`);
  const { data } = await res.json();
  return data;
}

export default function BuildClient({ id }: { id: string }) {
  const [idea, setIdea] = useState<SavedIdea | null | undefined>(undefined);
  const [active, setActive] = useState<BuildSectionId>("blueprint");
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(-1);
  const [activity, setActivity] = useState("");
  const [regenerating, setRegenerating] = useState<BuildSectionId | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getIdea(id).then((i) => setIdea(i));
  }, [id]);

  const kit = idea?.build ?? null;

  const taskProgress = useMemo(() => {
    if (!kit) return { done: 0, total: 0, pct: 0 };
    const done = kit.tasks.filter((t) => t.done).length;
    return {
      done,
      total: kit.tasks.length,
      pct: kit.tasks.length ? Math.round((done / kit.tasks.length) * 100) : 0,
    };
  }, [kit]);

  async function persist(next: BuildKit) {
    if (!idea) return;
    const updated = { ...idea, build: next };
    setIdea(updated);
    await saveBuild(idea.id, next);
  }

  async function generateAll() {
    if (!idea || generating) return;
    setGenerating(true);
    setError("");
    try {
      const parts: Partial<Record<BuildSectionId, unknown>> = {};
      for (let i = 0; i < SECTIONS.length; i++) {
        setGenStep(i);
        const id = SECTIONS[i].id;
        // Fetch and the visible activity feed run in parallel; each stage
        // finishes only when both the work and its narration are done.
        const feed = (async () => {
          for (const line of SECTION_ACTIVITY[id]) {
            setActivity(line);
            await delay(850 + Math.random() * 600);
          }
        })();
        const [data] = await Promise.all([generateSection(id, idea), feed]);
        parts[id] = data;
      }
      const spec = parts.project as ProjectSpec;
      const next: BuildKit = {
        blueprint: parts.blueprint as BuildKit["blueprint"],
        tasks: parts.tasks as BuildKit["tasks"],
        project: { spec, files: generateProjectFiles(spec, idea.report) },
        code: parts.code as BuildKit["code"],
        prompts: parts.prompts as BuildKit["prompts"],
        pages: parts.pages as BuildKit["pages"],
        launch: parts.launch as BuildKit["launch"],
        generatedAt: new Date().toISOString(),
      };
      await persist(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
      setGenStep(-1);
    }
  }

  async function regenerate(section: BuildSectionId) {
    if (!idea || !kit || regenerating) return;
    setRegenerating(section);
    setError("");
    try {
      const [data] = await Promise.all([
        generateSection(section, idea),
        delay(2200 + Math.random() * 1200),
      ]);
      const value =
        section === "project"
          ? {
              spec: data as ProjectSpec,
              files: generateProjectFiles(data as ProjectSpec, idea.report),
            }
          : data;
      await persist({
        ...kit,
        [section]: value,
        generatedAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      setRegenerating(null);
    }
  }

  async function toggleTask(taskId: string) {
    if (!kit) return;
    const tasks: BuildTask[] = kit.tasks.map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    await persist({ ...kit, tasks });
  }

  if (idea === undefined) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pt-32">
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
          <Link href="/dashboard" className="btn-primary mt-6 inline-flex px-6 py-3">
            Back to dashboard
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28">
        <Link
          href={`/idea/${idea.id}`}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} /> Back to report
        </Link>

        {!kit ? (
          /* -------- Intro / generation screen -------- */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong mx-auto max-w-3xl rounded-3xl p-8 text-center sm:p-12"
          >
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-white shadow-xl">
              {generating ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={26} />
                </motion.span>
              ) : (
                <Hammer size={26} />
              )}
            </span>
            <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Build <span className="text-gradient">{idea.title}</span>
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-muted">
              Your AI CTO turns this validated idea into a launch-ready MVP
              package: blueprint, task board, production code, AI-builder
              prompts, marketing pages and a full launch kit.
            </p>

            <div className="mx-auto mt-8 grid max-w-xl gap-2.5 text-left">
              {SECTIONS.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{
                    opacity: generating ? (i <= genStep ? 1 : 0.35) : 1,
                    x: 0,
                  }}
                  transition={{ duration: 0.4, delay: generating ? 0 : i * 0.06 }}
                  className="flex items-center gap-3 rounded-2xl border border-(--card-border) px-4 py-3"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      generating && i < genStep
                        ? "bg-success text-white"
                        : generating && i === genStep
                          ? "shimmer bg-accent/25 text-accent"
                          : "bg-gradient-to-br from-accent to-accent-2 text-white"
                    }`}
                  >
                    {generating && i < genStep ? (
                      <Check size={15} />
                    ) : (
                      <s.icon size={15} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-semibold">
                      <span className="text-muted">{s.step} · </span>
                      {s.label}
                    </p>
                    {generating && i === genStep ? (
                      <motion.p
                        key={activity}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="truncate font-mono text-xs text-accent"
                      >
                        ▸ {activity}
                      </motion.p>
                    ) : (
                      <p className="truncate text-xs text-muted">{s.desc}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {error && <p className="mt-5 text-sm font-medium text-danger">{error}</p>}

            <button
              onClick={generateAll}
              disabled={generating}
              className="btn-primary mt-8 px-8 py-3.5 text-base"
            >
              <Hammer size={17} />
              {generating
                ? `Generating ${SECTIONS[Math.max(genStep, 0)].label}…`
                : "Build My Startup"}
            </button>
            {!generating && (
              <p className="mt-3 text-xs text-muted">
                Takes ~30 seconds · everything is saved to this workspace
              </p>
            )}
          </motion.div>
        ) : (
          /* -------- Workspace -------- */
          <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass rounded-3xl p-4"
              >
                <div className="px-2 pb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">
                    Workspace
                  </p>
                  <h1 className="mt-1 line-clamp-2 font-bold leading-snug">
                    {idea.title}
                  </h1>
                  <div className="mt-3">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-muted">Build progress</span>
                      <span className="font-bold text-accent">
                        {taskProgress.pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-(--ring-track)">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                        animate={{ width: `${taskProgress.pct}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      {taskProgress.done} of {taskProgress.total} tasks done
                    </p>
                  </div>
                </div>
                <nav className="flex gap-1 overflow-x-auto lg:flex-col">
                  {SECTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActive(s.id)}
                      className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors lg:w-full ${
                        active === s.id
                          ? "bg-gradient-to-r from-accent to-accent-2 text-white"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      <s.icon size={15} className="shrink-0" />
                      <span className="whitespace-nowrap lg:whitespace-normal">
                        {s.label}
                      </span>
                    </button>
                  ))}
                </nav>
              </motion.div>
            </aside>

            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">
                    {SECTIONS.find((s) => s.id === active)?.step}
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {SECTIONS.find((s) => s.id === active)?.label}
                  </h2>
                </div>
                <button
                  onClick={() => regenerate(active)}
                  disabled={regenerating !== null}
                  className="btn-ghost px-4 py-2 text-sm"
                >
                  <motion.span
                    animate={regenerating === active ? { rotate: 360 } : {}}
                    transition={{
                      duration: 1,
                      repeat: regenerating === active ? Infinity : 0,
                      ease: "linear",
                    }}
                    className="inline-flex"
                  >
                    <RefreshCw size={14} />
                  </motion.span>
                  {regenerating === active ? "Regenerating…" : "Regenerate"}
                </button>
              </div>

              {error && (
                <p className="mb-4 text-sm font-medium text-danger">{error}</p>
              )}

              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {active === "blueprint" && <BlueprintView data={kit.blueprint} />}
                {active === "tasks" && (
                  <TaskBoard tasks={kit.tasks} onToggle={toggleTask} />
                )}
                {active === "project" && (
                  <FullProjectView
                    idea={idea}
                    project={kit.project}
                    onSave={async (p) => {
                      await persist({ ...kit, project: p });
                    }}
                    onGenerate={() => regenerate("project")}
                    generating={regenerating === "project"}
                  />
                )}
                {active === "code" && <CodeView files={kit.code} />}
                {active === "prompts" && <PromptsView prompts={kit.prompts} />}
                {active === "pages" && <PagesView data={kit.pages} />}
                {active === "launch" && <LaunchView data={kit.launch} />}
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
