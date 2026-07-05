import type {
  BuildBlueprint,
  BuildLaunch,
  BuildPages,
  BuildSectionId,
  BuildTask,
  BuilderPrompt,
  CodeFile,
  IdeaInput,
  ValidationReport,
} from "./types";
import { mockProjectSpec } from "./project-generator";

// Deterministic demo-mode generators for the Build My Startup kit.
// Everything is templated from the validated idea + report so the output
// reads as bespoke, and regenerating a section is stable.

function slug(input: IdeaInput): string {
  return (
    input.idea
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join("-") || "my-startup"
  );
}

function productName(input: IdeaInput): string {
  const words = input.idea
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const w = words[1] || words[0] || "Launch";
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() + "Kit";
}

export function mockBlueprint(
  input: IdeaInput,
  report: ValidationReport
): BuildBlueprint {
  const name = productName(input);
  const audience = input.audience || "your target users";
  const core = report.mvpRoadmap.coreFeatures;

  return {
    prd: {
      overview: `${name} is a focused micro-SaaS for ${audience}. ${report.ideaSummary} The MVP delivers the single core workflow end-to-end with self-serve onboarding, a ${report.pricing.model.toLowerCase().includes("freemium") ? "freemium" : "trial-based"} subscription at $${report.pricing.monthly}/mo, and instrumentation to measure activation from day one.`,
      goals: [
        "Ship a usable MVP in under 6 weeks",
        "First successful output within 5 minutes of signup (activation)",
        `Convert free users to $${report.pricing.monthly}/mo paid via a usage cap`,
        "Instrument every step of the funnel from day one",
      ],
      nonGoals: [
        "Team collaboration and roles (post-MVP)",
        "Native mobile apps — responsive web only",
        "Integrations and public API (validate demand first)",
        "Multi-language support",
      ],
      successMetrics: [
        "Activation rate ≥ 40% (signup → first successful output)",
        "Week-4 retention ≥ 25%",
        "Free → paid conversion ≥ 5%",
        "Time-to-first-value under 5 minutes",
      ],
    },
    userStories: [
      `As a ${audience.split(",")[0]}, I can sign up with email and reach the core workflow in one click, so I get value before losing interest.`,
      "As a new user, I can run the core workflow with a pre-filled example, so I understand the product without reading docs.",
      "As a user, I can save my results and revisit them from a dashboard, so my work is never lost.",
      "As a user, I can upgrade to a paid plan inside the app when I hit the free usage cap, so upgrading is frictionless.",
      "As a paying user, I can manage my subscription (upgrade, cancel, invoices) via a billing portal, so I never need to email support.",
      "As a user, I receive a welcome email and a day-3 activation nudge, so I return after my first session.",
      "As an admin, I can see signups, activation and conversion metrics, so I know if the product is working.",
    ],
    featureList: [
      ...core.map((f) => ({
        name: f.split(":")[0].slice(0, 60),
        priority: "MVP" as const,
        description: f,
      })),
      ...report.mvpRoadmap.niceToHave.slice(0, 4).map((f) => ({
        name: f.split(":")[0].slice(0, 60),
        priority: "V2" as const,
        description: f,
      })),
    ],
    databaseSchema: `-- ${name} — Supabase schema
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  plan text not null default 'free',            -- free | pro
  stripe_customer_id text,
  usage_count int not null default 0,           -- resets monthly
  usage_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  input jsonb not null,                         -- what the user submitted
  output jsonb,                                 -- generated result
  status text not null default 'draft',         -- draft | complete | failed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null,
  name text not null,                           -- signup, activated, upgraded…
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
create policy "own profile" on public.profiles for all using (auth.uid() = id);
create policy "own projects" on public.projects for all using (auth.uid() = user_id);
create index projects_user_idx on public.projects (user_id, created_at desc);`,
    userFlows: [
      {
        name: "Onboarding → first value",
        steps: [
          "Landing page → 'Start free' CTA",
          "Sign up (email magic link or Google OAuth)",
          "Guided first run with a pre-filled example input",
          "Core workflow executes → result screen with success state",
          "Prompt to save result → dashboard",
        ],
      },
      {
        name: "Free → paid upgrade",
        steps: [
          "User hits monthly usage cap mid-workflow",
          "Inline paywall modal shows plan comparison",
          "Stripe Checkout (card, Apple Pay) — no page rebuild",
          "Webhook flips profile.plan to 'pro'",
          "User is returned to the exact step they left",
        ],
      },
      {
        name: "Returning user",
        steps: [
          "Day-3 activation email → deep link to dashboard",
          "Dashboard lists saved projects with statuses",
          "One-click re-run or duplicate a past project",
        ],
      },
    ],
    apiArchitecture: [
      { method: "POST", path: "/api/generate", description: "Run the core AI workflow; enforces usage cap; returns the generated output." },
      { method: "GET", path: "/api/projects", description: "List the signed-in user's projects (paginated)." },
      { method: "POST", path: "/api/projects", description: "Create/save a project with its input and output." },
      { method: "PATCH", path: "/api/projects/[id]", description: "Rename or update a project." },
      { method: "DELETE", path: "/api/projects/[id]", description: "Delete a project." },
      { method: "POST", path: "/api/stripe/checkout", description: "Create a Stripe Checkout session for the Pro plan." },
      { method: "POST", path: "/api/stripe/portal", description: "Create a Stripe billing-portal session." },
      { method: "POST", path: "/api/stripe/webhook", description: "Handle checkout.session.completed and subscription updates; sync profile.plan." },
      { method: "POST", path: "/api/events", description: "Record a funnel analytics event." },
    ],
    authFlow: [
      "Supabase Auth with email magic link + Google OAuth",
      "On first sign-in, a database trigger inserts a row into public.profiles",
      "Next.js proxy (middleware) refreshes the session cookie via @supabase/ssr on every request",
      "Server components read the user with createServerClient; API routes reject unauthenticated requests with 401",
      "Row-level security means even a leaked anon key can only read the caller's own rows",
      "Stripe customer is created lazily on first checkout and stored on the profile",
    ],
    fileStructure: `${slug(input)}/
├── app/
│   ├── layout.tsx              # fonts, theme, analytics provider
│   ├── page.tsx                # landing page
│   ├── pricing/page.tsx
│   ├── login/page.tsx
│   ├── dashboard/page.tsx      # saved projects grid
│   ├── project/[id]/page.tsx   # single project view
│   └── api/
│       ├── generate/route.ts   # core AI workflow (usage-capped)
│       ├── projects/route.ts
│       ├── projects/[id]/route.ts
│       ├── stripe/checkout/route.ts
│       ├── stripe/portal/route.ts
│       └── stripe/webhook/route.ts
├── components/
│   ├── ui/                     # Button, Card, Input, Modal, Skeleton
│   ├── WorkflowForm.tsx        # the core input form
│   ├── ResultView.tsx          # the core output view
│   ├── Paywall.tsx             # inline upgrade modal
│   └── Navbar.tsx
├── lib/
│   ├── supabase/server.ts      # createServerClient helper
│   ├── supabase/client.ts
│   ├── openai.ts               # model call + prompt templates
│   ├── stripe.ts
│   ├── usage.ts                # cap checks + monthly reset
│   └── events.ts               # analytics helper
├── emails/                     # react-email templates
│   ├── welcome.tsx
│   └── activation-nudge.tsx
├── proxy.ts                    # Supabase session refresh (Next 16 proxy file)
└── supabase/schema.sql`,
    techStack: [
      { layer: "Framework", choice: "Next.js 16 (App Router) + React 19 + TypeScript", why: "One codebase for marketing site, app and API; RSC keeps the client bundle small." },
      { layer: "Styling", choice: "Tailwind CSS v4", why: "Fast iteration, design tokens via CSS variables, no runtime cost." },
      { layer: "Database + Auth", choice: "Supabase (Postgres, RLS, Auth)", why: "Auth, database and storage in one free-tier service; RLS gives per-user security without custom middleware." },
      { layer: "Payments", choice: "Stripe Checkout + Billing Portal", why: "PCI handled for you; portal removes 90% of billing support tickets." },
      { layer: "AI", choice: "OpenAI API (gpt-4o, JSON mode)", why: "Reliable structured output for the core workflow; swap via env var." },
      { layer: "Email", choice: "Resend + react-email", why: "Transactional + lifecycle emails written as React components." },
      { layer: "Hosting", choice: "Vercel (or Render)", why: "Zero-config deploys, preview environments per PR." },
      { layer: "Analytics", choice: "PostHog", why: "Funnels + session replay on the free tier; self-serve activation debugging." },
    ],
  };
}

