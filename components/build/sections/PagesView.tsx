"use client";

import { Monitor, CircleDollarSign, HelpCircle, Scale, Search, PenLine, Check } from "lucide-react";
import type { BuildPages } from "@/lib/types";
import { SectionCard, Bullets, SubHeading } from "@/components/report/ui";
import { CopyButton } from "../ui";

export default function PagesView({ data }: { data: BuildPages }) {
  return (
    <div className="space-y-5">
      <SectionCard icon={Monitor} title="Landing Page">
        <div className="rounded-2xl border border-(--card-border) bg-gradient-to-b from-transparent to-accent/5 p-6 text-center sm:p-10">
          <h3 className="mx-auto max-w-xl text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {data.landing.headline}
          </h3>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm text-muted">
            {data.landing.subheadline}
          </p>
          <span className="btn-primary mt-6 inline-flex cursor-default px-6 py-2.5 text-sm">
            {data.landing.cta}
          </span>
          <div className="mx-auto mt-6 grid max-w-lg gap-2 text-left sm:grid-cols-2">
            {data.landing.bullets.map((b) => (
              <p key={b} className="flex items-start gap-2 text-[13px]">
                <Check size={14} className="mt-0.5 shrink-0 text-success" />
                {b}
              </p>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={CircleDollarSign} title="Pricing Page">
        <div className="grid gap-4 sm:grid-cols-2">
          {data.pricingTiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-6 ${
                i === data.pricingTiers.length - 1
                  ? "border-accent/40"
                  : "border-(--card-border)"
              }`}
            >
              <p className="font-semibold">{tier.name}</p>
              <p className="mt-1 text-3xl font-bold">{tier.price}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={HelpCircle} title="FAQ">
        <div className="space-y-3">
          {data.faq.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-(--card-border) p-4"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold">
                {f.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={Scale} title="Terms & Privacy Policy">
        <div className="grid gap-4 lg:grid-cols-2">
          {(
            [
              ["Terms of Service", data.terms],
              ["Privacy Policy", data.privacy],
            ] as const
          ).map(([title, text]) => (
            <div key={title} className="min-w-0">
              <div className="mb-2 flex items-center justify-between">
                <SubHeading>{title}</SubHeading>
                <CopyButton text={text} />
              </div>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-(--card-border) bg-(--ring-track) p-4 text-[12px] leading-relaxed">
                {text}
              </pre>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={Search} title="SEO Metadata">
        <div className="space-y-3 text-sm">
          <div className="rounded-2xl border border-(--card-border) p-4">
            <SubHeading>Title tag</SubHeading>
            <p className="font-medium">{data.seo.title}</p>
          </div>
          <div className="rounded-2xl border border-(--card-border) p-4">
            <SubHeading>Meta description</SubHeading>
            <p className="text-muted">{data.seo.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-(--card-border) p-4">
              <SubHeading>OG title</SubHeading>
              <p>{data.seo.ogTitle}</p>
            </div>
            <div className="rounded-2xl border border-(--card-border) p-4">
              <SubHeading>OG description</SubHeading>
              <p className="text-muted">{data.seo.ogDescription}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-(--card-border) p-4">
            <SubHeading>Keywords</SubHeading>
            <div className="flex flex-wrap gap-1.5">
              {data.seo.keywords.map((k) => (
                <span key={k} className="chip text-muted">
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={PenLine} title="Blog Ideas">
        <Bullets items={data.blogIdeas} />
      </SectionCard>
    </div>
  );
}
