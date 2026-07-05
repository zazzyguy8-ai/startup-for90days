# Implementation Plan — Micro SaaS Validator

## Research-driven design decisions (2026 trends)
- **Glassmorphism with depth hierarchy** (Apple Liquid Glass style) on cards, nav, modals — not decoration, but layering.
- **Dark mode as default**, light mode toggle.
- **Aurora gradient background** (animated, subtle) behind glass surfaces.
- **Purposeful micro-interactions**: button hover/press states, animated score ring, staggered card entrances, progress steps during AI generation, confetti/celebration on high verdict.
- **Progressive disclosure**: big verdict score first, sections drill down below.
- **5–9 core dashboard elements**, not chart soup.

## Stack
Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Recharts · Supabase (auth + DB) · OpenAI API · jsPDF (export) · lucide-react (icons)

## Graceful demo mode
No env keys present at build time → app runs fully with a deterministic mock AI generator + localStorage persistence and a "Demo mode" badge. With `OPENAI_API_KEY` / Supabase env vars set, real AI + real auth/DB kick in. This makes the app previewable and deployable to Render immediately.

## Files
- `[NEW]` app/layout.tsx, app/page.tsx (landing), app/globals.css
- `[NEW]` app/login/page.tsx (Supabase auth + demo continue)
- `[NEW]` app/dashboard/page.tsx (idea grid: score, date, status, industry, tags)
- `[NEW]` app/validate/page.tsx (input form + generation progress)
- `[NEW]` app/idea/[id]/page.tsx (report: 10 sections + tools tabs + chat)
- `[NEW]` app/api/validate/route.ts, app/api/chat/route.ts (OpenAI w/ mock fallback)
- `[NEW]` lib/types.ts, lib/mock.ts, lib/store.ts (localStorage/Supabase abstraction), lib/supabase.ts, lib/prompts.ts
- `[NEW]` components/* (ScoreRing, GlassCard, Aurora, Navbar, ThemeToggle, charts, SWOT, LeanCanvas, BMC, RICE table, RevenueChart, BreakEven, Personas, PitchDeck, LandingPreview, ChatPanel, ExportPDF)
- `[NEW]` render.yaml + README (Render deploy config for startup-for90days.onrender.com)
- `[NEW]` supabase-schema.sql (ideas table + RLS)

## Verification
`npm run build` must pass; preview server checked via preview tools (snapshot, console, screenshot).