let taskSeq = 0;
function task(
  category: BuildTask["category"],
  title: string,
  description: string
): BuildTask {
  taskSeq += 1;
  return { id: `t${taskSeq}`, category, title, description, done: false };
}

export function mockTasks(input: IdeaInput, report: ValidationReport): BuildTask[] {
  taskSeq = 0;
  const price = report.pricing.monthly;
  return [
    task("Database", "Create Supabase project + run schema", "Create the project, run supabase/schema.sql (profiles, projects, events + RLS policies), enable email + Google auth providers."),
    task("Database", "Profile auto-creation trigger", "Postgres trigger: on auth.users insert, create matching public.profiles row with plan='free'."),
    task("Authentication", "Wire Supabase Auth in Next.js", "Add @supabase/ssr clients (server + browser), proxy.ts session refresh, and a /login page with magic link + Google OAuth."),
    task("Authentication", "Protect app routes", "Redirect unauthenticated users from /dashboard and /project/* to /login; return 401 from API routes."),
    task("Frontend", "Design system + layout shell", "Tailwind v4 tokens (colors, radii, glass cards), Navbar, dark mode default, responsive layout shell."),
    task("Frontend", "Core workflow form", "WorkflowForm component with validation, pre-filled example for first-time users, loading state with progress steps."),
    task("Frontend", "Result view + save", "ResultView with success state, copy/download actions, and 'Save to dashboard' wired to POST /api/projects."),
    task("Frontend", "Dashboard", "Grid of saved projects (title, date, status), search, delete with confirm, empty state pointing to the workflow."),
    task("API", "POST /api/generate", `Core OpenAI call with JSON mode, usage-cap check (free: 3/mo, pro: unlimited), and event logging.`),
    task("API", "Projects CRUD routes", "GET/POST /api/projects and PATCH/DELETE /api/projects/[id] with RLS-scoped Supabase queries."),
    task("Backend", "Usage metering", "lib/usage.ts — increment usage_count atomically, reset monthly, expose remaining quota to the UI."),
    task("Backend", "Analytics events", "lib/events.ts — record signup, activated, hit_cap, upgraded, churned into public.events."),
    task("Payments", "Stripe products + checkout", `Create Pro product ($${price}/mo, $${price * 10}/yr) in Stripe; POST /api/stripe/checkout creates a Checkout session tied to the profile.`),
    task("Payments", "Stripe webhook + plan sync", "Verify webhook signatures; on checkout.session.completed / customer.subscription.updated|deleted, sync profiles.plan."),
    task("Payments", "Billing portal + paywall", "POST /api/stripe/portal; Paywall modal shown inline when the free cap is hit, preserving the user's work."),
    task("Emails", "Welcome + activation emails", "Resend + react-email: welcome on signup, day-3 activation nudge with a deep link; unsubscribe handling."),
    task("Testing", "Core workflow tests", "Vitest unit tests for usage caps and prompt builders; one Playwright happy-path: signup → generate → save → upgrade (Stripe test mode)."),
    task("Testing", "Webhook tests", "Test plan sync against Stripe CLI fixtures: completed checkout, cancelled subscription, failed payment."),
    task("Deployment", "Deploy + envs", "Deploy to Vercel/Render; set SUPABASE_*, STRIPE_*, OPENAI_API_KEY, RESEND_API_KEY; point Stripe webhook at the prod URL."),
    task("Deployment", "Launch checklist", "Custom domain + SSL, OG images, robots.txt/sitemap, PostHog funnel dashboard, error monitoring (Sentry), uptime ping."),
  ];
}

