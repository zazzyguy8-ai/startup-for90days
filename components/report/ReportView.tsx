"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Gauge,
  Target,
  Swords,
  TrendingUp,
  DollarSign,
  Map,
  Rocket,
  ShieldAlert,
} from "lucide-react";
import type { SavedIdea } from "@/lib/types";
import { SectionCard, Bullets, SubHeading } from "./ui";
import { scoreColor } from "@/components/ScoreRing";

function ScoreBar({ label, detail }: { label: string; detail: { score: number; explanation: string } }) {
  const color = scoreColor(detail.score, 10);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-sm font-bold" style={{ color }}>
          {detail.score}/10
        </p>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-(--ring-track)">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${detail.score * 10}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{detail.explanation}</p>
    </div>
  );
}

export default function ReportView({ idea }: { idea: SavedIdea }) {
  const r = idea.report;
  return (
    <div className="space-y-5">
      <SectionCard icon={FileText} title="1 · Idea Summary">
        <p className="leading-relaxed">{r.ideaSummary}</p>
      </SectionCard>

      <SectionCard icon={Gauge} title="2 · Problem Score">
        <div className="space-y-6">
          <ScoreBar label="Pain level" detail={r.problemScore.pain} />
          <ScoreBar label="Urgency" detail={r.problemScore.urgency} />
          <ScoreBar label="Frequency" detail={r.problemScore.frequency} />
        </div>
      </SectionCard>

      <SectionCard icon={Target} title="3 · Target Customer">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <SubHeading>Ideal customer</SubHeading>
            <p className="text-sm leading-relaxed">{r.targetCustomer.idealCustomer}</p>
          </div>
          <div>
            <SubHeading>Industry</SubHeading>
            <p className="text-sm leading-relaxed">{r.targetCustomer.industry}</p>
          </div>
          <div>
            <SubHeading>Company size</SubHeading>
            <p className="text-sm leading-relaxed">{r.targetCustomer.companySize}</p>
          </div>
          <div>
            <SubHeading>Buying behavior</SubHeading>
            <p className="text-sm leading-relaxed">{r.targetCustomer.buyingBehavior}</p>
          </div>
        </div>
        <div className="mt-5">
          <SubHeading>Where they spend time online</SubHeading>
          <div className="flex flex-wrap gap-1.5">
            {r.targetCustomer.onlineHangouts.map((h) => (
              <span key={h} className="chip text-muted">
                {h}
              </span>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Swords} title="4 · Competition">
        <div className="space-y-4">
          {r.competition.competitors.map((c) => (
            <div
              key={c.name}
              className="rounded-2xl border border-(--card-border) p-4"
            >
              <p className="font-semibold">{c.name}</p>
              <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
                <p>
                  <span className="font-medium text-success">Does well: </span>
                  <span className="text-muted">{c.doesWell}</span>
                </p>
                <p>
                  <span className="font-medium text-danger">Weaknesses: </span>
                  <span className="text-muted">{c.weaknesses}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <SubHeading>Gaps in the market</SubHeading>
            <Bullets items={r.competition.marketGaps} accent="var(--warning)" />
          </div>
          <div>
            <SubHeading>How to differentiate</SubHeading>
            <Bullets items={r.competition.differentiation} accent="var(--success)" />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={TrendingUp} title="5 · Market Size">
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["TAM", r.marketSize.tam, "Total addressable"],
              ["SAM", r.marketSize.sam, "Serviceable available"],
              ["SOM", r.marketSize.som, "Serviceable obtainable"],
            ] as const
          ).map(([k, v, sub], i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="rounded-2xl border border-(--card-border) p-5 text-center"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                {k}
              </p>
              <p className="mt-1 text-3xl font-bold text-gradient">{v}</p>
              <p className="mt-1 text-xs text-muted">{sub}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-relaxed text-muted">
          {r.marketSize.reasoning}
        </p>
      </SectionCard>

      <SectionCard icon={DollarSign} title="6 · Pricing Recommendation">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-(--card-border) p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Monthly
            </p>
            <p className="mt-1 text-3xl font-bold">
              ${r.pricing.monthly}
              <span className="text-sm font-medium text-muted">/mo</span>
            </p>
          </div>
          <div className="rounded-2xl border border-(--card-border) p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Annual
            </p>
            <p className="mt-1 text-3xl font-bold">
              ${r.pricing.annual}
              <span className="text-sm font-medium text-muted">/yr</span>
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-4 text-sm leading-relaxed">
          <p>
            <span className="font-semibold">Model: </span>
            {r.pricing.model}
          </p>
          <p>
            <span className="font-semibold">Willingness to pay: </span>
            {r.pricing.willingnessToPay}
          </p>
          <p className="text-muted">{r.pricing.reasoning}</p>
        </div>
      </SectionCard>

      <SectionCard icon={Map} title="7 · MVP Roadmap">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <SubHeading>Core MVP features</SubHeading>
            <Bullets items={r.mvpRoadmap.coreFeatures} accent="var(--success)" />
          </div>
          <div>
            <SubHeading>Nice-to-have</SubHeading>
            <Bullets items={r.mvpRoadmap.niceToHave} />
          </div>
        </div>
        <div className="mt-6">
          <SubHeading>Build order</SubHeading>
          <ol className="space-y-2.5">
            {r.mvpRoadmap.buildOrder.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </SectionCard>

      <SectionCard icon={Rocket} title="8 · Go-To-Market Strategy">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <SubHeading>First 100 users</SubHeading>
            <Bullets items={r.gtm.first100} />
          </div>
          <div>
            <SubHeading>First 1,000 users</SubHeading>
            <Bullets items={r.gtm.first1000} />
          </div>
          <div>
            <SubHeading>Organic growth</SubHeading>
            <Bullets items={r.gtm.organicGrowth} />
          </div>
          <div>
            <SubHeading>Content strategy</SubHeading>
            <Bullets items={r.gtm.contentStrategy} />
          </div>
          <div>
            <SubHeading>Communities to target</SubHeading>
            <Bullets items={r.gtm.communities} />
          </div>
          <div>
            <SubHeading>Cold outreach</SubHeading>
            <Bullets items={r.gtm.coldOutreach} />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={ShieldAlert} title="9 · Risk Analysis">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <SubHeading>Biggest risks</SubHeading>
            <Bullets items={r.risks.biggestRisks} accent="var(--danger)" />
          </div>
          <div>
            <SubHeading>Why startups like this fail</SubHeading>
            <Bullets items={r.risks.whyStartupsFail} accent="var(--danger)" />
          </div>
          <div>
            <SubHeading>Technical risks</SubHeading>
            <Bullets items={r.risks.technicalRisks} accent="var(--warning)" />
          </div>
          <div>
            <SubHeading>Business risks</SubHeading>
            <Bullets items={r.risks.businessRisks} accent="var(--warning)" />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
