# Micro SaaS Validator

AI-powered startup idea validation for founders. Enter an idea + target audience and get an investor-grade report: problem scores, target customer, competition, TAM/SAM/SOM, pricing, MVP roadmap, go-to-market, risks and a 0–100 verdict — plus SWOT, Lean Canvas, Business Model Canvas, personas, RICE prioritization, revenue projections, break-even calculator, pitch deck, landing page copy, AI advisor chat and PDF export.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Recharts · Supabase · OpenAI · jsPDF

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Works instantly with **zero configuration** — without API keys the app runs in **demo mode** (deterministic mock AI reports + localStorage persistence, with a "Demo mode" badge in the nav).

## Enable real AI + accounts (optional)

Copy `.env.example` to `.env.local` and fill in:

| Variable | Effect |
|---|---|
| `OPENAI_API_KEY` | Real AI validation reports + advisor chat |
| `OPENAI_MODEL` | Defaults to `gpt-4o` |
| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Real accounts (`/login`) + ideas saved to Postgres |

For Supabase: create a project at supabase.com, run [supabase-schema.sql](supabase-schema.sql) in the SQL editor (creates the `ideas` table with row-level security), then paste the project URL and anon key.

## Deploy to Render (startup-for90days.onrender.com)

The repo includes [render.yaml](render.yaml) as a Blueprint:

1. Push this folder to a GitHub repo:
   ```bash
   git init && git add -A && git commit -m "Micro SaaS Validator"
   gh repo create startup-for90days --private --source . --push
   ```
2. In the [Render dashboard](https://dashboard.render.com): **New → Blueprint**, pick the repo. Render reads `render.yaml` and creates the web service named `startup-for90days` (→ https://startup-for90days.onrender.com).
3. In the service's **Environment** tab, set `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or leave empty to ship in demo mode).

> Note: if a service already occupies the `startup-for90days` name/URL on your account, delete it first or rename — Render subdomains are first-come.

## Project map

- `app/page.tsx` — landing (aurora + glass hero, features, pricing)
- `app/validate/page.tsx` — idea form + animated generation progress
- `app/dashboard/page.tsx` — saved ideas grid (score ring, status, industry, tags, search)
- `app/idea/[id]` — report with 5 tabs: Report / Toolkit / Financials / Assets / AI Chat
- `app/idea/[id]/build` — **Build My Startup** workspace: AI-CTO blueprint (PRD, schema, API, auth, file tree), 20-task dev board with progress tracking, **the complete runnable codebase of the user's startup** (AI designs the product spec, the generator materializes a 19-file Next.js app — landing, pricing + Stripe, the core AI workflow, dashboard — downloadable as ZIP, runs with `npm install && npm run dev`), upgrade modules, copy-paste prompts for AI coding tools, landing/pricing/FAQ/legal/SEO pages, and a full launch kit — each section regenerable, saved per idea
- `app/api/validate` + `app/api/chat` — OpenAI endpoints with automatic demo-mode fallback
- `lib/store.ts` — persistence abstraction (Supabase when signed in, localStorage otherwise)
- `lib/mock.ts` — deterministic demo report generator
- `lib/pdf.ts` — full-report PDF export (jsPDF)