export function mockCode(input: IdeaInput, report: ValidationReport): CodeFile[] {
  const name = productName(input);
  return [
    {
      path: "lib/supabase/server.ts",
      language: "typescript",
      description: "Server-side Supabase client for RSC and API routes",
      code: `import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) =>
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  );
}

export async function requireUser() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Response("Unauthorized", { status: 401 });
  return { supabase, user: data.user };
}`,
    },
    {
      path: "lib/usage.ts",
      language: "typescript",
      description: "Free-tier usage metering with monthly reset",
      code: `import type { SupabaseClient } from "@supabase/supabase-js";

const FREE_LIMIT = 3;

export async function checkAndConsumeUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, usage_count, usage_reset_at")
    .eq("id", userId)
    .single();
  if (!profile) return { allowed: false, remaining: 0 };
  if (profile.plan === "pro") return { allowed: true, remaining: Infinity };

  // Reset the counter if a month has passed
  const resetAt = new Date(profile.usage_reset_at);
  const monthMs = 30 * 24 * 60 * 60 * 1000;
  let count = profile.usage_count;
  if (Date.now() - resetAt.getTime() > monthMs) {
    count = 0;
    await supabase
      .from("profiles")
      .update({ usage_count: 0, usage_reset_at: new Date().toISOString() })
      .eq("id", userId);
  }

  if (count >= FREE_LIMIT) return { allowed: false, remaining: 0 };
  await supabase
    .from("profiles")
    .update({ usage_count: count + 1 })
    .eq("id", userId);
  return { allowed: true, remaining: FREE_LIMIT - count - 1 };
}`,
    },
    {
      path: "app/api/generate/route.ts",
      language: "typescript",
      description: "Core AI workflow endpoint with usage cap",
      code: `import { NextResponse } from "next/server";
import OpenAI from "openai";
import { requireUser } from "@/lib/supabase/server";
import { checkAndConsumeUsage } from "@/lib/usage";
import { buildWorkflowPrompt, SYSTEM_PROMPT } from "@/lib/openai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { supabase, user } = await requireUser();
  const body = await req.json();

  const usage = await checkAndConsumeUsage(supabase, user.id);
  if (!usage.allowed) {
    return NextResponse.json(
      { error: "limit_reached", upgrade: true },
      { status: 402 }
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildWorkflowPrompt(body) },
    ],
  });

  const output = JSON.parse(completion.choices[0].message.content ?? "{}");
  return NextResponse.json({ output, remaining: usage.remaining });
}`,
    },
    {
      path: "app/api/stripe/checkout/route.ts",
      language: "typescript",
      description: "Stripe Checkout session for the Pro plan",
      code: `import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireUser } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email!,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const origin = req.headers.get("origin") ?? process.env.APP_URL!;
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_PRO!, quantity: 1 }],
    success_url: origin + "/dashboard?upgraded=1",
    cancel_url: origin + "/pricing",
    allow_promotion_codes: true,
  });
  return NextResponse.json({ url: session.url });
}`,
    },
    {
      path: "app/api/stripe/webhook/route.ts",
      language: "typescript",
      description: "Webhook: keep profiles.plan in sync with Stripe",
      code: `import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// Service-role client: webhooks have no user session
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const event = stripe.webhooks.constructEvent(
    await req.text(),
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  async function setPlan(customerId: string, plan: "free" | "pro") {
    await admin
      .from("profiles")
      .update({ plan })
      .eq("stripe_customer_id", customerId);
  }

  switch (event.type) {
    case "checkout.session.completed":
      await setPlan(event.data.object.customer as string, "pro");
      break;
    case "customer.subscription.deleted":
      await setPlan(event.data.object.customer as string, "free");
      break;
    case "customer.subscription.updated": {
      const sub = event.data.object;
      await setPlan(
        sub.customer as string,
        sub.status === "active" || sub.status === "trialing" ? "pro" : "free"
      );
      break;
    }
  }
  return NextResponse.json({ received: true });
}`,
    },
    {
      path: "components/Paywall.tsx",
      language: "tsx",
      description: "Inline upgrade modal shown when the free cap is hit",
      code: `"use client";

import { useState } from "react";

export default function Paywall({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url; // Stripe-hosted checkout
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 dark:bg-zinc-900">
        <h2 className="text-xl font-bold">You've used your 3 free runs</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Upgrade to Pro for unlimited runs — your work is saved and waiting.
        </p>
        <button
          onClick={upgrade}
          disabled={loading}
          className="mt-6 w-full rounded-full bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Upgrade — $${report.pricing.monthly}/mo"}
        </button>
        <button onClick={onClose} className="mt-3 w-full py-2 text-sm text-zinc-500">
          Maybe later
        </button>
      </div>
    </div>
  );
}`.replace("${report.pricing.monthly}", String(report.pricing.monthly)),
    },
    {
      path: "lib/openai.ts",
      language: "typescript",
      description: `Prompt templates for the ${name} core workflow`,
      code: `export const SYSTEM_PROMPT = \`You are the engine behind ${name}, a tool for ${input.audience}. Produce structured, immediately usable output. Respond ONLY with valid JSON matching the requested schema.\`;

export function buildWorkflowPrompt(body: { input: string }): string {
  return \`TASK: ${input.idea.slice(0, 140)}

USER INPUT:
\${body.input}

Return JSON: { "title": string, "result": string, "items": string[] }\`;
}`,
    },
    {
      path: "proxy.ts",
      language: "typescript",
      description: "Session refresh on every request (Next 16 proxy)",
      code: `import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  const { data } = await supabase.auth.getUser();

  const protectedPath = ["/dashboard", "/project"].some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );
  if (protectedPath && !data.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\\\.png$).*)"],
};`,
    },
  ];
}

