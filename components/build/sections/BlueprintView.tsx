"use client";

import {
  FileText,
  Users,
  ListChecks,
  Database,
  Waypoints,
  Network,
  KeyRound,
  FolderTree,
  Layers,
} from "lucide-react";
import type { BuildBlueprint } from "@/lib/types";
import { SectionCard, Bullets, SubHeading } from "@/components/report/ui";
import { CodeBlock } from "../ui";

export default function BlueprintView({ data }: { data: BuildBlueprint }) {
  return (
    <div className="space-y-5">
      <SectionCard icon={FileText} title="Product Requirements Document">
        <p className="leading-relaxed">{data.prd.overview}</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div>
            <SubHeading>Goals</SubHeading>
            <Bullets items={data.prd.goals} accent="var(--success)" />
          </div>
          <div>
            <SubHeading>Non-goals</SubHeading>
            <Bullets items={data.prd.nonGoals} accent="var(--danger)" />
          </div>
          <div>
            <SubHeading>Success metrics</SubHeading>
            <Bullets items={data.prd.successMetrics} />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Users} title="User Stories">
        <Bullets items={data.userStories} />
      </SectionCard>

      <SectionCard icon={ListChecks} title="Feature List">
        <div className="space-y-2.5">
          {data.featureList.map((f) => (
            <div
              key={f.name}
              className="flex items-start gap-3 rounded-2xl border border-(--card-border) p-3.5"
            >
              <span
                className="chip mt-0.5 shrink-0"
                style={{
                  color: f.priority === "MVP" ? "var(--success)" : "var(--muted)",
                  borderColor: `color-mix(in srgb, ${
                    f.priority === "MVP" ? "var(--success)" : "var(--muted)"
                  } 40%, transparent)`,
                }}
              >
                {f.priority}
              </span>
              <div>
                <p className="text-sm font-semibold">{f.name}</p>
                <p className="text-sm text-muted">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={Database} title="Database Schema">
        <CodeBlock code={data.databaseSchema} title="supabase/schema.sql" />
      </SectionCard>

      <SectionCard icon={Waypoints} title="User Flows">
        <div className="grid gap-4 lg:grid-cols-3">
          {data.userFlows.map((flow) => (
            <div
              key={flow.name}
              className="rounded-2xl border border-(--card-border) p-4"
            >
              <p className="font-semibold">{flow.name}</p>
              <ol className="mt-3 space-y-2">
                {flow.steps.map((s, i) => (
                  <li key={s} className="flex gap-2.5 text-[13px] leading-snug">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={Network} title="API Architecture">
        <div className="space-y-2">
          {data.apiArchitecture.map((e) => (
            <div
              key={e.method + e.path}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-(--card-border) px-3.5 py-2.5 text-sm"
            >
              <span
                className="chip font-mono"
                style={{
                  color:
                    e.method === "GET"
                      ? "var(--accent-3)"
                      : e.method === "DELETE"
                        ? "var(--danger)"
                        : "var(--success)",
                }}
              >
                {e.method}
              </span>
              <code className="font-mono text-[13px]">{e.path}</code>
              <span className="w-full text-[13px] text-muted sm:w-auto sm:flex-1">
                {e.description}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={KeyRound} title="Authentication Flow">
        <ol className="space-y-2.5">
          {data.authFlow.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </SectionCard>

      <SectionCard icon={FolderTree} title="File Structure">
        <CodeBlock code={data.fileStructure} title="repository layout" />
      </SectionCard>

      <SectionCard icon={Layers} title="Tech Stack Recommendation">
        <div className="grid gap-3 sm:grid-cols-2">
          {data.techStack.map((t) => (
            <div
              key={t.layer}
              className="rounded-2xl border border-(--card-border) p-4"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
                {t.layer}
              </p>
              <p className="mt-1 text-sm font-semibold">{t.choice}</p>
              <p className="mt-1 text-[13px] leading-snug text-muted">{t.why}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
