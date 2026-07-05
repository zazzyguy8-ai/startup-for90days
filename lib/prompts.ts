import type { IdeaInput } from "./types";

export const REPORT_SYSTEM_PROMPT = `You are a brutally honest startup validation analyst with deep expertise in micro-SaaS, bootstrapped businesses, pricing, and go-to-market strategy. You produce structured JSON validation reports. Be specific, realistic, and opinionated — never generic. Use concrete numbers, named channels, and real competitor names when you know them. Respond ONLY with valid JSON matching the schema provided. No markdown, no commentary.`;

export function buildReportPrompt(input: IdeaInput): string {
  return `Validate this startup idea and return JSON exactly matching this TypeScript shape (all fields required):

{
  "ideaSummary": string (2-3 sentences),
  "problemScore": { "pain": {"score": 1-10, "explanation": string}, "urgency": {...}, "frequency": {...} },
  "targetCustomer": { "idealCustomer": string, "industry": string, "companySize": string, "buyingBehavior": string, "onlineHangouts": string[] },
  "competition": { "competitors": [{"name": string, "doesWell": string, "weaknesses": string}] (3-5), "marketGaps": string[], "differentiation": string[] },
  "marketSize": { "tam": string, "sam": string, "som": string, "reasoning": string },
  "pricing": { "monthly": number, "annual": number, "model": string, "willingnessToPay": string, "reasoning": string },
  "mvpRoadmap": { "coreFeatures": string[], "niceToHave": string[], "buildOrder": string[] },
  "gtm": { "first100": string[], "first1000": string[], "organicGrowth": string[], "contentStrategy": string[], "communities": string[], "coldOutreach": string[] },
  "risks": { "biggestRisks": string[], "whyStartupsFail": string[], "technicalRisks": string[], "businessRisks": string[] },
  "verdict": { "score": 0-100, "label": "Build it" | "Build carefully" | "Pivot" | "Don't build", "explanation": string },
  "swot": { "strengths": string[], "weaknesses": string[], "opportunities": string[], "threats": string[] },
  "leanCanvas": { "problem": string[], "solution": string[], "keyMetrics": string[], "uniqueValueProposition": string, "unfairAdvantage": string, "channels": string[], "customerSegments": string[], "costStructure": string[], "revenueStreams": string[] },
  "businessModelCanvas": { "keyPartners": string[], "keyActivities": string[], "keyResources": string[], "valuePropositions": string[], "customerRelationships": string[], "channels": string[], "customerSegments": string[], "costStructure": string[], "revenueStreams": string[] },
  "personas": [{"name": string, "role": string, "age": number, "bio": string, "goals": string[], "pains": string[], "channels": string[], "quote": string}] (exactly 3),
  "rice": [{"feature": string, "reach": 1-10, "impact": 1-10, "confidence": 0-100, "effort": number (person-weeks)}] (6-8 features),
  "landingPage": { "headline": string, "subheadline": string, "bullets": string[] (4), "cta": string, "socialProof": string },
  "pitchDeck": [{"title": string, "bullets": string[] (3)}] (exactly 7 slides: Problem, Solution, Market, Business Model, Go-To-Market, Traction & Roadmap, The Ask),
  "investorSummary": string (one dense paragraph),
  "revenueAssumptions": { "startingCustomers": number, "monthlyGrowthPct": number, "churnPct": number, "fixedCostsMonthly": number, "variableCostPerCustomer": number }
}

STARTUP IDEA: ${input.idea}
TARGET AUDIENCE: ${input.audience}
${input.website ? `WEBSITE / LANDING PAGE: ${input.website}` : ""}
${input.competitors ? `KNOWN COMPETITORS: ${input.competitors}` : ""}

Verdict scoring guide: 75-100 = "Build it", 55-74 = "Build carefully", 38-54 = "Pivot", 0-37 = "Don't build". Be honest — most ideas should NOT score above 80.`;
}

export const VERIFY_SYSTEM_PROMPT = `You are a skeptical venture partner doing a second-pass review of a startup validation report written by a junior analyst. Your job is to VERIFY and CORRECT it:
- Lower any score that isn't justified by the reasoning given (most ideas are NOT 8+/10 on every dimension).
- Sanity-check TAM/SAM/SOM — correct numbers that don't follow from the reasoning.
- Replace any generic, could-apply-to-anything advice with advice specific to THIS idea and audience.
- Make the verdict consistent with the corrected scores (75-100 "Build it", 55-74 "Build carefully", 38-54 "Pivot", 0-37 "Don't build").
- Keep everything that is already correct. Do not change the JSON structure.
Return ONLY the full corrected JSON report. No commentary.`;

export const BUILD_SYSTEM_PROMPT = `You are a senior startup CTO and product builder. You don't give advice — you produce complete, production-quality deliverables: PRDs, schemas, code, task boards, marketing copy and launch assets. Be specific and opinionated. Assume the stack: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (auth + Postgres with RLS) + Stripe + OpenAI. Respond ONLY with valid JSON matching the schema provided. No markdown fences, no commentary.`;