export function mockPrompts(
  input: IdeaInput,
  report: ValidationReport
): BuilderPrompt[] {
  const name = productName(input);
  const ctx = `CONTEXT: I'm building "${name}" — ${input.idea.slice(0, 200)}. Target users: ${input.audience}. Stack: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase (auth + Postgres with RLS) + Stripe subscriptions + OpenAI API. Design: minimal, premium, Apple-inspired glassmorphism, dark mode default, rounded cards, framer-motion micro-animations.`;

  return [
    {
      title: "Project scaffold + design system",
      category: "Setup",
      prompt: `${ctx}

TASK: Scaffold the project. Create a Next.js 16 app with TypeScript and Tailwind v4. Set up a design system in globals.css using CSS variables (dark default): background, foreground, muted, accent (#6366f1), glass card surfaces (semi-transparent + backdrop-blur). Build reusable components: Button (primary gradient pill + ghost), Card (glass, rounded-3xl), Input, Modal, Skeleton. Add a responsive Navbar with logo, nav links and a dark/light toggle persisted to localStorage. No page content yet — just the shell, tokens and components, each with sensible props and TypeScript types.`,
    },
    {
      title: "Supabase auth + protected routes",
      category: "Authentication",
      prompt: `${ctx}

TASK: Wire up Supabase authentication. Install @supabase/ssr. Create lib/supabase/server.ts (createServerClient with Next cookies) and lib/supabase/client.ts. Add a root proxy.ts that refreshes the session and redirects unauthenticated visitors away from /dashboard and /project/*. Build /login with email magic-link + Google OAuth buttons, loading and error states. Add a requireUser() helper that API routes call to get the user or throw 401. Include the SQL for a trigger that auto-creates a public.profiles row (id, email, plan='free', usage_count=0) when a user signs up.`,
    },
    {
      title: "Database schema + RLS",
      category: "Database",
      prompt: `${ctx}

TASK: Create supabase/schema.sql with three tables: profiles (id → auth.users, email, plan free|pro, stripe_customer_id, usage_count, usage_reset_at), projects (id uuid, user_id, title, input jsonb, output jsonb, status, timestamps) and events (identity id, user_id, name, meta jsonb). Enable row-level security on all tables with policies so users can only access their own rows. Add indexes for the dashboard query (user_id, created_at desc). Explain each policy in a comment.`,
    },
    {
      title: "Core workflow — form + API",
      category: "Core Feature",
      prompt: `${ctx}

TASK: Build the core workflow. Create components/WorkflowForm.tsx: a polished form where the user enters their input (${input.idea.slice(0, 120)}), with validation, a pre-filled example for first-time users, and an animated multi-step loading state. Create POST /api/generate: authenticate, check the free-tier usage cap (3 runs/month, stored on profiles.usage_count with monthly reset), call OpenAI (gpt-4o, JSON mode) with a well-structured prompt, log an 'activated' event on first success, and return the structured result. On 402 responses the UI must open the Paywall modal without losing the user's input.`,
    },
    {
      title: "Result view + projects CRUD",
      category: "Core Feature",
      prompt: `${ctx}

TASK: Build components/ResultView.tsx to render the generated output beautifully (cards, copy buttons, download as file) with a save action. Create /api/projects (GET list newest-first, POST create) and /api/projects/[id] (PATCH rename, DELETE) using the server Supabase client so RLS applies. Build /dashboard: responsive grid of saved projects (title, date, status chip), search box, delete with confirmation, and an empty state that links to the workflow. Add framer-motion staggered entrance animations.`,
    },
    {
      title: "Stripe subscriptions end-to-end",
      category: "Payments",
      prompt: `${ctx}

TASK: Implement payments. POST /api/stripe/checkout: find-or-create the Stripe customer from the profile, create a subscription Checkout session for the Pro plan ($${report.pricing.monthly}/mo, env STRIPE_PRICE_PRO), success back to /dashboard. POST /api/stripe/portal for self-serve billing management. POST /api/stripe/webhook (raw body, signature verified): on checkout.session.completed set plan='pro'; on customer.subscription.deleted set plan='free'; on customer.subscription.updated sync from sub.status. Use a service-role Supabase client in the webhook only. Build components/Paywall.tsx — an inline modal with plan comparison that opens when /api/generate returns 402.`,
    },
    {
      title: "Transactional emails",
      category: "Emails",
      prompt: `${ctx}

TASK: Set up Resend with react-email. Create emails/welcome.tsx (on signup: what the product does, one CTA to run the first workflow) and emails/activation-nudge.tsx (day 3, only if the user never activated: one tip + deep link). Create lib/email.ts with typed send helpers and a Supabase Edge Function (or Vercel cron route) that queries profiles created 3 days ago with no 'activated' event and sends the nudge. Include unsubscribe handling.`,
    },
    {
      title: "Landing + pricing pages",
      category: "Marketing",
      prompt: `${ctx}

TASK: Build the marketing pages. Landing (/): glass hero with headline "${report.landingPage?.headline ?? "…"}", subheadline, product screenshot placeholder, 6 feature cards, social proof strip, FAQ accordion, footer. Pricing (/pricing): Free (3 runs/mo) vs Pro ($${report.pricing.monthly}/mo or $${report.pricing.annual}/yr with 2 months free) with a monthly/annual toggle and feature comparison. Add SEO metadata (title, description, OG tags) via the Next.js metadata API, plus JSON-LD Product schema. Mobile-first, framer-motion scroll animations, CTA buttons wired to /login.`,
    },
    {
      title: "Tests + deployment",
      category: "Quality",
      prompt: `${ctx}

TASK: Add quality gates. Vitest unit tests for lib/usage.ts (cap enforcement, monthly reset, pro bypass) and the prompt builders. One Playwright e2e: sign up (magic link stub) → run workflow with mocked OpenAI → save → hit cap on 4th run → paywall appears. GitHub Actions workflow: typecheck, lint, test on PR. Write a DEPLOY.md covering Vercel setup, all env vars (SUPABASE_*, STRIPE_*, OPENAI_API_KEY, RESEND_API_KEY), Stripe webhook configuration with the CLI for local dev, and a pre-launch checklist.`,
    },
  ];
}

