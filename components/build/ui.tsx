"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Clipboard API unavailable (non-secure context) — fall back
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="btn-ghost shrink-0 px-3 py-1.5 text-xs"
    >
      {copied ? (
        <>
          <Check size={13} className="text-success" /> Copied
        </>
      ) : (
        <>
          <Copy size={13} /> {label ?? "Copy"}
        </>
      )}
    </button>
  );
}

export function CodeBlock({
  code,
  title,
}: {
  code: string;
  title?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-(--card-border)">
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-(--card-border) bg-(--ring-track) px-4 py-2">
          <span className="truncate font-mono text-xs text-muted">{title}</span>
          <CopyButton text={code} />
        </div>
      )}
      <pre className="max-h-96 overflow-auto p-4 font-mono text-[12px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
