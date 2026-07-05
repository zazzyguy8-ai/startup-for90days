"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FileCode2,
  Download,
  FolderGit2,
  Terminal,
  Hammer,
  Send,
  Monitor,
  Smartphone,
  Sparkles,
  Check,
} from "lucide-react";
import type { BuildProject, SavedIdea } from "@/lib/types";
import { generateProjectFiles } from "@/lib/project-generator";
import { generatePreviewHtml } from "@/lib/preview-generator";
import { CodeBlock, CopyButton } from "../ui";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SUGGESTIONS = [
  "Make the brand color green",
  "Rename it to something catchier",
  'Change the tagline to: "…"',
];

export default function FullProjectView({
  idea,
  project,
  onSave,
  onGenerate,
  generating,
}: {
  idea: SavedIdea;
  project: BuildProject | null | undefined;
  onSave: (p: BuildProject) => Promise<void>;
  onGenerate: () => void;
  generating: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const [zipping, setZipping] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [building, setBuilding] = useState(false);
  const [agentLog, setAgentLog] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(Infinity);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  const previewHtml = useMemo(
    () => (project ? generatePreviewHtml(project.spec, idea.report) : ""),
    [project, idea.report, previewKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function pushLog(line: string) {
    setAgentLog((l) => [...l, line]);
    setTimeout(
      () =>
        logRef.current?.scrollTo({
          top: logRef.current.scrollHeight,
          behavior: "smooth",
        }),
      30
    );
  }

  async function runBuild() {
    const text = instruction.trim();
    if (!text || !project || building) return;
    setBuilding(true);
    setAgentLog([]);
    pushLog(`Instruction: “${text}”`);
    pushLog("Thinking about how to apply it…");

    try {
      const res = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "revise",
          input: idea.input,
          report: idea.report,
          spec: project.spec,
          instruction: text,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Build failed");
      const { data } = (await res.json()) as {
        data: { spec: BuildProject["spec"]; changes: string[] };
      };

      for (const c of data.changes) pushLog(`✦ ${c}`);
      await delay(500);
      pushLog("Rebuilding the codebase…");

      const files = generateProjectFiles(data.spec, idea.report);
      setVisibleCount(0);
      for (let i = 0; i < files.length; i++) {
        setVisibleCount(i + 1);
        setSelected(i);
        pushLog(`Writing ${files[i].path}`);
        await delay(140 + Math.random() * 220);
      }

      await onSave({ spec: data.spec, files });
      setPreviewKey((k) => k + 1);
      setSelected(0);
      setVisibleCount(Infinity);
      setInstruction("");
      pushLog("✓ Done — preview refreshed.");
    } catch (e) {
      pushLog(
        `✗ ${e instanceof Error ? e.message : "Something went wrong"} — try again.`
      );
      setVisibleCount(Infinity);
    } finally {
      setBuilding(false);
    }
  }

  async function downloadZip() {
    if (!project || zipping) return;
    setZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const root = project.spec.appName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      for (const f of project.files) zip.file(`${root}/${f.path}`, f.code);
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${root}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setZipping(false);
    }
  }

  if (!project) {
    return (
      <div className="glass rounded-3xl p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-white">
          <FolderGit2 size={24} />
        </span>
        <h3 className="mt-5 text-xl font-bold">
          Your app hasn&apos;t been built yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          The AI builder will design your product, generate the complete
          codebase and show it to you live — then you can reshape it with plain
          English instructions.
        </p>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="btn-primary mt-6 px-6 py-3"
        >
          <Hammer size={16} />
          {generating ? "Building your app…" : "Build my app"}
        </button>
      </div>
    );
  }

  const { spec, files } = project;
  const shownFiles =
    visibleCount === Infinity ? files : files.slice(0, visibleCount);
  const file = shownFiles[Math.min(selected, Math.max(shownFiles.length - 1, 0))];

  return (
    <div className="space-y-5">
      {/* Live preview */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong overflow-hidden rounded-3xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--card-border) px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ background: spec.accentColor }}
            >
              {spec.appName.charAt(0)}
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">
                {spec.appName}{" "}
                <span className="font-normal text-muted">— live preview</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-(--card-border) p-0.5">
              <button
                onClick={() => setDevice("desktop")}
                aria-label="Desktop preview"
                className={`rounded-full p-1.5 ${device === "desktop" ? "bg-accent text-white" : "text-muted"}`}
              >
                <Monitor size={13} />
              </button>
              <button
                onClick={() => setDevice("mobile")}
                aria-label="Mobile preview"
                className={`rounded-full p-1.5 ${device === "mobile" ? "bg-accent text-white" : "text-muted"}`}
              >
                <Smartphone size={13} />
              </button>
            </div>
            <button
              onClick={downloadZip}
              disabled={zipping}
              className="btn-primary px-4 py-2 text-xs"
            >
              <Download size={13} />
              {zipping ? "Packaging…" : "Download (.zip)"}
            </button>
          </div>
        </div>
        <div className="flex justify-center bg-black/20 p-3">
          <iframe
            key={previewKey}
            srcDoc={previewHtml}
            sandbox="allow-scripts"
            title={`${spec.appName} preview`}
            className="h-[430px] rounded-xl border border-(--card-border) bg-black transition-all duration-500"
            style={{ width: device === "mobile" ? 375 : "100%" }}
          />
        </div>
      </motion.div>

      {/* Builder bar */}
      <div className="glass rounded-3xl p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Sparkles size={15} className="text-accent" />
          Tell the builder what to change
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runBuild();
          }}
          className="mt-3 flex gap-2"
        >
          <input
            className="input-glass flex-1"
            placeholder='e.g. "Rename it to TicketWiz and make it green"'
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={building}
          />
          <button
            type="submit"
            disabled={!instruction.trim() || building}
            className="btn-primary h-12 shrink-0 px-5"
          >
            {building ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="inline-flex"
              >
                <Hammer size={16} />
              </motion.span>
            ) : (
              <Send size={16} />
            )}
            <span className="hidden sm:inline">
              {building ? "Building…" : "Build"}
            </span>
          </button>
        </form>
        {agentLog.length === 0 && !building && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setInstruction(s)}
                className="chip text-muted transition-colors hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {agentLog.length > 0 && (
          <div
            ref={logRef}
            className="mt-4 max-h-40 overflow-y-auto rounded-2xl border border-(--card-border) bg-(--ring-track) p-4 font-mono text-[11.5px] leading-relaxed"
          >
            {agentLog.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: i === agentLog.length - 1 ? 1 : 0.55, x: 0 }}
                className="flex gap-2"
              >
                <span className="shrink-0 text-success">
                  {i === agentLog.length - 1 && building ? "▸" : <Check size={11} className="mt-0.5 inline" />}
                </span>
                <span>{line}</span>
              </motion.p>
            ))}
          </div>
        )}
      </div>

      {/* Run command + file browser */}
      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-(--card-border) bg-(--ring-track) px-4 py-3">
          <p className="flex items-center gap-2 font-mono text-[13px]">
            <Terminal size={14} className="shrink-0 text-accent" />
            <span className="truncate">unzip → npm install → npm run dev</span>
          </p>
          <CopyButton text={"npm install && npm run dev"} label="Copy" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[250px_1fr]">
          <nav className="flex gap-1.5 overflow-x-auto lg:max-h-[30rem] lg:flex-col lg:overflow-y-auto">
            {shownFiles.map((f, i) => (
              <motion.button
                key={f.path}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelected(i)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left font-mono text-xs transition-colors lg:w-full ${
                  i === selected
                    ? "bg-gradient-to-r from-accent to-accent-2 text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <FileCode2 size={13} className="shrink-0" />
                <span className="truncate">{f.path}</span>
              </motion.button>
            ))}
          </nav>
          <div className="min-w-0">
            {file && (
              <>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="text-sm text-muted">{file.description}</p>
                  <CopyButton text={file.code} label="Copy file" />
                </div>
                <CodeBlock code={file.code} title={file.path} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