export function mockPages(input: IdeaInput, report: ValidationReport): BuildPages {
  const name = productName(input);
  const lp = report.landingPage;
  return {
    landing: {
      headline: lp.headline,
      subheadline: lp.subheadline,
      bullets: lp.bullets,
      cta: lp.cta,
    },
    pricingTiers: [
      {
        name: "Free",
        price: "$0",
        features: ["3 runs per month", "Core workflow", "Save your work", "Community support"],
      },
      {
        name: "Pro",
        price: `$${report.pricing.monthly}/mo`,
        features: [
          "Unlimited runs",
          "Priority processing",
          "Export & sharing",
          "Email support",
          `Annual: $${report.pricing.annual}/yr (2 months free)`,
        ],
      },
    ],
    faq: [
      { q: `What exactly does ${name} do?`, a: `${name} automates the workflow described in one sentence: ${input.idea.slice(0, 140)}. You put in your raw input, and it returns a finished, usable result in under a minute.` },
      { q: "Who is it for?", a: `Built specifically for ${input.audience} — the defaults, vocabulary and output format match how you already work.` },
      { q: "Is there a free plan?", a: "Yes — 3 runs per month, no credit card required. Upgrade only when it's already saving you time." },
      { q: "Can I cancel anytime?", a: "Yes. Manage or cancel from the in-app billing portal; you keep Pro access until the end of the paid period." },
      { q: "Is my data private?", a: "Your data is stored per-account with row-level security and is never used to train models. Delete your account and everything goes with it." },
      { q: "Do you offer refunds?", a: "If the product didn't work for you in the first 14 days, email us and we'll refund you, no questions asked." },
    ],
    terms: `TERMS OF SERVICE — ${name}

1. Acceptance. By creating an account you agree to these terms.
2. Service. ${name} provides AI-generated output based on your input. Output is provided "as is"; you are responsible for reviewing it before use.
3. Accounts. You must provide accurate information and keep your credentials secure. One person per account.
4. Subscriptions. Paid plans renew automatically (monthly or annual) until cancelled via the billing portal. Price changes are announced 30 days in advance.
5. Acceptable use. No illegal content, no abuse of rate limits, no reselling of raw API access, no attempts to extract other users' data.
6. Intellectual property. You own your inputs and the outputs generated for you. We own the service, brand and software.
7. Liability. Our total liability is limited to the amount you paid in the last 12 months. We are not liable for indirect or consequential damages.
8. Termination. You may delete your account at any time. We may suspend accounts that violate these terms, with notice where practical.
9. Changes. We may update these terms; material changes are notified by email 14 days before taking effect.

Contact: legal@${slug(input)}.com`,
    privacy: `PRIVACY POLICY — ${name}

What we collect: account email, authentication data (via Supabase), the inputs you submit, the outputs we generate, usage events (page views, feature usage) and billing status (via Stripe — we never see card numbers).

Why: to provide the service, meter usage on the free plan, improve the product, and send transactional email (welcome, receipts, activation tips). Marketing email only with consent, one-click unsubscribe.

Processors: Supabase (database & auth), Stripe (payments), OpenAI (processing your inputs to generate outputs — not used for model training), Resend (email), PostHog (analytics), our hosting provider.

Your data is never sold. Inputs and outputs are private to your account and protected by row-level security.

Retention: while your account is active. Deleting your account permanently removes your data within 30 days (backups excluded, purged on rotation).

Your rights: access, export, correction, deletion — email privacy@${slug(input)}.com. EU/UK users: processing is based on contract (service delivery) and legitimate interest (product analytics).

Cookies: essential session cookies only; analytics is cookieless.`,
    seo: {
      title: `${name} — ${lp.headline}`,
      description: `${lp.subheadline} Free plan available — no credit card required.`,
      keywords: [
        name.toLowerCase(),
        ...input.idea.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 4).slice(0, 6),
        input.audience.toLowerCase().split(" ").slice(0, 3).join(" "),
        "saas", "ai tool",
      ],
      ogTitle: `${name} — ${lp.cta}`,
      ogDescription: lp.subheadline,
    },
    blogIdeas: [
      `The real cost of doing this manually: a time audit for ${input.audience}`,
      `How we built ${name} in 6 weeks with Next.js and Supabase (build-in-public post)`,
      `${report.competition.competitors[0]?.name ?? "The incumbent"} vs ${name}: an honest comparison`,
      `7 mistakes ${input.audience} make with this workflow (and how to avoid them)`,
      "From 0 to 100 users: everything that worked and everything that didn't",
      `The complete ${new Date().getFullYear()} guide to this workflow (pillar SEO post)`,
      "Why we chose boring technology (and you should too)",
      `Customer story: how one ${input.audience.split(",")[0]} saved 6 hours a week`,
    ],
  };
}

