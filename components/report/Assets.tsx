"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Presentation,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import type { SavedIdea } from "@/lib/types";
import { SectionCard } from "./ui";

export default function Assets({ idea }: { idea: SavedIdea }) {
  const r = idea.report;
  const [slide, setSlide] = useState(0);
  const deck = r.pitchDeck;

  return (
    <div className="space-y-5">
      <SectionCard icon={Monitor} title="Landing Page Generator">
        <div className="overflow-hidden rounded-2xl border border-(--card-border)">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 border-b border-(--card-border) bg-(--ring-track) px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
            <span className="ml-3 truncate text-xs text-muted">
              {idea.input.website || "yourstartup.com"}
            </span>
          </div>
          <div className="bg-gradient-to-b from-transparent to-accent/5 px-6 py-12 text-center sm:px-12 sm:py-16">
            <span className="chip text-muted">{r.landingPage.socialProof}</span>
            <h3 className="mx-auto mt-5 max-w-xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {r.landingPage.headline}
            </h3>
            <p className="mx-auto mt-4 max-w-md text-pretty text-muted">
              {r.landingPage.subheadline}
            </p>
            <span className="btn-primary mt-7 inline-flex cursor-default px-7 py-3">
              {r.landingPage.cta}
            </span>
            <div className="mx-auto mt-8 grid max-w-lg gap-2 text-left sm:grid-cols-2">
              {r.landingPage.bullets.map((b) => (
                <p key={b} className="flex items-start gap-2 text-sm">
                  <Check size={15} className="mt-0.5 shrink-0 text-success" />
                  {b}
                </p>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Presentation} title="Pitch Deck Generator">
        <div className="relative overflow-hidden rounded-2xl border border-(--card-border)">
          <div className="flex aspect-video flex-col justify-center bg-gradient-to-br from-accent/10 via-transparent to-accent-2/10 p-8 sm:p-14">
              <motion.div
                key={slide}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-accent">
                  {String(slide + 1).padStart(2, "0")} / {String(deck.length).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
                  {deck[slide].title}
                </h3>
                <ul className="mt-5 space-y-2.5">
                  {deck[slide].bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 text-sm leading-relaxed sm:text-base">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
          </div>
          <div className="flex items-center justify-between border-t border-(--card-border) px-4 py-3">
            <button
              onClick={() => setSlide((s) => Math.max(0, s - 1))}
              disabled={slide === 0}
              className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Prev
            </button>
            <div className="flex gap-1.5">
              {deck.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === slide ? 20 : 6,
                    background:
                      i === slide ? "var(--accent)" : "var(--ring-track)",
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => setSlide((s) => Math.min(deck.length - 1, s + 1))}
              disabled={slide === deck.length - 1}
              className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Briefcase} title="Investor Pitch Summary">
        <p className="rounded-2xl border-l-4 border-accent bg-accent/5 p-5 text-sm leading-relaxed sm:text-base">
          {r.investorSummary}
        </p>
      </SectionCard>
    </div>
  );
}
