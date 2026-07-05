import type { CodeFile, ProjectSpec, ValidationReport } from "./types";

// Generates the COMPLETE, runnable codebase of the user's startup from an
// AI-designed ProjectSpec. Every file is real: `npm install && npm run dev`
// works with zero config (the generated app has its own demo-mode fallback),
// and adding OPENAI_API_KEY / STRIPE_* env vars activates the real services.

function kebab(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "my-startup"
  );
}

export function generateProjectFiles(
  spec: ProjectSpec,
  report: ValidationReport
): CodeFile[] {
  const name = spec.appName;
  const pkg = kebab(name);
  const price = report.pricing.monthly;
  const annual = report.pricing.annual;
  const fieldsJson = JSON.stringify(spec.inputFields, null, 2);
  const exampleJson = JSON.stringify(spec.exampleInput, null, 2);
  const sectionsJson = JSON.stringify(spec.resultSections, null, 2);

  return [
    {
      path: "package.json",
      language: "json" as const,
      description: "Dependencies and scripts",
      code: `{
  "name": "${pkg}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.3.0",
    "openai": "^4.90.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "stripe": "^17.7.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.1.0",
    "typescript": "^5.8.0"
  }
}`,
    },
    {
      path: "tsconfig.json",
      language: "json",
      description: "TypeScript configuration",
      code: `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
    },
    {
      path: "next.config.ts",
      language: "typescript",
      description: "Next.js configuration",
      code: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;`,
    },
    {
      path: "postcss.config.mjs",
      language: "javascript",
      description: "Tailwind CSS v4 via PostCSS",
      code: `const config = {
  plugins: { "@tailwindcss/postcss": {} },
};

export default config;`,
    },
    {
      path: ".gitignore",
      language: "text",
      description: "Git ignore rules",
      code: `node_modules
.next
.env*.local
.DS_Store
*.tsbuildinfo
next-env.d.ts`,
    },
    {
      path: ".env.example",
      language: "text",
      description: "All env vars are optional — the app runs without them",
      code: `# Optional — without this the app returns realistic demo output
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o

# Optional — enables the Pro checkout ($${price}/mo)
STRIPE_SECRET_KEY=
STRIPE_PRICE_PRO=
NEXT_PUBLIC_APP_URL=http://localhost:3000`,
    },
    {
      path: "app/globals.css",
      language: "css",
      description: "Design system — dark, premium, glass",
      code: `@import "tailwindcss";

:root {
  --bg: #07080d;
  --fg: #eef0f6;
  --muted: #9aa1b5;
  --card: rgba(255, 255, 255, 0.05);
  --border: rgba(255, 255, 255, 0.09);
  --accent: ${spec.accentColor};
}

body {
  background: var(--bg);
  color: var(--fg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.glass {
  background: var(--card);
  border: 1px solid var(--border);
  backdrop-filter: blur(24px);
  border-radius: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
  color: white;
  background: var(--accent);
  padding: 0.8rem 1.75rem;
  transition: transform 0.2s ease, filter 0.2s ease;
}
.btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
.btn:disabled { opacity: 0.5; pointer-events: none; }

.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-weight: 500;
  border: 1px solid var(--border);
  padding: 0.8rem 1.75rem;
  transition: border-color 0.2s ease;
}
.btn-ghost:hover { border-color: var(--accent); }

.input {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid var(--border);
  background: var(--card);
  padding: 0.85rem 1.1rem;
  color: var(--fg);
  outline: none;
  transition: border-color 0.2s ease;
}
.input:focus { border-color: var(--accent); }
.input::placeholder { color: var(--muted); opacity: 0.7; }

.text-muted { color: var(--muted); }
.text-accent { color: var(--accent); }`,
    },
    {
      path: "app/layout.tsx",
      language: "tsx",
      description: "Root layout with SEO metadata",
      code: `import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "${name} — ${spec.tagline.replace(/"/g, '\\"')}",
  description: "${spec.description.replace(/"/g, '\\"')}",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}`,
    },
    {
      path: "components/Navbar.tsx",
      language: "tsx",
      description: "Top navigation",
      code: `import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav className="glass mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="font-bold tracking-tight">
          ${name}
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/pricing" className="btn-ghost px-4 py-2 text-sm">
            Pricing
          </Link>
          <Link href="/dashboard" className="btn-ghost px-4 py-2 text-sm">
            Dashboard
          </Link>
          <Link href="/app" className="btn px-4 py-2 text-sm">
            Open app
          </Link>
        </div>
      </nav>
    </header>
  );
}`,
    },
    {
      path: "app/page.tsx",
      language: "tsx",
      description: "Landing page with the validated copy",
      code: `import Link from "next/link";

const BULLETS = ${JSON.stringify(report.landingPage.bullets, null, 2)};

export default function Landing() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-40 text-center">
      <p className="text-sm font-semibold text-accent">
        ${report.landingPage.socialProof.replace(/`/g, "'")}
      </p>
      <h1 className="mx-auto mt-4 max-w-2xl text-5xl font-bold tracking-tight sm:text-6xl">
        ${report.landingPage.headline.replace(/`/g, "'")}
      </h1>
      <p className="text-muted mx-auto mt-6 max-w-xl text-lg">
        ${report.landingPage.subheadline.replace(/`/g, "'")}
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/app" className="btn text-base">
          ${report.landingPage.cta.replace(/`/g, "'")}
        </Link>
        <Link href="/pricing" className="btn-ghost text-base">
          See pricing
        </Link>
      </div>
      <div className="mx-auto mt-16 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
        {BULLETS.map((b) => (
          <div key={b} className="glass p-5">
            <p className="text-sm leading-relaxed">✓ {b}</p>
          </div>
        ))}
      </div>
    </main>
  );
}`,
    },
    {
      path: "app/pricing/page.tsx",
      language: "tsx",
      description: "Pricing page wired to Stripe checkout",
      code: `"use client";

import { useState } from "react";

const FREE = ["3 ${spec.resultNoun}s per month", "Core features", "Saved history"];
const PRO = [
  "Unlimited ${spec.resultNoun}s",
  "Priority processing",
  "Export & sharing",
  "Email support",
];

export default function Pricing() {
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert(data.error ?? "Checkout is not configured yet.");
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-40">
      <h1 className="text-center text-4xl font-bold tracking-tight">
        Simple pricing
      </h1>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        <div className="glass p-8">
          <h2 className="font-semibold">Free</h2>
          <p className="mt-2 text-4xl font-bold">$0</p>
          <ul className="text-muted mt-6 space-y-2 text-sm">
            {FREE.map((f) => (
              <li key={f}>✓ {f}</li>
            ))}
          </ul>
          <a href="/app" className="btn-ghost mt-8 w-full text-sm">
            Start free
          </a>
        </div>
        <div className="glass border-[var(--accent)] p-8">
          <h2 className="font-semibold">Pro</h2>
          <p className="mt-2 text-4xl font-bold">
            $${price}
            <span className="text-muted text-base font-normal">/mo</span>
          </p>
          <p className="text-muted mt-1 text-xs">or $${annual}/yr — 2 months free</p>
          <ul className="text-muted mt-6 space-y-2 text-sm">
            {PRO.map((f) => (
              <li key={f}>✓ {f}</li>
            ))}
          </ul>
          <button onClick={upgrade} disabled={loading} className="btn mt-8 w-full text-sm">
            {loading ? "Redirecting…" : "Upgrade to Pro"}
          </button>
        </div>
      </div>
    </main>
  );
}`,
    },
    {
      path: "lib/config.ts",
      language: "typescript",
      description: "The core workflow definition — fields, prompt, sections",
      code: `// The product's core workflow, designed by the AI CTO.

export const APP_NAME = ${JSON.stringify(name)};
export const RESULT_NOUN = ${JSON.stringify(spec.resultNoun)};

export interface Field {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea";
}

export const INPUT_FIELDS: Field[] = ${fieldsJson};

export const EXAMPLE_INPUT: Record<string, string> = ${exampleJson};

export const RESULT_SECTIONS: string[] = ${sectionsJson};

// {{fieldId}} placeholders are replaced with the user's input.
export const CORE_PROMPT = ${JSON.stringify(spec.corePrompt)};`,
    },
    {
      path: "lib/storage.ts",
      language: "typescript",
      description: "Client-side persistence for saved results",
      code: `"use client";

export interface SavedResult {
  id: string;
  title: string;
  input: Record<string, string>;
  sections: { heading: string; items: string[] }[];
  createdAt: string;
}

const KEY = "${pkg}_results";

export function listResults(): SavedResult[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveResult(r: SavedResult) {
  const all = listResults().filter((x) => x.id !== r.id);
  all.unshift(r);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteResult(id: string) {
  localStorage.setItem(
    KEY,
    JSON.stringify(listResults().filter((x) => x.id !== id))
  );
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}`,
    },
    {
      path: "app/api/generate/route.ts",
      language: "typescript",
      description: "The core AI endpoint — OpenAI with a demo fallback",
      code: `import { NextResponse } from "next/server";
import OpenAI from "openai";
import { CORE_PROMPT, RESULT_SECTIONS } from "@/lib/config";

export const maxDuration = 60;

interface ResultPayload {
  title: string;
  sections: { heading: string; items: string[] }[];
}

function demoResult(input: Record<string, string>): ResultPayload {
  const first = Object.values(input)[0] ?? "your input";
  return {
    title: first.slice(0, 60),
    sections: RESULT_SECTIONS.map((heading) => ({
      heading,
      items: [
        \`Demo output for "\${heading}" based on: \${first.slice(0, 80)}\`,
        "Add an OPENAI_API_KEY in .env.local to unlock real AI output.",
        "Everything else — saving, dashboard, upgrade flow — already works.",
      ],
    })),
  };
}

export async function POST(req: Request) {
  let input: Record<string, string>;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ result: demoResult(input), demo: true });
  }

  try {
    let prompt = CORE_PROMPT;
    for (const [k, v] of Object.entries(input)) {
      prompt = prompt.replaceAll(\`{{\${k}}}\`, v);
    }
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are the engine behind this product. Respond ONLY with JSON: { \\"title\\": string, \\"sections\\": [{ \\"heading\\": string, \\"items\\": string[] }] } using exactly these section headings: " +
            RESULT_SECTIONS.join(", "),
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });
    const result = JSON.parse(
      completion.choices[0]?.message?.content ?? "{}"
    ) as ResultPayload;
    return NextResponse.json({ result, demo: false });
  } catch (err) {
    console.error("Generation failed, using demo output:", err);
    return NextResponse.json({ result: demoResult(input), demo: true });
  }
}`,
    },
    {
      path: "app/api/checkout/route.ts",
      language: "typescript",
      description: "Stripe checkout — activates when env vars are set",
      code: `import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  const key = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_PRO;
  if (!key || !priceId) {
    return NextResponse.json(
      {
        error:
          "Payments not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_PRO in .env.local (see README).",
      },
      { status: 501 }
    );
  }
  const stripe = new Stripe(key);
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: origin + "/dashboard?upgraded=1",
    cancel_url: origin + "/pricing",
    allow_promotion_codes: true,
  });
  return NextResponse.json({ url: session.url });
}`,
    },
    {
      path: "app/app/page.tsx",
      language: "tsx",
      description: "The core product — input form → AI result → save",
      code: `"use client";

import { useState } from "react";
import {
  EXAMPLE_INPUT,
  INPUT_FIELDS,
  RESULT_NOUN,
} from "@/lib/config";
import { newId, saveResult, type SavedResult } from "@/lib/storage";

type Result = SavedResult["sections"];

export default function App() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ title: string; sections: Result } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = INPUT_FIELDS.every((f) => (values[f.id] ?? "").trim());

  async function generate() {
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function save() {
    if (!result) return;
    saveResult({
      id: newId(),
      title: result.title,
      input: values,
      sections: result.sections,
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-32">
      <h1 className="text-3xl font-bold tracking-tight">
        New {RESULT_NOUN}
      </h1>
      <div className="glass mt-6 space-y-4 p-6">
        {INPUT_FIELDS.map((f) => (
          <div key={f.id}>
            <label className="mb-1.5 block text-sm font-medium">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea
                className="input min-h-24"
                placeholder={f.placeholder}
                value={values[f.id] ?? ""}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
              />
            ) : (
              <input
                className="input"
                placeholder={f.placeholder}
                value={values[f.id] ?? ""}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
              />
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <button onClick={generate} disabled={!canSubmit || loading} className="btn flex-1">
            {loading ? "Generating…" : "Generate"}
          </button>
          <button
            onClick={() => setValues(EXAMPLE_INPUT)}
            className="btn-ghost text-sm"
          >
            Try an example
          </button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {result && (
        <div className="glass mt-6 p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold">{result.title}</h2>
            <button onClick={save} className="btn-ghost px-4 py-2 text-sm">
              {saved ? "Saved ✓" : "Save"}
            </button>
          </div>
          <div className="mt-4 space-y-5">
            {result.sections.map((s) => (
              <div key={s.heading}>
                <h3 className="text-accent text-sm font-bold uppercase tracking-wider">
                  {s.heading}
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {s.items.map((item) => (
                    <li key={item} className="text-sm leading-relaxed">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}`,
    },
    {
      path: "app/dashboard/page.tsx",
      language: "tsx",
      description: "Saved results dashboard",
      code: `"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteResult,
  listResults,
  type SavedResult,
} from "@/lib/storage";
import { RESULT_NOUN } from "@/lib/config";

export default function Dashboard() {
  const [results, setResults] = useState<SavedResult[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    setResults(listResults());
  }, []);

  function remove(id: string) {
    deleteResult(id);
    setResults(listResults());
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-32">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your {RESULT_NOUN}s</h1>
        <Link href="/app" className="btn px-4 py-2 text-sm">
          + New
        </Link>
      </div>
      {results !== null && results.length === 0 && (
        <div className="glass mt-8 p-12 text-center">
          <p className="text-muted">
            Nothing saved yet — generate your first {RESULT_NOUN}.
          </p>
          <Link href="/app" className="btn mt-5 inline-flex text-sm">
            Open the app
          </Link>
        </div>
      )}
      <div className="mt-6 space-y-3">
        {(results ?? []).map((r) => (
          <div key={r.id} className="glass p-5">
            <div className="flex items-start justify-between gap-3">
              <button onClick={() => setOpen(open === r.id ? null : r.id)} className="text-left">
                <h2 className="font-semibold">{r.title}</h2>
                <p className="text-muted mt-0.5 text-xs">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </button>
              <button
                onClick={() => remove(r.id)}
                className="text-muted text-xs hover:text-red-400"
              >
                Delete
              </button>
            </div>
            {open === r.id && (
              <div className="mt-4 space-y-4 border-t border-[var(--border)] pt-4">
                {r.sections.map((s) => (
                  <div key={s.heading}>
                    <h3 className="text-accent text-xs font-bold uppercase tracking-wider">
                      {s.heading}
                    </h3>
                    <ul className="mt-1.5 space-y-1">
                      {s.items.map((item) => (
                        <li key={item} className="text-sm">• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}`,
    },
    {
      path: "supabase/schema.sql",
      language: "sql",
      description: "Optional: cloud persistence upgrade path",
      code: `-- OPTIONAL upgrade: move persistence from localStorage to Supabase.
-- 1. Create a project at supabase.com and run this file in the SQL editor.
-- 2. npm install @supabase/supabase-js
-- 3. Swap lib/storage.ts for Supabase queries (each function maps 1:1).

create table public.results (
  id text primary key,
  user_id uuid references auth.users (id) on delete cascade,
  title text not null,
  input jsonb not null,
  sections jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.results enable row level security;
create policy "own results" on public.results
  for all using (auth.uid() = user_id);
create index results_user_idx on public.results (user_id, created_at desc);`,
    },
    {
      path: "README.md",
      language: "markdown",
      description: "How to run, configure and deploy",
      code: `# ${name}

${spec.description}

Generated by **Micro SaaS Validator — Build My Startup**. This is a complete, working product: landing page, pricing, the core AI workflow, and a dashboard.

## Run it

\`\`\`bash
npm install
npm run dev   # http://localhost:3000
\`\`\`

Works immediately with **zero configuration** — without an OpenAI key the core workflow returns demo output so you can click through the whole product.

## Go live (all optional)

Copy \`.env.example\` to \`.env.local\`:

| Variable | Effect |
|---|---|
| \`OPENAI_API_KEY\` | Real AI output from the core workflow |
| \`STRIPE_SECRET_KEY\` + \`STRIPE_PRICE_PRO\` | Live Pro checkout ($${price}/mo — create the product in the Stripe dashboard) |

## What's inside

- \`app/page.tsx\` — landing page (copy pre-written from your validation report)
- \`app/pricing/page.tsx\` — Free vs Pro ($${price}/mo), wired to Stripe checkout
- \`app/app/page.tsx\` — the core product: form → AI → structured result → save
- \`app/dashboard/page.tsx\` — saved results
- \`lib/config.ts\` — **your product's DNA**: input fields, the core AI prompt, result sections. Tweak this file to evolve the product without touching components.
- \`supabase/schema.sql\` — optional upgrade path to accounts + cloud storage

## Deploy

Push to GitHub and import into [Vercel](https://vercel.com/new) (zero config), or any Node host: \`npm run build && npm start\`.
`,
    },
  ];
}

