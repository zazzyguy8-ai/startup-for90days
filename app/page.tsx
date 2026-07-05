"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  TrendingUp,
  DollarSign,
  Map,
  Rocket,
  ShieldAlert,
  Gauge,
  MessageSquare,
  FileDown,
  ArrowRight,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ScoreRing from "@/components/ScoreRing";
import { startCheckout } from "@/lib/billing";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

const FEATURES = [
  {
    icon: Gauge,
    title: "Problem scoring",
    desc: "Pain, urgency and frequency rated 1–10 with honest explanations — not cheerleading.",
  },
  {
    icon: Target,
    title: "Target customer",
    desc: "Who buys, where they hang out online, and how they make purchase decisions.",
  },
  {
    icon: TrendingUp,
    title: "Market sizing",
    desc: "TAM, SAM and SOM estimates with the reasoning shown, so you can challenge it.",
  },
  {
    icon: DollarSign,
    title: "Pricing strategy",
    desc: "Monthly & annual pricing, freemium vs paid, and expected willingness to pay.",
  },
  {
    icon: Map,
    title: "MVP roadmap",
    desc: "The smallest possible product, nice-to-haves, and the exact build order.",
  },
  {
    icon: Rocket,
    title: "Go-to-market",
    desc: "First 100 users, first 1,000, content strategy, communities and cold outreach.",
  },
  {
    icon: ShieldAlert,
    title: "Risk analysis",
    desc: "Why startups like yours fail — technical, business and market risks up front.",
  },
  {
    icon: MessageSquare,
    title: "AI advisor chat",
    desc: "Interrogate every report. Push back, dig deeper, stress-test assumptions.",
  },
  {
    icon: FileDown,
    title: "Founder toolkit",
    desc: "SWOT, Lean Canvas, personas, RICE scoring, revenue projections, PDF export.",
  },
];

export default function LandingPage() {
  const router = useRouter();

  async function getFounder() {
    // Falls back to the app (with its paywall flow) if Stripe isn't set up.
    const error = await startCheckout(false);
    if (error) router.push("/validate");
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-20 pt-36 text-center sm:pt-44">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="chip mb-6 text-muted"
        >
          <Sparkles size={12} className="text-accent" />
          AI-powered startup validation
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-3xl text-balance text-5xl font-bold tracking-tight sm:text-7xl"
        >
          Validate your idea <span className="text-gradient">before</span> you
          build it
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-6 max-w-xl text-pretty text-lg text-muted"
        >
          Describe your startup idea and get a brutally honest, investor-grade
          validation report in seconds — problem scores, market size, pricing,
          MVP roadmap and a clear verdict.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link href="/validate" className="btn-primary px-7 py-3.5 text-base">
            Validate my idea <ArrowRight size={17} />
          </Link>
          <Link href="/dashboard" className="btn-ghost px-7 py-3.5 text-base">
            View dashboard
          </Link>
        </motion.div>

        {/* Hero mock report card */}
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong float-slow mt-20 w-full max-w-3xl rounded-3xl p-8 sm:p-10"
        >
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-muted">AI Verdict</p>
              <h3 className="mt-1 text-2xl font-bold">
                AI meal-planner for gyms
              </h3>
              <span
                className="chip mt-3"
                style={{
                  color: "var(--success)",
                  borderColor:
                    "color-mix(in srgb, var(--success) 40%, transparent)",
                }}
              >
                <Check size={12} /> Build it
              </span>
              <div className="mt-5 grid grid-cols-3 gap-4 text-left">
                {[
                  ["Pain", "8/10"],
                  ["Urgency", "7/10"],
                  ["Frequency", "9/10"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-muted">{k}</p>
                    <p className="text-lg font-semibold">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <ScoreRing score={82} size={170} label="/ 100" />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <motion.h2
          {...fadeUp}
          className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Everything a founder needs,{" "}
          <span className="text-gradient">one report</span>
        </motion.h2>
        <motion.p
          {...fadeUp}
          className="mx-auto mt-4 max-w-lg text-center text-muted"
        >
          Ten deep report sections plus a full founder toolkit — generated from a
          two-sentence idea description.
        </motion.p>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
              className="glass glass-hover rounded-3xl p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-white">
                <f.icon size={18} />
              </span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <motion.h2
          {...fadeUp}
          className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Simple pricing
        </motion.h2>
        <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
          <motion.div {...fadeUp} className="glass rounded-3xl p-8">
            <h3 className="font-semibold">Free</h3>
            <p className="mt-2 text-4xl font-bold">$0</p>
            <p className="mt-1 text-sm text-muted">3 validations / month</p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {["Full validation report", "Dashboard & saving", "Dark mode"].map(
                (x) => (
                  <li key={x} className="flex items-center gap-2">
                    <Check size={15} className="text-success" /> {x}
                  </li>
                )
              )}
            </ul>
            <Link href="/validate" className="btn-ghost mt-8 w-full py-3 text-sm">
              Start free
            </Link>
          </motion.div>
          <motion.div
            {...fadeUp}
            className="glass-strong relative rounded-3xl p-8"
          >
            <span className="chip absolute -top-3 left-8 !border-0 bg-gradient-to-r from-accent to-accent-2 text-white">
              Most popular
            </span>
            <h3 className="font-semibold">Founder</h3>
            <p className="mt-2 text-4xl font-bold">
              $19<span className="text-base font-medium text-muted">/mo</span>
            </p>
            <p className="mt-1 text-sm text-muted">Unlimited everything</p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {[
                "Unlimited validations",
                "AI advisor chat",
                "SWOT, Lean & Business Model Canvas",
                "Pitch deck + investor summary",
                "Revenue projections & PDF export",
              ].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <Check size={15} className="text-success" /> {x}
                </li>
              ))}
            </ul>
            <button onClick={getFounder} className="btn-primary mt-8 w-full py-3 text-sm">
              Get Founder
            </button>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-28 pt-8">
        <motion.div
          {...fadeUp}
          className="glass-strong rounded-3xl p-10 text-center sm:p-14"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your next idea deserves{" "}
            <span className="text-gradient">evidence</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Stop building on gut feeling. Get a verdict in under a minute.
          </p>
          <Link
            href="/validate"
            className="btn-primary mt-8 inline-flex px-8 py-3.5"
          >
            Validate my idea <ArrowRight size={17} />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-(--card-border) py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} Micro SaaS Validator — built for founders.
      </footer>
    </div>
  );
}
