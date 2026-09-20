"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { TOPICS } from "@/data/topics";
import { TOOLS } from "@/data/tools";

const TOOL_MATCH: Record<string, string[]> = {
  maintenance: ["maintenance-application"],
  "divorce-dower": ["divorce-notice"],
  "land-disputes": ["land-complaint"],
  "labour-wages": ["wage-claim"],
  "cyber-harassment": ["cyber-complaint"],
  "consumer-rights": ["consumer-complaint"],
  "helpline-16699": [],
  "harassment-violence": ["cyber-complaint"],
};

export default function TopicPage() {
  const params = useParams<{ slug: string }>();
  const { pick, lang } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const topic = TOPICS.find((t) => t.slug === params.slug);
  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg font-bold text-[#134970]">{pick("গাইড পাওয়া যায়নি", "Guide not found")}</p>
        <Link href="/topics" className="mt-3 inline-block text-sm font-bold text-[#1d7bb8] hover:underline">← {pick("সব গাইড", "All guides")}</Link>
      </div>
    );
  }

  const relatedTools = TOOLS.filter((t) => (TOOL_MATCH[topic.slug] ?? []).includes(t.slug));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-xs text-[#7d99ac] mb-4" aria-label="Breadcrumb">
        <Link href="/" className="hover:underline">{pick("হোম", "Home")}</Link>
        <span className="mx-1.5">›</span>
        <Link href="/topics" className="hover:underline">{pick("বিষয়সমূহ", "Topics")}</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[#134970] font-semibold">{topic.title[lang]}</span>
      </nav>

      <header className="flex items-start gap-4">
        <span aria-hidden className="text-4xl">{topic.icon}</span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#134970]">{topic.title[lang]}</h1>
          <p className="mt-2 text-[15px] text-[#4a6b82] leading-relaxed">{topic.intro[lang]}</p>
        </div>
      </header>

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {relatedTools.map((t) => (
          <Link key={t.slug} href={`/toolbox/${t.slug}`} className="flex items-center justify-between rounded-2xl bg-[#fdf9ef] ring-1 ring-[#efe3c8] px-5 py-4 hover:bg-[#faf1dc] transition-colors">
            <span className="flex items-center gap-2.5 text-sm font-bold text-[#6b5310]">
              <span aria-hidden className="text-lg">{t.icon}</span> {t.title[lang]}
            </span>
            <span aria-hidden>→</span>
          </Link>
        ))}
      </div>

      {/* Steps */}
      <section className="mt-10" aria-labelledby="steps-h">
        <h2 id="steps-h" className="text-xl font-bold text-[#134970]">{pick("ধাপে ধাপে প্রক্রিয়া", "Step-by-step process")}</h2>
        <ol className="mt-5 space-y-0">
          {topic.steps.map((s, i) => (
            <li key={i} className="relative pl-12 pb-8 last:pb-0">
              {i < topic.steps.length - 1 && <span aria-hidden className="absolute left-[17px] top-10 bottom-0 w-0.5 bg-[#dbe7f0]" />}
              <span className="absolute left-0 top-0 w-9 h-9 rounded-full bg-[#134970] text-white grid place-items-center text-sm font-extrabold">{i + 1}</span>
              <h3 className="font-bold text-[#134970] text-[16px]">{s.title[lang]}</h3>
              <p className="mt-1.5 text-sm text-[#4a6b82] leading-relaxed">{s.body[lang]}</p>
              {s.tips && (
                <ul className="mt-2 space-y-1">
                  {s.tips.map((tip, j) => (
                    <li key={j} className="text-xs text-[#8a6410] bg-[#fdf9ef] rounded-lg px-3 py-1.5">💡 {tip[lang]}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </section>

      <div className="grid md:grid-cols-2 gap-5 mt-4">
        {/* Documents */}
        <section className="rounded-3xl border border-[#dbe7f0] bg-white p-6" aria-labelledby="docs-h">
          <h2 id="docs-h" className="text-lg font-bold text-[#134970]">📄 {pick("প্রয়োজনীয় কাগজপত্র", "Required documents")}</h2>
          <ul className="mt-4 space-y-2.5">
            {topic.docs.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className={d.required ? "text-[#a94442]" : "text-[#7d99ac]"} aria-hidden>{d.required ? "●" : "○"}</span>
                <span className="text-[#2b4557]">
                  {d.name[lang]}
                  {!d.required && <span className="text-[11px] text-[#8aa7ba]"> ({pick("ঐচ্ছিক", "optional")})</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-[#7d99ac]">● {pick("বাধ্যতামূলক", "Required")} &nbsp; ○ {pick("সহায়ক", "Helpful")}</p>
        </section>

        {/* Laws */}
        <section className="rounded-3xl border border-[#dbe7f0] bg-white p-6" aria-labelledby="law-h">
          <h2 id="law-h" className="text-lg font-bold text-[#134970]">⚖️ {pick("প্রাসঙ্গিক আইন", "Relevant laws")}</h2>
          <ul className="mt-4 space-y-2">
            {topic.lawRefs.map((l, i) => (
              <li key={i} className="text-sm text-[#2b4557] bg-[#f2f8fc] rounded-xl px-3.5 py-2.5">{l}</li>
            ))}
          </ul>
          <Link href="/centers" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#1d7bb8] hover:underline">
            📍 {pick("কোথায় সাহায্য পাবেন", "Where to get help")} →
          </Link>
        </section>
      </div>

      {/* FAQ */}
      <section className="mt-10" aria-labelledby="faq-h">
        <h2 id="faq-h" className="text-xl font-bold text-[#134970]">❓ {pick("সাধারণ প্রশ্ন", "Common questions")}</h2>
        <div className="mt-4 space-y-2.5">
          {topic.faq.map((f, i) => (
            <div key={i} className="rounded-2xl border border-[#dbe7f0] bg-white overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                aria-expanded={openFaq === i}
              >
                <span className="text-sm font-bold text-[#134970]">{f.q[lang]}</span>
                <span aria-hidden className={`text-[#1d7bb8] transition-transform ${openFaq === i ? "rotate-180" : ""}`}>▾</span>
              </button>
              {openFaq === i && <p className="px-5 pb-4 text-sm text-[#4a6b82] leading-relaxed">{f.a[lang]}</p>}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 rounded-3xl bg-[#134970] text-white p-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm max-w-md">{pick("পরের ধাপ নিশ্চিত নয়? হেল্পলাইনে কল করুন অথবা নিকটস্থ কেন্দ্রে যান — বিনামূল্যে।", "Unsure of the next step? Call the helpline or visit a nearby center — free of cost.")}</p>
        <div className="flex gap-2.5">
          <a href="tel:16699" className="rounded-xl bg-[#e8b23a] px-4 py-2.5 text-sm font-bold text-[#3d2e07]">📞 16699</a>
          <Link href="/centers" className="rounded-xl bg-white/12 ring-1 ring-white/25 px-4 py-2.5 text-sm font-bold hover:bg-white/20">{pick("কেন্দ্র খুঁজুন", "Find a center")}</Link>
        </div>
      </div>
    </div>
  );
}