// Demo-mode ProjectSpec derived from the idea + report.
export function mockProjectSpec(
  ideaText: string,
  audience: string,
  report: ValidationReport
): ProjectSpec {
  const words = ideaText
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const base = words[1] || words[0] || "Launch";
  const appName =
    base.charAt(0).toUpperCase() + base.slice(1).toLowerCase() + "Kit";

  return {
    appName,
    tagline: report.landingPage.headline.slice(0, 70),
    description: report.landingPage.subheadline,
    accentColor: "#6366f1",
    resultNoun: "result",
    inputFields: [
      {
        id: "goal",
        label: "What do you need?",
        placeholder: `Describe what you want ${appName} to produce…`,
        type: "textarea",
      },
      {
        id: "context",
        label: "Context",
        placeholder: `Anything specific about your situation (audience: ${audience})`,
        type: "text",
      },
    ],
    exampleInput: {
      goal: `Example: ${ideaText.slice(0, 120)}`,
      context: audience,
    },
    corePrompt: `You are the engine behind ${appName}, a product for ${audience}. The product promise: ${ideaText.slice(0, 200)}

USER REQUEST:
{{goal}}

CONTEXT:
{{context}}

Produce a complete, immediately usable result organized into the required sections. Be specific and practical — no filler.`,
    resultSections: ["Summary", "The Result", "Next Steps"],
  };
}
