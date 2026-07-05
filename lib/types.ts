export type VerdictLabel =
  | "Build it"
  | "Build carefully"
  | "Pivot"
  | "Don't build";

export type IdeaStatus = "Validated" | "In Progress" | "Parked" | "Building";

export interface ScoreDetail {
  score: number; // 1-10
  explanation: string;
}

export interface Competitor {
  name: string;
  doesWell: string;
  weaknesses: string;
}

export interface Persona {
  name: string;
  role: string;
  age: number;
  bio: string;
  goals: string[];
  pains: string[];
  channels: string[];
  quote: string;
}

export interface RiceItem {
  feature: string;
  reach: number; // 1-10
  impact: number; // 1-10
  confidence: number; // 0-100 (%)
  effort: number; // person-weeks
}

export interface DeckSlide {
  title: string;
  bullets: string[];
}

export interface ValidationReport {
  ideaSummary: string;
  problemScore: {
    pain: ScoreDetail;
    urgency: ScoreDetail;
    frequency: ScoreDetail;
  };
  targetCustomer: {
    idealCustomer: string;
    industry: string;
    companySize: string;
    buyingBehavior: string;
    onlineHangouts: string[];
  };
  competition: {
    competitors: Competitor[];
    marketGaps: string[];
    differentiation: string[];
  };
  marketSize: {
    tam: string;
    sam: string;
    som: string;
    reasoning: string;
  };
  pricing: {
    monthly: number; // USD per month
    annual: number; // USD per year
    model: string; // "Freemium" | "Paid only" etc. with reasoning
    willingnessToPay: string;
    reasoning: string;
  };
  mvpRoadmap: {
    coreFeatures: string[];
    niceToHave: string[];
    buildOrder: string[];
  };
  gtm: {
    first100: string[];
    first1000: string[];
    organicGrowth: string[];
    contentStrategy: string[];
    communities: string[];
    coldOutreach: string[];
  };
  risks: {
    biggestRisks: string[];
    whyStartupsFail: string[];
    technicalRisks: string[];
    businessRisks: string[];
  };
  verdict: {
    score: number; // 0-100
    label: VerdictLabel;
    explanation: string;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  leanCanvas: {
    problem: string[];
    solution: string[];
    keyMetrics: string[];
    uniqueValueProposition: string;
    unfairAdvantage: string;
    channels: string[];
    customerSegments: string[];
    costStructure: string[];
    revenueStreams: string[];
  };
  businessModelCanvas: {
    keyPartners: string[];
    keyActivities: string[];
    keyResources: string[];
    valuePropositions: string[];
    customerRelationships: string[];
    channels: string[];
    customerSegments: string[];
    costStructure: string[];
    revenueStreams: string[];
  };
  personas: Persona[];
  rice: RiceItem[];
  landingPage: {
    headline: string;
    subheadline: string;
    bullets: string[];
    cta: string;
    socialProof: string;
  };
  pitchDeck: DeckSlide[];
  investorSummary: string;
  revenueAssumptions: {
    startingCustomers: number;
    monthlyGrowthPct: number;
    churnPct: number;
    fixedCostsMonthly: number;
    variableCostPerCustomer: number;
  };
}

/* ---------- Build My Startup ---------- */

export type TaskCategory =
  | "Frontend"
  | "Backend"
  | "Database"
  | "API"
  | "Authentication"
  | "Payments"
  | "Emails"
  | "Testing"
  | "Deployment";

export interface BuildTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  done: boolean;
}

export interface CodeFile {
  path: string;
  language: string;
  description: string;
  code: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
}

export interface BuilderPrompt {
  title: string;
  category: string;
  prompt: string;
}

export interface BuildBlueprint {
  prd: {
    overview: string;
    goals: string[];
    nonGoals: string[];
    successMetrics: string[];
  };
  userStories: string[];
  featureList: { name: string; priority: "MVP" | "V2"; description: string }[];
  databaseSchema: string; // SQL
  userFlows: { name: string; steps: string[] }[];
  apiArchitecture: ApiEndpoint[];
  authFlow: string[];
  fileStructure: string; // ascii tree
  techStack: { layer: string; choice: string; why: string }[];
}

export interface BuildPages {
  landing: {
    headline: string;
    subheadline: string;
    bullets: string[];
    cta: string;
  };
  pricingTiers: { name: string; price: string; features: string[] }[];
  faq: { q: string; a: string }[];
  terms: string;
  privacy: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
  };
  blogIdeas: string[];
}

export interface BuildLaunch {
  productHunt: {
    name: string;
    tagline: string;
    description: string;
    firstComment: string;
  };
  xPosts: string[];
  linkedinPosts: string[];
  redditStrategy: { subreddit: string; angle: string }[];
  coldEmails: { subject: string; body: string }[];
  waitlistPage: { headline: string; subheadline: string; cta: string };
  demoScript: string[];
  investorPitch: string;
}

export type BuildSectionId =
  | "blueprint"
  | "tasks"
  | "project"
  | "code"
  | "prompts"
  | "pages"
  | "launch";

// The AI-designed specification the full codebase is generated from.
export interface ProjectSpec {
  appName: string;
  tagline: string;
  description: string;
  accentColor: string; // hex
  resultNoun: string; // what the core workflow produces, e.g. "report"
  inputFields: {
    id: string;
    label: string;
    placeholder: string;
    type: "text" | "textarea";
  }[];
  exampleInput: Record<string, string>;
  corePrompt: string; // system+task prompt of the generated product, with {{fieldId}} placeholders
  resultSections: string[]; // headings the core output is organized into
}

export interface BuildProject {
  spec: ProjectSpec;
  files: CodeFile[];
}

export interface BuildKit {
  blueprint: BuildBlueprint;
  tasks: BuildTask[];
  project?: BuildProject | null;
  code: CodeFile[];
  prompts: BuilderPrompt[];
  pages: BuildPages;
  launch: BuildLaunch;
  generatedAt: string; // ISO
}

export interface IdeaInput {
  idea: string;
  audience: string;
  website?: string;
  competitors?: string;
}

export interface SavedIdea {
  id: string;
  title: string;
  input: IdeaInput;
  report: ValidationReport;
  createdAt: string; // ISO
  status: IdeaStatus;
  industry: string;
  tags: string[];
  build?: BuildKit | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