export function mockLaunch(input: IdeaInput, report: ValidationReport): BuildLaunch {
  const name = productName(input);
  const audience = input.audience;
  const price = report.pricing.monthly;
  return {
    productHunt: {
      name,
      tagline: report.landingPage.headline.slice(0, 60),
      description: `${name} is the fastest way for ${audience} to get this job done. ${report.ideaSummary.split(".")[0]}. Free plan, no credit card — you'll have your first result in under 5 minutes.`,
      firstComment: `Hey Product Hunt! 👋

I built ${name} because ${audience} kept telling me the same thing: this workflow eats hours every single week and the existing tools are either bloated or generic.

${name} does one thing extremely well: ${input.idea.slice(0, 150)}

What's inside today:
• The core workflow, end-to-end, in under a minute
• Save and revisit everything from a clean dashboard
• Free plan (3 runs/mo) — Pro is $${price}/mo

I'll be here all day answering questions. Brutal feedback welcome — it's how this product got built. 🙏`,
    },
    xPosts: [
      `I spent the last 6 weeks building ${name}.\n\nIt does one thing: ${input.idea.slice(0, 120)}\n\nFree plan, no credit card. Link below 👇`,
      `${audience}: how many hours did this workflow cost you last week?\n\nWe measured it. The average is 6+.\n\n${name} does it in under a minute. First 3 runs are free.`,
      `Day 1 of launching ${name} in public.\n\nSignups: 0 → let's see where this goes.\n\nBuilding for ${audience}. Follow along, I'll share every number.`,
      `Unpopular opinion: most tools for ${audience} are built by people who never did the job.\n\n${name} is opinionated on purpose. No setup. No config. Input → result.`,
      `We just crossed our first paying customers 🎉\n\nWhat worked: posting in niche communities + 1:1 onboarding calls.\nWhat didn't: paid ads (burned $200, got 0 signups).\n\nFull breakdown in the thread 🧵`,
    ],
    linkedinPosts: [
      `After talking to dozens of ${audience}, one problem kept coming up.\n\n${report.problemScore.pain.explanation.split(".")[0]}.\n\nSo I built ${name} — it turns that entire workflow into a one-minute task.\n\nWe just opened the free plan (3 runs/month, no card). If you're in this space, I'd genuinely value your feedback — link in the comments.`,
      `Lesson from building ${name}:\n\nWe almost built 12 features. We shipped 4.\n\nActivation went UP when we removed options. The best product decisions are deletions.\n\nIf you're a founder building for ${audience}, happy to share what we learned — DMs open.`,
      `Milestone: ${name} is live. 🚀\n\nThe premise is simple: ${input.idea.slice(0, 140)}\n\nFor ${audience}, that's hours back every week.\n\nTry it free — link in comments. And if you know someone drowning in this workflow, a share means the world.`,
    ],
    redditStrategy: [
      { subreddit: "r/SaaS", angle: "Build-in-public retrospective: '6 weeks from idea to launch — full stack, numbers, and mistakes'. Value first, product mentioned once at the end." },
      { subreddit: "r/Entrepreneur", angle: "Problem-first discussion: 'How do you currently handle [the workflow]?' Engage genuinely, mention the tool only when asked." },
      { subreddit: "r/indiehackers", angle: "Transparent revenue + activation numbers post at day 30. Indie hackers reward honesty over polish." },
      { subreddit: "niche community for " + audience.split(",")[0], angle: "Free value post: a genuinely useful guide/template for the workflow, with the tool as a soft P.S. Follow the sub's self-promo rules strictly." },
    ],
    coldEmails: [
      {
        subject: `quick question about your ${input.idea.split(" ").slice(0, 3).join(" ").toLowerCase()} workflow`,
        body: `Hi {{firstName}},

Saw {{specificSignal — their post/review/job listing}} and figured you deal with this workflow more than most.

I built a small tool (${name}) that does it end-to-end in about a minute — built specifically for ${audience}.

Would it be useful if I ran {{their specific case}} through it and sent you the result? Free, no strings — I'm collecting feedback from exactly your kind of team.

{{yourName}}`,
      },
      {
        subject: "I did the work for you (seriously)",
        body: `Hi {{firstName}},

Instead of a pitch, I just did it: {{link to a result generated for their business}}.

That took ${name} 40 seconds. It's built for ${audience} and the first 3 runs are free.

If it's useful, great. If not, the result above is yours to keep either way.

{{yourName}}

P.S. Reply "how" and I'll show you exactly how it was generated.`,
      },
    ],
    waitlistPage: {
      headline: `${name} is coming — join the first 100`,
      subheadline: `The fastest way for ${audience} to get this done. Early members get 50% off Pro for a year and a direct line to the founder.`,
      cta: "Join the waitlist",
    },
    demoScript: [
      "0:00 — Cold open on the pain: show the manual workflow (spreadsheet/tabs chaos) for 5 seconds. 'This used to take me 2 hours.'",
      `0:10 — One sentence: '${name} does it in under a minute.' Cut to the app.`,
      "0:15 — Paste a real input, click the button. Let the progress animation play — don't cut it, it builds anticipation.",
      "0:30 — The result appears. Scroll it slowly. Call out the 2 most impressive parts.",
      "0:50 — Save to dashboard, show a previous project — 'everything is saved automatically.'",
      `1:00 — Pricing in one line: 'Free for 3 runs a month, $${price} for unlimited.'`,
      "1:05 — CTA: 'Link's below — your first result is 5 minutes away.' End card with logo + URL.",
    ],
    investorPitch: report.investorSummary,
  };
}

export function mockBuildSection(
  section: BuildSectionId,
  input: IdeaInput,
  report: ValidationReport
): unknown {
  switch (section) {
    case "blueprint":
      return mockBlueprint(input, report);
    case "tasks":
      return mockTasks(input, report);
    case "project":
      return mockProjectSpec(input.idea, input.audience, report);
    case "code":
      return mockCode(input, report);
    case "prompts":
      return mockPrompts(input, report);
    case "pages":
      return mockPages(input, report);
    case "launch":
      return mockLaunch(input, report);
  }
}
