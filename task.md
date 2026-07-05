# Execution Checklist — Micro SaaS Validator

- [x] Research 2026 design/animation trends (glassmorphism + Liquid Glass, aurora, dark-default, micro-interactions, progressive disclosure)
- [x] Scaffold Next.js 16 + TS + Tailwind v4; install framer-motion, recharts, supabase-js, openai, jspdf, lucide-react
- [x] Design system (globals.css): glass surfaces, aurora background, buttons, inputs, chips, dark/light themes
- [x] Types + JSON report schema (lib/types.ts, lib/prompts.ts)
- [x] Mock report generator for demo mode (lib/mock.ts)
- [x] Persistence abstraction: Supabase ⇄ localStorage (lib/store.ts, lib/supabase.ts, supabase-schema.sql)
- [x] API routes: /api/validate, /api/chat (OpenAI with demo fallback)
- [x] Landing page (hero, features, pricing, CTA)
- [x] Validate page (form + animated 8-step generation progress)
- [x] Dashboard (score rings, date, status, industry, tags, search, delete)
- [x] Report page — 10 sections (summary, problem scores, customer, competition, TAM/SAM/SOM, pricing, MVP, GTM, risks, verdict w/ big score ring + confetti ≥75)
- [x] Toolkit tab — SWOT, Lean Canvas, Business Model Canvas, 3 personas, RICE table
- [x] Financials tab — 24-month revenue projection chart + break-even calculator (interactive sliders)
- [x] Assets tab — landing page preview, 7-slide pitch deck, investor summary
- [x] AI Chat tab — advisor chat with report context, suggestion chips
- [x] PDF export (jsPDF), dark mode toggle (dark default), Supabase login page
- [x] Render deploy config (render.yaml) + README + .env.example
- [x] Verify: `npm run build` passes (0 errors)
- [x] Verify in browser: full validate→report flow, all 5 tabs, chat round-trip, dashboard card, light/dark toggle, mobile viewport
- [x] Bug fixes found during verification: AnimatePresence exit never completes (React 19 + motion 12) → enter-only keyed animations; mock RNG could go negative → Math.abs

## Feature: Build My Startup
- [x] BuildKit types (blueprint, tasks, code, prompts, pages, launch) on SavedIdea.build
- [x] /api/build — per-section generation (OpenAI w/ demo fallback, array unwrapping for JSON mode)
- [x] Demo generators for all 6 sections (lib/build-mock.ts), templated from idea + report
- [x] Step 1 Blueprint: PRD, user stories, features, SQL schema, user flows, API architecture, auth flow, file tree, tech stack
- [x] Step 2 Task board: 20 tasks across 9 categories, checkbox toggling, per-group counters
- [x] Step 3 Project code: 8 production-ready files with file-tab viewer + copy
- [x] Step 4 AI Builder: 9 self-contained prompts for Cursor/Claude Code/Lovable/Bolt/Replit
- [x] Step 5 Landing & Legal: landing preview, pricing tiers, FAQ, terms, privacy, SEO meta, blog ideas
- [x] Step 6 Launch kit: Product Hunt, X + LinkedIn posts, Reddit strategy, cold emails, waitlist, demo script, investor pitch
- [x] Step 7 Workspace: sidebar nav, build-progress bar, per-section regenerate, persistence (Supabase `build` column / localStorage)
- [x] "Build My Startup" CTA on the report verdict hero (label flips to "Open build workspace")
- [x] Verified: build passes; generate-all flow, all 6 sections, task toggling, reload persistence, regenerate — zero console/server errors

## Feature: Your App (full code) — AI builds the actual product
- [x] ProjectSpec type + AI section "project" (app name, input fields, core prompt, result sections, brand color)
- [x] lib/project-generator.ts — materializes a complete 19-file runnable Next.js app from spec + report
- [x] Generated app: landing (validated copy), pricing + Stripe checkout, core AI workflow (OpenAI w/ demo fallback), dashboard, README, .env.example, optional Supabase schema
- [x] Workspace section "Your App (full code)": app summary card, run command, 19-file browser, Download project (.zip) via jszip
- [x] Verified for real: generated a project, `npm install && npm run build` clean, `npm start` + curl → core API returns structured output, landing serves validated headline
- [x] Verified UI: generate CTA for older kits, generation, file browser, zip click, reload persistence — zero errors

## Feature: Stripe paywall + publish
- [x] Free 3 validations/month (monthly reset), Founder $19/mo / $190/yr; Paywall modal with billing toggle
- [x] /api/stripe/checkout + /api/stripe/verify (server-verified session before Pro activates); /upgrade/success page; Founder chip in navbar; demo unlock when Stripe unconfigured
- [x] Pushed to github.com/zazzyguy8-ai/startup-for90days (render.yaml blueprint ready; user connects in Render dashboard + sets STRIPE_*/OPENAI env vars)

## Feature: Startup Builder (agentic)
- [x] Live preview iframe of the generated startup (lib/preview-generator.ts, srcDoc, desktop/mobile toggle, working demo form)
- [x] Builder bar: natural-language instruction → /api/build revise → spec diff → file-by-file rebuild animation → preview refresh → persisted
- [x] Demo instruction parser (names/colors/taglines, EN+SK); full NL revisions with OPENAI_API_KEY
- [x] Verified live: color change, rename ("Suppo"), tagline change all applied + persisted; zero console errors; production build clean

## Feature: Real verification + realistic pacing
- [x] /api/validate second pass: skeptical AI reviewer (VERIFY_SYSTEM_PROMPT) corrects scores, market sizing, generic advice when OPENAI_API_KEY is set (opt out: OPENAI_VERIFY=0)
- [x] Validate page: personalized 8-stage analysis (~30-35s) — stages derived from the user's idea/audience/competitors, live terminal-style activity log, % progress, elapsed timer; navigation gated on BOTH the API result and the visible sequence
- [x] Build My Startup: per-section live activity feed ("Designing the Postgres schema…") with minimum stage durations (~30s total); regenerate has a 2-3s floor
- [x] Verified live: validation ran 30+s with ticking log and correct redirect; build generation showed per-stage feed and finished into the workspace; zero console/server errors
