"use client";

import { useState } from "react";
import { FileCode2 } from "lucide-react";
import type { CodeFile } from "@/lib/types";
import { CodeBlock, CopyButton } from "../ui";

export default function CodeView({ files }: { files: CodeFile[] }) {
  const [selected, setSelected] = useState(0);
  const file = files[selected];

  return (
    <div className="glass rounded-3xl p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <nav className="flex gap-1.5 overflow-x-auto lg:flex-col">
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
  );
}
