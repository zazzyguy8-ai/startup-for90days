"use client";

import { Bot } from "lucide-react";
import type { BuilderPrompt } from "@/lib/types";
import { CopyButton } from "../ui";

export default function PromptsView({ prompts }: { prompts: BuilderPrompt[] }) {
  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 text-sm text-muted sm:p-6">
        <p>
          <Bot size={15} className="mr-1.5 inline text-accent" />
          Each prompt below is self-contained — paste it into{" "}
          <span className="font-semibold text-foreground">
            Cursor, Claude Code, Lovable, Bolt or Replit
          </span>{" "}
          and the AI has everything it needs (product context, stack, design
          language, acceptance criteria). Work top to bottom.
        </p>
      </div>
      {prompts.map((p, i) => (
        <div key={p.title} className="glass rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="font-bold leading-tight">{p.title}</h3>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {p.category}
                </span>
              </div>
            </div>
            <CopyButton text={p.prompt} label="Copy prompt" />
          </div>
          <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-(--card-border) bg-(--ring-track) p-4 text-[13px] leading-relaxed">
            {p.prompt}
          </pre>
        </div>
      ))}
    </div>
  );
}