const BUILD_SECTION_SCHEMAS: Record<string, string> = {
  blueprint: `{
  "prd": { "overview": string (1 paragraph), "goals": string[] (4), "nonGoals": string[] (4), "successMetrics": string[] (4) },
  "userStories": string[] (6-8, "As a … I can … so that …"),
  "featureList": [{"name": string, "priority": "MVP" | "V2", "description": string}] (7-10),
  "databaseSchema": string (complete Postgres/Supabase SQL: tables, RLS policies, indexes, comments),
  "userFlows": [{"name": string, "steps": string[]}] (3 flows),
  "apiArchitecture": [{"method": string, "path": string, "description": string}] (8-10 endpoints),
  "authFlow": string[] (5-6 steps describing the Supabase auth architecture),
  "fileStructure": string (ascii tree of the repo),
  "techStack": [{"layer": string, "choice": string, "why": string}] (7-8)
}`,
  project: `{
  "appName": string (short brandable product name, one word + optional suffix),
  "tagline": string (max 70 chars),
  "description": string (1-2 sentence product description for meta tags),
  "accentColor": string (hex color fitting the brand, e.g. "#6366f1"),
  "resultNoun": string (what one unit of core output is called, e.g. "report", "plan", "brief" — lowercase single word),
  "inputFields": [{"id": string (camelCase), "label": string, "placeholder": string, "type": "text"|"textarea"}] (2-4 fields the user fills to run the core workflow),
  "exampleInput": object (one realistic example value per field id),
  "corePrompt": string (the production system+task prompt of THIS product: role, product promise, then the user's values via {{fieldId}} placeholders for every field, then precise output instructions),
  "resultSections": string[] (3-5 headings the core output is organized into)
}`,
  tasks: `[{"id": string (t1, t2…), "title": string, "description": string (concrete, actionable), "category": "Frontend"|"Backend"|"Database"|"API"|"Authentication"|"Payments"|"Emails"|"Testing"|"Deployment", "done": false}] (18-22 tasks in build order, covering every category)`,
  code: `[{"path": string, "language": "typescript"|"tsx"|"sql", "description": string, "code": string (complete, production-ready file — no placeholders like TODO)}] (6-8 key files: supabase server client, usage metering, core AI API route, stripe checkout, stripe webhook, paywall component, prompt templates)`,
  prompts: `[{"title": string, "category": string, "prompt": string (a complete, self-contained prompt for an AI coding tool like Cursor/Claude Code/Lovable — must include product context, stack, design language, and precise acceptance criteria)}] (8-10 prompts in implementation order)`,
  pages: `{
  "landing": {"headline": string, "subheadline": string, "bullets": string[] (4), "cta": string},
  "pricingTiers": [{"name": string, "price": string, "features": string[]}] (2-3 tiers),
  "faq": [{"q": string, "a": string}] (6),
  "terms": string (complete numbered terms of service, plain text),
  "privacy": string (complete privacy policy, plain text),
  "seo": {"title": string, "description": string, "keywords": string[], "ogTitle": string, "ogDescription": string},
  "blogIdeas": string[] (8)
}`,
  launch: `{
  "productHunt": {"name": string, "tagline": string (max 60 chars), "description": string, "firstComment": string (founder's launch comment)},
  "xPosts": string[] (5 ready-to-post tweets),
  "linkedinPosts": string[] (3 full posts),
  "redditStrategy": [{"subreddit": string, "angle": string}] (4),
  "coldEmails": [{"subject": string, "body": string (with {{placeholders}})}] (2),
  "waitlistPage": {"headline": string, "subheadline": string, "cta": string},
  "demoScript": string[] (timestamped beats for a 60-90s demo video),
  "investorPitch": string (one dense paragraph)
}`,
};

export function buildRevisePrompt(
  specJson: string,
  instruction: string,
  input: IdeaInput
): string {
  return `You are the AI builder behind a startup-building product. The user is looking at their generated app and gave you an instruction to change it.

CURRENT PROJECT SPEC (JSON):
${specJson}

STARTUP CONTEXT: ${input.idea.slice(0, 200)} — for ${input.audience}

USER INSTRUCTION: "${instruction}"

Apply the instruction to the spec. You may change: appName, tagline, description, accentColor, resultNoun, inputFields, exampleInput, corePrompt, resultSections. Keep everything the user didn't ask to change. The corePrompt must keep {{fieldId}} placeholders matching inputFields ids.

Return JSON exactly: { "spec": <the full updated ProjectSpec>, "changes": string[] (short human-readable list of what you changed) }`;
}

export function buildKitSectionPrompt(
  section: string,
  input: IdeaInput,
  reportJson: string
): string {
  return `We validated this startup idea and are now building the MVP.

STARTUP IDEA: ${input.idea}
TARGET AUDIENCE: ${input.audience}
${input.website ? `WEBSITE: ${input.website}` : ""}
${input.competitors ? `COMPETITORS: ${input.competitors}` : ""}

VALIDATION REPORT (context): ${reportJson.slice(0, 5000)}

Generate the "${section}" deliverable. Return JSON exactly matching:
${BUILD_SECTION_SCHEMAS[section]}`;
}

export function buildChatSystemPrompt(ideaTitle: string, reportJson: string): string {
  return `You are a sharp startup advisor discussing the startup idea "${ideaTitle}". You have full context from this validation report: ${reportJson.slice(0, 6000)}. Give concise, actionable, honest answers. Push back on bad assumptions. Keep answers under 200 words unless asked for detail.`;
}
