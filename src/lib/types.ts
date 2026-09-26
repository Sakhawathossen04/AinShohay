export type Lang = "bn" | "en";
export type Bi = { bn: string; en: string };

export interface TopicStep {
  title: Bi;
  body: Bi;
  tips?: Bi[];
}

export interface DocItem {
  name: Bi;
  required: boolean;
  note?: Bi;
}

export interface Topic {
  slug: string;
  icon: string;
  group: TopicGroupId;
  title: Bi;
  short: Bi;
  intro: Bi;
  steps: TopicStep[];
  docs: DocItem[];
  faq: { q: Bi; a: Bi }[];
  lawRefs: string[];
}

export type TopicGroupId = "family" | "land" | "labour" | "money" | "violence" | "consumer" | "cyber";

export interface ToolStep {
  id: string;
  title: Bi;
  help: Bi;
  fields: ToolField[];
}

export interface ToolField {
  id: string;
  label: Bi;
  type: "text" | "textarea" | "select" | "date" | "tel" | "radio";
  options?: Bi[];
  required?: boolean;
  hint?: Bi;
}

export interface Tool {
  slug: string;
  icon: string;
  title: Bi;
  purpose: Bi;
  time: Bi;
  feeNote: Bi;
  steps: ToolStep[];
  where: Bi[];
  outcome: Bi;
}

export interface Center {
  id: string;
  district: string;
  name: Bi;
  kind: "dlao" | "udc" | "ngo" | "helpline";
  phone: string;
  hours: Bi;
}

export interface Scenario {
  id: string; // A1..A5
  name: Bi;
  place: string;
  barrier: Bi;
  situation: Bi;
  mustSolve: Bi[];
  evidence: string[];
  failureTest: Bi;
  doors: string[];
  flowIds: string[];
}

export interface ProviderRole {
  id: string; // B1..B7
  role: Bi;
  today: Bi;
  outcome: Bi;
  evidence: string[];
  console: string; // route of the role view in the prototype
}

export interface TechChallenge {
  id: string; // T1..T11
  title: Bi;
  problem: Bi;
  build: Bi;
  acceptance: Bi;
  guardrail: Bi;
  anchor: string;
  demo: string; // route of the live demo module
}

export interface Flow {
  id: string; // F1..F6
  title: Bi;
  covers: string[];
  summary: Bi;
  stages: { label: Bi; detail: Bi; actor: string; writes: string }[];
}

export interface GoldenThread {
  id: string; // G1..G10
  title: Bi;
  pass: Bi;
}

export interface ChatIntent {
  id: string;
  patterns: RegExp[];
  answer: Bi;
  suggestions: { bn: string[]; en: string[] };
  action?: { label: Bi; href: string };
}
