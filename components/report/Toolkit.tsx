"use client";

import {
  Grid2x2,
  LayoutGrid,
  Users,
  ListOrdered,
  Building2,
} from "lucide-react";
import type { SavedIdea } from "@/lib/types";
import { SectionCard, CanvasBox } from "./ui";

export default function Toolkit({ idea }: { idea: SavedIdea }) {
  const r = idea.report;
  const rice = [...r.rice]
    .map((f) => ({
      ...f,
      score: Math.round(((f.reach * f.impact * (f.confidence / 100)) / f.effort) * 10) / 10,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-5">
      <SectionCard icon={Grid2x2} title="SWOT Analysis">
        <div className="grid gap-3 sm:grid-cols-2">
          <CanvasBox title="Strengths" items={r.swot.strengths} className="!border-success/30" />
          <CanvasBox title="Weaknesses" items={r.swot.weaknesses} className="!border-danger/30" />
          <CanvasBox title="Opportunities" items={r.swot.opportunities} className="!border-accent/30" />
          <CanvasBox title="Threats" items={r.swot.threats} className="!border-warning/30" />
        </div>
      </SectionCard>

      <SectionCard icon={LayoutGrid} title="Lean Canvas">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CanvasBox title="Problem" items={r.leanCanvas.problem} />
          <CanvasBox title="Solution" items={r.leanCanvas.solution} />
          <CanvasBox title="Key Metrics" items={r.leanCanvas.keyMetrics} />
          <CanvasBox
            title="Unique Value Proposition"
            items={r.leanCanvas.uniqueValueProposition}
            className="!border-accent/40"
          />
          <CanvasBox title="Unfair Advantage" items={r.leanCanvas.unfairAdvantage} />
          <CanvasBox title="Channels" items={r.leanCanvas.channels} />
          <CanvasBox title="Customer Segments" items={r.leanCanvas.customerSegments} />
          <CanvasBox title="Cost Structure" items={r.leanCanvas.costStructure} />
          <CanvasBox title="Revenue Streams" items={r.leanCanvas.revenueStreams} />
        </div>
      </SectionCard>

      <SectionCard icon={Building2} title="Business Model Canvas">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CanvasBox title="Key Partners" items={r.businessModelCanvas.keyPartners} />
          <CanvasBox title="Key Activities" items={r.businessModelCanvas.keyActivities} />
          <CanvasBox title="Key Resources" items={r.businessModelCanvas.keyResources} />
          <CanvasBox
            title="Value Propositions"
            items={r.businessModelCanvas.valuePropositions}
            className="!border-accent/40"
          />
          <CanvasBox
            title="Customer Relationships"
            items={r.businessModelCanvas.customerRelationships}
          />
          <CanvasBox title="Channels" items={r.businessModelCanvas.channels} />
          <CanvasBox title="Customer Segments" items={r.businessModelCanvas.customerSegments} />
          <CanvasBox title="Cost Structure" items={r.businessModelCanvas.costStructure} />
          <CanvasBox title="Revenue Streams" items={r.businessModelCanvas.revenueStreams} />
        </div>
      </SectionCard>

      <SectionCard icon={Users} title="Customer Personas">
        <div className="grid gap-4 lg:grid-cols-3">
          {r.personas.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border border-(--card-border) p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-3 text-sm font-bold text-white">
                  {p.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div>
                  <p className="font-semibold leading-tight">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.role} · {p.age}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">{p.bio}</p>
              <p className="mt-3 border-l-2 border-accent pl-3 text-[13px] italic">
                “{p.quote}”
              </p>
              <div className="mt-4 space-y-3 text-[13px]">
                <div>
                  <p className="font-semibold text-success">Goals</p>
                  <p className="text-muted">{p.goals.join(" · ")}</p>
                </div>
                <div>
                  <p className="font-semibold text-danger">Pains</p>
                  <p className="text-muted">{p.pains.join(" · ")}</p>
                </div>
                <div>
                  <p className="font-semibold">Channels</p>
                  <p className="text-muted">{p.channels.join(" · ")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={ListOrdered} title="Feature Prioritization (RICE)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-130 text-sm">
            <thead>
              <tr className="border-b border-(--card-border) text-left text-xs uppercase tracking-wider text-muted">
                <th className="pb-3 pr-3 font-semibold">Feature</th>
                <th className="pb-3 pr-3 font-semibold">Reach</th>
                <th className="pb-3 pr-3 font-semibold">Impact</th>
                <th className="pb-3 pr-3 font-semibold">Conf.</th>
                <th className="pb-3 pr-3 font-semibold">Effort</th>
                <th className="pb-3 font-semibold">RICE</th>
              </tr>
            </thead>
            <tbody>
              {rice.map((f, i) => (
                <tr key={f.feature} className="border-b border-(--card-border)/50">
                  <td className="py-3 pr-3 font-medium">
                    {i === 0 && <span className="mr-1.5">🏆</span>}
                    {f.feature}
                  </td>
                  <td className="py-3 pr-3 text-muted">{f.reach}</td>
                  <td className="py-3 pr-3 text-muted">{f.impact}</td>
                  <td className="py-3 pr-3 text-muted">{f.confidence}%</td>
                  <td className="py-3 pr-3 text-muted">{f.effort}w</td>
                  <td className="py-3 font-bold text-accent">{f.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          RICE = (Reach × Impact × Confidence) ÷ Effort — build top-down.
        </p>
      </SectionCard>
    </div>
  );
}
