"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileCode2,
  Download,
  FolderGit2,
  Terminal,
  Palette,
  Hammer,
} from "lucide-react";
import type { BuildProject } from "@/lib/types";
import { CodeBlock, CopyButton } from "../ui";

export default function FullProjectView({
  project,
  onGenerate,
  generating,
}: {
  project: BuildProject | null | undefined;
  onGenerate: () => void;
  generating: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const [zipping, setZipping] = useState(false);

  async function downloadZip() {
    if (!project || zipping) return;
    setZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const root = project.spec.appName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      for (const f of project.files) {
        zip.file(`${root}/${f.path}`, f.code);
      }
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
          Your app hasn&apos;t been generated yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          The AI CTO will design your product&apos;s core workflow and generate
          the complete, runnable codebase — landing page, pricing with Stripe,
          the AI feature itself, and a dashboard.
        </p>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="btn-primary mt-6 px-6 py-3"
        >
          <Hammer size={16} />
          {generating ? "Building your app…" : "Generate my app"}
        </button>
      </div>
    );
  }

  const { spec, files } = project;
  const file = files[Math.min(selected, files.length - 1)];

  return (
    <div className="space-y-5">
      {/* App summary + download */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong rounded-3xl p-6 sm:p-8"
      >
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold text-white"
                style={{ background: spec.accentColor }}
              >
                {spec.appName.charAt(0)}
              </span>
              <div>
                <h3 className="text-xl font-bold leading-tight">
                  {spec.appName}
                </h3>
                <p className="text-sm text-muted">{spec.tagline}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="chip text-muted">
                {files.length} files · complete app
              </span>
              <span className="chip text-muted">
                <Palette size={11} style={{ color: spec.accentColor }} />
                {spec.accentColor}
              </span>
              <span className="chip text-muted">
                Runs with zero config
              </span>
            </div>
          </div>
          <button
            onClick={downloadZip}
            disabled={zipping}
            className="btn-primary shrink-0 px-6 py-3"
          >
            <Download size={16} />
            {zipping ? "Packaging…" : "Download project (.zip)"}
          </button>
        </div>
        <div className="mt-5 rounded-2xl border border-(--card-border) bg-(--ring-track) p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-mono text-[13px]">
              <Terminal size={14} className="shrink-0 text-accent" />
              <span className="truncate">
                unzip → npm install → npm run dev
              </span>
            </p>
            <CopyButton text={"npm install && npm run dev"} label="Copy" />
          </div>
          <p className="mt-2 text-xs text-muted">
            The app runs immediately — no API keys needed. Add{" "}
            <code className="font-mono">OPENAI_API_KEY</code> for real AI output
            and <code className="font-mono">STRIPE_*</code> keys for live
            payments (see the generated README).
          </p>
        </div>
      </motion.div>

      {/* File browser */}
      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[250px_1fr]">
          <nav className="flex gap-1.5 overflow-x-auto lg:max-h-[32rem] lg:flex-col lg:overflow-y-auto">
            {files.map((f, i) => (
              <button
                key={f.path}
                onClick={() => setSelected(i)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left font-mono text-xs transition-colors lg:w-full ${
                  i === selected
                    ? "bg-gradient-to-r from-accent to-accent-2 text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <FileCode2 size={13} className="shrink-0" />
                <span className="truncate">{f.path}</span>
              </button>
            ))}
          </nav>
          <div className="min-w-0">
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="text-sm text-muted">{file.description}</p>
              <CopyButton text={file.code} label="Copy file" />
            </div>
            <CodeBlock code={file.code} title={file.path} />
          </div>
        </div>
      </div>
    </div>
  );
}
