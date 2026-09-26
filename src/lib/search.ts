import type { Bi, Lang, Topic, Tool } from "./types";

export type SearchHit = {
  type: "topic" | "tool";
  slug: string;
  href: string;
  title: string;
  snippet: string;
  icon: string;
  score: number;
};

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreText(text: string, q: string): number {
  const t = norm(text);
  if (!t) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  // token overlap
  const tokens = q.split(" ").filter(Boolean);
  let hits = 0;
  for (const tok of tokens) if (t.includes(tok)) hits++;
  return hits === tokens.length && tokens.length > 1 ? 40 : hits > 0 ? 20 : 0;
}

function biScore(b: Bi, q: string, lang: Lang): number {
  const a = scoreText(b.bn, q);
  const e = scoreText(b.en, q);
  return (lang === "bn" ? a + e * 0.6 : e + a * 0.6);
}

const TOPIC_KEYWORDS: Record<string, string[]> = {
  maintenance: ["ভরণপোষণ", "রক্ষণাবেক্ষণ", "স্বামী", "সন্তান", "maintenance"],
  dower: ["দেনমোহর", "তলাক", "যৌতুক", "তালাক", "divorce", "dower"],
  land: ["জমি", "খতিয়ান", "দাখিলা", "নামজারি", "উচ্ছেদ", "land", "khatian"],
  wage: ["মজুরি", "শ্রমিক", "কারখানা", "বেতন", "wage", "labour"],
  harassment: ["নিপীড়ন", "হয়রানি", "নির্যাতন", "মামলা", "harassment"],
  consumer: ["ভোগ্যপণ্য", "জালিয়াতি", "মামলা", "complaint", "consumer"],
  cyber: ["সাইবার", "ফেসবুক", "ছবি", "অপমান", "cyber", "blackmail"],
};

export function searchAll(q: string, topics: Topic[], tools: Tool[], lang: Lang): SearchHit[] {
  const query = norm(q);
  if (query.length < 2) return [];
  const hits: SearchHit[] = [];

  for (const topic of topics) {
    let s = biScore(topic.title, query, lang) + biScore(topic.short, query, lang) * 0.7 + biScore(topic.intro, query, lang) * 0.3;
    for (const kw of TOPIC_KEYWORDS[topic.slug] ?? []) s += scoreText(kw, query) * 0.5;
    for (const step of topic.steps) s += biScore(step.title, query, lang) * 0.2;
    for (const f of topic.faq) s += biScore(f.q, query, lang) * 0.3 + biScore(f.a, query, lang) * 0.15;
    if (s > 12)
      hits.push({
        type: "topic",
        slug: topic.slug,
        href: `/topics/${topic.slug}`,
        title: topic.title[lang],
        snippet: topic.short[lang],
        icon: topic.icon,
        score: s,
      });
  }

  for (const tool of tools) {
    let s = biScore(tool.title, query, lang) + biScore(tool.purpose, query, lang) * 0.7;
    for (const step of tool.steps) s += biScore(step.title, query, lang) * 0.2;
    for (const w of tool.where) s += scoreText(w[lang], query) * 0.3;
    if (s > 12)
      hits.push({
        type: "tool",
        slug: tool.slug,
        href: `/toolbox/${tool.slug}`,
        title: tool.title[lang],
        snippet: tool.purpose[lang],
        icon: tool.icon,
        score: s,
      });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, 8);
}
