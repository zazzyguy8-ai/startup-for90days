"use client";

import {
  Rocket,
  Hash,
  AtSign,
  MessagesSquare,
  Mail,
  Hourglass,
  Clapperboard,
  Briefcase,
} from "lucide-react";
import type { BuildLaunch } from "@/lib/types";
import { SectionCard, SubHeading } from "@/components/report/ui";
import { CopyButton } from "../ui";

function CopyCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-(--card-border) p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{text}</p>
        <CopyButton text={text} />
      </div>
    </div>
  );
}

export default function LaunchView({ data }: { data: BuildLaunch }) {
  return (
    <div className="space-y-5">
      <SectionCard icon={Rocket} title="Product Hunt Launch">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-(--card-border) p-4">
            <SubHeading>Name</SubHeading>
            <p className="font-semibold">{data.productHunt.name}</p>
          </div>
          <div className="rounded-2xl border border-(--card-border) p-4">
            <SubHeading>Tagline</SubHeading>
            <p className="font-semibold">{data.productHunt.tagline}</p>
          </div>
        </div>
        <div className="mt-3 rounded-2xl border border-(--card-border) p-4">
          <SubHeading>Description</SubHeading>
          <p className="text-sm leading-relaxed text-muted">
            {data.productHunt.description}
          </p>
        </div>
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between">
            <SubHeading>Founder&apos;s first comment</SubHeading>
            <CopyButton text={data.productHunt.firstComment} />
          </div>
          <pre className="whitespace-pre-wrap rounded-2xl border border-(--card-border) bg-(--ring-track) p-4 text-[13px] leading-relaxed">
            {data.productHunt.firstComment}
          </pre>
        </div>
      </SectionCard>

      <SectionCard icon={Hash} title="X / Twitter Posts">
        <div className="space-y-3">
          {data.xPosts.map((p) => (
            <CopyCard key={p.slice(0, 40)} text={p} />
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={AtSign} title="LinkedIn Posts">
        <div className="space-y-3">
          {data.linkedinPosts.map((p) => (
            <CopyCard key={p.slice(0, 40)} text={p} />
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={MessagesSquare} title="Reddit Launch Strategy">
        <div className="space-y-2.5">
          {data.redditStrategy.map((r) => (
            <div
              key={r.subreddit}
              className="rounded-2xl border border-(--card-border) p-4"
            >
              <p className="font-mono text-sm font-semibold text-accent">
                {r.subreddit}
              </p>
              <p className="mt-1 text-[13px] leading-snug text-muted">{r.angle}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={Mail} title="Cold Email Campaign">
        <div className="space-y-4">
          {data.coldEmails.map((e) => (
            <div
              key={e.subject}
              className="rounded-2xl border border-(--card-border) p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm">
                  <span className="font-semibold">Subject: </span>
                  {e.subject}
                </p>
                <CopyButton text={`Subject: ${e.subject}\n\n${e.body}`} />
              </div>
              <pre className="mt-3 whitespace-pre-wrap border-t border-(--card-border) pt-3 text-[13px] leading-relaxed text-muted">
                {e.body}
              </pre>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={Hourglass} title="Waitlist Page">
        <div className="rounded-2xl border border-(--card-border) bg-gradient-to-b from-transparent to-accent/5 p-8 text-center">
          <h3 className="text-balance text-2xl font-bold tracking-tight">
            {data.waitlistPage.headline}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {data.waitlistPage.subheadline}
          </p>
          <span className="btn-primary mt-5 inline-flex cursor-default px-6 py-2.5 text-sm">
            {data.waitlistPage.cta}
          </span>
        </div>
      </SectionCard>

      <SectionCard icon={Clapperboard} title="Demo Video Script">
        <ol className="space-y-2.5">
          {data.demoScript.map((beat, i) => (
            <li key={beat} className="flex gap-3 text-sm leading-relaxed">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              {beat}
            </li>
          ))}
        </ol>
      </SectionCard>

      <SectionCard icon={Briefcase} title="Investor Pitch">
        <div className="flex items-start justify-between gap-3">
          <p className="rounded-2xl border-l-4 border-accent bg-accent/5 p-5 text-sm leading-relaxed">
            {data.investorPitch}
          </p>
          <CopyButton text={data.investorPitch} />
        </div>
      </SectionCard>
    </div>
  );
}
