import type { IdeaInput, ValidationReport, VerdictLabel } from "./types";

// Deterministic pseudo-random from a string seed, so the same idea
// always produces the same demo report.
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let state = seed || 1;
  return () => {
    state = Math.abs((Math.imul(state, 48271) + 11) % 2147483647);
    return state / 2147483647;
  };
}

const INDUSTRIES = [
  "SaaS / B2B Software",
  "E-commerce Tools",
  "Developer Tools",
  "Marketing Tech",
  "HR & Recruiting",
  "Fintech",
  "Health & Wellness",
  "Education Tech",
];

function titleFromIdea(idea: string): string {
  const clean = idea.replace(/\s+/g, " ").trim();
  const words = clean.split(" ").slice(0, 8).join(" ");
  return words.length < clean.length ? words + "…" : words;
}

export function deriveTitle(input: IdeaInput): string {
  return titleFromIdea(input.idea);
}

export function generateMockReport(input: IdeaInput): ValidationReport {
  const seed = hashSeed(input.idea + "|" + input.audience);
  const rand = rng(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const between = (min: number, max: number) =>
    Math.round(min + rand() * (max - min));

  const pain = between(5, 9);
  const urgency = between(4, 9);
  const frequency = between(4, 9);
  const verdictScore = Math.min(
    96,
    Math.round(((pain + urgency + frequency) / 30) * 100) + between(-6, 8)
  );
  const label: VerdictLabel =
    verdictScore >= 75
      ? "Build it"
      : verdictScore >= 55
        ? "Build carefully"
        : verdictScore >= 38
          ? "Pivot"
          : "Don't build";

  const industry = pick(INDUSTRIES);
  const monthly = pick([19, 29, 39, 49, 79, 99]);
  const audience = input.audience || "small business owners";
  const competitorNames = input.competitors
    ? input.competitors
        .split(/[,\n]/)
        .map((c) => c.trim())
        .filter(Boolean)
        .slice(0, 4)
    : ["Incumbent Suite Co.", "LegacyTool Pro", "SpreadsheetDIY"];

  return {
    ideaSummary: `This idea targets ${audience} with a focused software solution: ${input.idea.slice(0, 180)}${input.idea.length > 180 ? "…" : ""} The core promise is replacing a slow, manual workflow with an automated, purpose-built tool that saves hours per week and produces measurably better outcomes.`,
    problemScore: {
      pain: {
        score: pain,
        explanation: `${audience} currently solve this with duct-taped spreadsheets, generic tools, or manual effort. The pain is real and acknowledged — people complain about it publicly in communities and reviews — which puts pain at ${pain}/10.`,
      },
      urgency: {
        score: urgency,
        explanation: `Urgency scores ${urgency}/10: the problem costs time and money continuously, but it rarely creates a same-day crisis, so buyers can postpone purchasing unless a trigger event (growth, audit, launch) forces action.`,
      },
      frequency: {
        score: frequency,
        explanation: `The workflow recurs weekly or even daily for active ${audience}, scoring ${frequency}/10. High-frequency problems build habit and retention — a strong signal for subscription pricing.`,
      },
    },
    targetCustomer: {
      idealCustomer: `Hands-on ${audience} who feel the pain personally and can buy a $${monthly}/mo tool without procurement.`,
      industry,
      companySize: "1–50 employees (solo founders to small teams)",
      buyingBehavior:
        "Self-serve, credit-card purchases after a free trial. Decision is made by the end user in days, not months. Case studies and peer recommendations matter more than sales calls.",
      onlineHangouts: [
        "Reddit (niche subreddits)",
        "X / Twitter build-in-public circles",
        "Indie Hackers",
        "LinkedIn groups",
        "Niche Slack & Discord communities",
        "YouTube tutorials",
      ],
    },
    competition: {
      competitors: competitorNames.map((name, i) => ({
        name,
        doesWell:
          i === 0
            ? "Strong brand recognition and a broad feature set that covers adjacent workflows."
            : i === 1
              ? "Deep integrations and enterprise-grade reliability that larger teams trust."
              : "Cheap or free entry point, which captures price-sensitive users early.",
        weaknesses:
          i === 0
            ? "Bloated UX, slow onboarding, and pricing that punishes small teams."
            : i === 1
              ? "Outdated interface and slow release cadence; ignores the low end of the market."
              : "Shallow functionality — users outgrow it quickly and churn to better tools.",
      })),
      marketGaps: [
        "No player owns the fast, opinionated, single-workflow experience for this niche.",
        "Mobile-first usage is underserved by incumbent desktop-era tools.",
        "AI-assisted automation of the core workflow is still a novelty here, not table stakes.",
      ],
      differentiation: [
        "Win on time-to-value: deliver the core outcome in under 5 minutes from signup.",
        "Design for the niche's vocabulary and workflow instead of a generic horizontal tool.",
        "Bundle AI assistance as the default, not a paid add-on.",
        "Transparent, simple pricing against incumbents' seat-based complexity.",
      ],
    },
    marketSize: {
      tam: `$${between(2, 8)}.${between(1, 9)}B`,
      sam: `$${between(200, 900)}M`,
      som: `$${between(4, 30)}M`,
      reasoning: `TAM covers global spend on software and services for this workflow across all ${industry.toLowerCase()} buyers. SAM narrows to English-speaking, self-serve SMB buyers reachable through online channels. SOM assumes capturing 1–3% of the serviceable market within 3 years via niche positioning — realistic for a focused micro-SaaS without paid acquisition at scale.`,
    },
    pricing: {
      monthly,
      annual: monthly * 10,
      model:
        "Freemium with a hard usage cap. Free tier drives word-of-mouth; the cap converts active users within 2–4 weeks.",
      willingnessToPay: `$${monthly}–$${monthly * 2}/mo for individuals; 2–3 seats typical for teams. Annual discount (2 months free) should convert 25–35% of subscribers.`,
      reasoning: `Priced against the cost of the manual alternative (several hours/week of founder or employee time) rather than against competitor list prices. $${monthly}/mo stays under the typical no-approval spending threshold for this buyer.`,
    },
    mvpRoadmap: {
      coreFeatures: [
        "Single core workflow: input → automated processing → shareable result",
        "Simple onboarding with one guided example (aha-moment in first session)",
        "Save / revisit past work (basic dashboard)",
        "Stripe-powered subscription with free tier and usage cap",
      ],
      niceToHave: [
        "Team workspaces and sharing",
        "Integrations (Zapier, Slack, email digests)",
        "Templates and community gallery",
        "API access for power users",
        "White-label / export options",
      ],
      buildOrder: [
        "Week 1–2: Core workflow end-to-end with hardcoded happy path",
        "Week 3: Auth, persistence, and dashboard",
        "Week 4: Billing, usage caps, and landing page",
        "Week 5: Polish, onboarding flow, analytics — then launch",
        "Post-launch: iterate on the #1 requested integration only after 20+ paying users",
      ],
    },
    gtm: {
      first100: [
        "Do 30 founder-led conversations in communities where the audience already gathers; convert with a concierge onboarding offer.",
        "Launch on Product Hunt and relevant subreddits with a genuinely useful free tool version.",
        "Personally onboard every signup and ask for one referral at the moment of first success.",
      ],
      first1000: [
        "Double down on the single channel that produced the most engaged first-100 users.",
        "Ship a free viral side-tool (calculator, grader, generator) that feeds the funnel.",
        "Partnerships with 3–5 niche newsletters and micro-influencers (rev-share, not flat fees).",
      ],
      organicGrowth: [
        "Programmatic SEO pages targeting long-tail 'how do I…' queries in the niche",
        "Public output pages with 'Made with' backlinks",
        "Build-in-public updates on X and LinkedIn",
      ],
      contentStrategy: [
        "Weekly teardown-style posts solving the exact problem for a named segment",
        "Comparison pages vs each incumbent ('X vs Us')",
        "A definitive free guide that owns the head keyword for the workflow",
      ],
      communities: [
        "2–3 niche subreddits",
        "Indie Hackers",
        "Relevant Facebook/LinkedIn groups",
        "Niche Slack/Discord servers",
        "Quora and StackExchange threads that already rank",
      ],
      coldOutreach: [
        "Scrape public signals (job posts, reviews, tweets) showing the pain, then send 10 hyper-personalized emails/day.",
        "Offer a free 'done-for-you' version of the outcome as the opener, not a demo request.",
        "Follow up exactly twice; move channel (LinkedIn) on the third touch.",
      ],
    },
    risks: {
      biggestRisks: [
        "Distribution risk: the product may work, but no repeatable acquisition channel emerges.",
        "The pain may be real but not painful enough to displace 'free + manual'.",
        "Platform dependency if the workflow relies on a third-party API or marketplace.",
      ],
      whyStartupsFail: [
        "Building for months before validating willingness to pay",
        "Targeting 'everyone' instead of a specific reachable niche",
        "Underpricing, which starves the business of margin for acquisition",
        "Churn from shallow engagement — the tool is nice, not necessary",
      ],
      technicalRisks: [
        "AI/API costs scaling faster than revenue if usage is unmetered",
        "Data handling and privacy expectations (especially for business data)",
        "Vendor lock-in on a single model/API provider",
      ],
      businessRisks: [
        "An incumbent shipping the same feature as a checkbox",
        "CAC exceeding LTV if paid channels become the only growth lever",
        "Solo-founder bus factor and support load at scale",
      ],
    },
    verdict: {
      score: verdictScore,
      label,
      explanation:
        label === "Build it"
          ? `Strong pain (${pain}/10) recurring at high frequency (${frequency}/10) for a reachable, self-serve niche makes this worth building now. The market has clear gaps, pricing power exists at $${monthly}/mo, and an MVP is shippable in ~5 weeks. Validate willingness to pay with a concierge version while building.`
          : label === "Build carefully"
            ? `The problem is real (pain ${pain}/10) but urgency (${urgency}/10) suggests buyers can postpone. Build a scrappy MVP in weeks, not months, pre-sell to 10 customers before writing serious code, and kill or double-down based on activation data — not opinions.`
            : label === "Pivot"
              ? `Signals are mixed: the pain exists but urgency and frequency don't support a strong subscription motion yet. Keep the audience, reframe the problem — interview 20 target users and find the adjacent workflow they'd pay for this quarter.`
              : `The combination of modest pain, low urgency, and entrenched free alternatives makes this a hard business even with perfect execution. Redirect the energy to a sharper problem for the same audience.`,
    },
    swot: {
      strengths: [
        "Focused single-workflow product with fast time-to-value",
        "Low build cost and small surface area — a solo founder can maintain it",
        "AI-native from day one, unlike incumbents",
      ],
      weaknesses: [
        "No brand or distribution at the start",
        "Thin feature set vs suites (until the niche depth compounds)",
        "Founder-dependent support and roadmap",
      ],
      opportunities: [
        "Underserved SMB segment ignored by enterprise incumbents",
        "Programmatic SEO in a niche with weak content competition",
        "Expansion into adjacent workflows once the wedge is established",
      ],
      threats: [
        "Incumbents bundling the feature for free",
        "API/model cost or policy changes",
        "Copycats with paid-acquisition budgets",
      ],
    },
    leanCanvas: {
      problem: [
        "The current workflow is manual, slow, and error-prone",
        "Generic tools require setup the audience won't do",
        "Results are inconsistent and hard to share",
      ],
      solution: [
        "Purpose-built automation of the core workflow",
        "Opinionated defaults — zero configuration",
        "Shareable, professional output in minutes",
      ],
      keyMetrics: [
        "Activation rate (first successful output)",
        "Weekly active usage",
        "Free→paid conversion",
        "Net revenue churn",
      ],
      uniqueValueProposition:
        "The fastest way for the niche to get this job done — minutes instead of hours, no learning curve.",
      unfairAdvantage:
        "Niche-specific depth, community trust from building in public, and proprietary workflow data that improves recommendations over time.",
      channels: ["SEO", "Communities", "Product Hunt", "Newsletter partnerships", "Cold outreach"],
      customerSegments: [audience, "Early-stage teams with the same workflow"],
      costStructure: ["Hosting & AI API costs", "Payment fees", "Founder time", "Content production"],
      revenueStreams: [`$${monthly}/mo subscriptions`, `$${monthly * 10}/yr annual plans`, "Team seats"],
    },
    businessModelCanvas: {
      keyPartners: ["AI API provider", "Payment processor (Stripe)", "Niche newsletters & influencers", "Cloud hosting"],
      keyActivities: ["Product development", "Content & SEO", "Community engagement", "Customer success"],
      keyResources: ["Product & codebase", "Founder domain expertise", "Community reputation", "Workflow dataset"],
      valuePropositions: ["10x faster core workflow", "No setup, no learning curve", "Professional results every time"],
      customerRelationships: ["Self-serve with human-touch onboarding", "Community-driven support", "Public roadmap"],
      channels: ["Organic search", "Social & communities", "Referrals", "Partnerships"],
      customerSegments: [audience, "SMB teams (1–50)"],
      costStructure: ["Variable AI/API costs", "Fixed hosting & tools", "Marketing experiments"],
      revenueStreams: ["Monthly subscriptions", "Annual plans", "Add-on usage packs"],
    },
    personas: [
      {
        name: "Sam Riley",
        role: `Hands-on ${audience.split(",")[0] || "founder"}`,
        age: 32,
        bio: "Runs the whole operation solo. Time is the scarcest resource; every tool must pay for itself within a week.",
        goals: ["Ship faster", "Look professional to clients", "Automate the boring 20%"],
        pains: ["Repetitive manual work", "Tool sprawl", "No time to learn complex software"],
        channels: ["X / Twitter", "Reddit", "YouTube"],
        quote: "If I can't get value in the first ten minutes, I'm out.",
      },
      {
        name: "Jordan Lee",
        role: "Ops lead at a 12-person team",
        age: 38,
        bio: "Owns the workflow for the team and reports results upward. Buys tools on a company card under a monthly limit.",
        goals: ["Standardize the team's process", "Report clean metrics", "Reduce errors"],
        pains: ["Inconsistent output between teammates", "Spreadsheet versioning chaos", "Audit anxiety"],
        channels: ["LinkedIn", "Slack communities", "Google search"],
        quote: "I need something the whole team adopts without a training session.",
      },
      {
        name: "Alex Chen",
        role: "Freelancer / consultant",
        age: 27,
        bio: "Sells outcomes to multiple clients and needs to look bigger than a one-person shop.",
        goals: ["Handle more clients", "Premium deliverables", "Recurring revenue"],
        pains: ["Context switching between clients", "Unbillable admin time"],
        channels: ["Indie Hackers", "Discord", "TikTok"],
        quote: "Every hour saved is an hour I can bill.",
      },
    ],
    rice: [
      { feature: "Core workflow automation", reach: 10, impact: 9, confidence: 90, effort: 3 },
      { feature: "Onboarding with guided example", reach: 9, impact: 8, confidence: 85, effort: 1 },
      { feature: "Dashboard & saved history", reach: 8, impact: 6, confidence: 80, effort: 2 },
      { feature: "Stripe billing + free tier", reach: 10, impact: 8, confidence: 95, effort: 2 },
      { feature: "Team workspaces", reach: 5, impact: 7, confidence: 60, effort: 4 },
      { feature: "Zapier integration", reach: 4, impact: 6, confidence: 65, effort: 2 },
      { feature: "Public API", reach: 3, impact: 5, confidence: 50, effort: 3 },
    ],
    landingPage: {
      headline: `Stop wasting hours on ${(input.idea.split(" ").slice(0, 4).join(" ") || "manual work").toLowerCase()}`,
      subheadline: `The fastest way for ${audience} to get it done — automated, accurate, and ready in minutes.`,
      bullets: [
        "Set up in under 5 minutes — no tutorials needed",
        "Automates the entire workflow end-to-end",
        "Professional, shareable results every time",
        "Free to start. Upgrade when it pays for itself.",
      ],
      cta: "Start free — no credit card",
      socialProof: `Join 500+ ${audience} already saving 6+ hours a week`,
    },
    pitchDeck: [
      { title: "The Problem", bullets: [`${audience} lose hours weekly to a manual, error-prone workflow`, "Existing tools are bloated, generic, or both", "The cost is invisible until you measure it"] },
      { title: "The Solution", bullets: ["A purpose-built tool that automates the workflow end-to-end", "Value in the first session — no setup, no training", "AI-native by default"] },
      { title: "Market", bullets: ["Multi-billion dollar TAM across the industry", "Reachable SMB niche as the wedge", "Bottom-up, self-serve adoption"] },
      { title: "Business Model", bullets: [`$${monthly}/mo subscription, annual at 2 months free`, "Freemium with usage caps", "Expansion via seats and add-ons"] },
      { title: "Go-To-Market", bullets: ["Community-led launch → SEO compounding", "Free viral side-tools feeding the funnel", "Partnerships with niche media"] },
      { title: "Traction & Roadmap", bullets: ["MVP in 5 weeks", "First 100 users via founder-led sales", "$10k MRR target in 12 months"] },
      { title: "The Ask", bullets: ["Bootstrapped-friendly; optional pre-seed for growth", "Funds go to content engine and integrations", "Clear path to profitability at ~350 subscribers"] },
    ],
    investorSummary: `A focused micro-SaaS attacking a high-frequency workflow for ${audience}. Validation signals: pain ${pain}/10, frequency ${frequency}/10, clear gaps left by bloated incumbents. Wedge strategy: own one workflow, price at $${monthly}/mo self-serve, grow through community + SEO with near-zero CAC. Break-even at roughly 350 subscribers; verdict score ${verdictScore}/100 (${label}).`,
    revenueAssumptions: {
      startingCustomers: 10,
      monthlyGrowthPct: 22,
      churnPct: 5,
      fixedCostsMonthly: 800,
      variableCostPerCustomer: 3,
    },
  };
}

export function deriveIndustry(report: ValidationReport): string {
  return report.targetCustomer.industry;
}

export function deriveTags(input: IdeaInput, report: ValidationReport): string[] {
  const tags: string[] = [];
  const text = (input.idea + " " + input.audience).toLowerCase();
  if (/\bai\b|gpt|llm|automat/.test(text)) tags.push("AI");
  if (/b2b|business|company|team/.test(text)) tags.push("B2B");
  else tags.push("B2C");
  if (report.pricing.model.toLowerCase().includes("freemium")) tags.push("Freemium");
  if (report.verdict.score >= 75) tags.push("High potential");
  tags.push("Micro SaaS");
  return tags.slice(0, 4);
}
