"use client";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { TOPIC_GROUPS, TOPICS } from "@/data/topics";
import { TOOLS } from "@/data/tools";
import { cx } from "@/lib/utils";

type Level = { kind: "group"; id: string } | { kind: "topic"; id: string } | null;

const TOOL_MATCH: Record<string, string[]> = {
  family: ["maintenance-application", "divorce-notice"],
  land: ["land-complaint"],
  labour: ["wage-claim"],
  cyber: ["cyber-complaint"],
  consumer: ["consumer-complaint"],
  money: ["maintenance-application"],
  violence: ["cyber-complaint"],
};

export default function ResourceLibrary() {
  const { pick, t, lang } = useI18n();
  const [level, setLevel] = useState<Level>(null);

  const group = level?.kind === "group" ? TOPIC_GROUPS.find((g) => g.id === level.id) : null;
  const topic = level?.kind === "topic" ? TOPICS.find((x) => x.slug === level.id) : null;
  const groupTopics = level?.kind === "group" ? TOPICS.filter((x) => x.group === level.id) : [];
  const groupTools = level?.kind === "group" ? TOOLS.filter((x) => (TOOL_MATCH[level.id] ?? []).includes(x.slug)) : [];

  const breadcrumbs =
    level?.kind === "group"
      ? [{ label: pick("সব বিষয়", "All topics"), go: () => setLevel(null) }, { label: pick(group!.bn, group!.en) }]
      : level?.kind === "topic"
        ? [{ label: pick("সব বিষয়", "All topics"), go: () => setLevel(null) },
           { label: pick(TOPIC_GROUPS.find((g) => g.id === topic!.group)!.bn, TOPIC_GROUPS.find((g) => g.id === topic!.group)!.en), go: () => setLevel({ kind: "group", id: topic!.group }) },
           { label: topic!.title[lang] }]
        : [{ label: pick("সব বিষয়", "All topics") }];

  return (
    <section aria-labelledby="resource-library-title" className="rounded-3xl bg-white ring-1 ring-[#dbe7f0] shadow-sm p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 id="resource-library-title" className="text-xl font-bold text-[#134970]">
            {pick("স্ব-সহায়তা রিসোর্স লাইব্রেরি", "Self-Help Resource Library")}
          </h2>
          <p className="text-sm text-[#5c7a8e] mt-1">
            {pick("বিষয় বেছে নিন → সাব-ক্যাটাগরি → গাইড ও টুল — সব বাংলাদেশের প্রেক্ষাপটে।", "Pick a category → sub-category → guides & tools — all in the Bangladesh context.")}
          </p>
        </div>
        {level && (
          <nav className="flex items-center gap-1.5 text-xs font-medium text-[#5c7a8e]" aria-label="Breadcrumb">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>›</span>}
                {b.go ? (
                  <button className="hover:text-[#134970] underline decoration-dotted underline-offset-2" onClick={b.go}>{b.label}</button>
                ) : (
                  <span className="text-[#134970] font-semibold">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Level 0: categories */}
      {!level && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {TOPIC_GROUPS.map((g) => {
            const count = TOPICS.filter((x) => x.group === g.id).length;
            return (
              <li key={g.id}>
                <button
                  onClick={() => setLevel({ kind: "group", id: g.id })}
                  className="w-full text-left rounded-2xl border border-[#dbe7f0] bg-[#f6fafc] hover:bg-[#e8f2f9] hover:border-[#b7d3e5] p-4 transition-all group"
                >
                  <span aria-hidden className="text-2xl block mb-2">{g.icon}</span>
                  <span className="block font-semibold text-sm text-[#134970]">{pick(g.bn, g.en)}</span>
                  <span className="block text-[11px] text-[#7d99ac] mt-0.5">
                    {t({ bn: `${count}টি গাইড`, en: `${count} guides` })} →
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Level 1: topics + tools of a group */}
      {level?.kind === "group" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[#33546b] uppercase tracking-wide mb-3">{pick("গাইড", "Guides")}</h3>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupTopics.map((tp) => (
                <li key={tp.slug}>
                  <button
                    onClick={() => setLevel({ kind: "topic", id: tp.slug })}
                    className="w-full text-left rounded-2xl border border-[#dbe7f0] hover:border-[#b7d3e5] bg-white hover:bg-[#f2f8fc] p-4 transition-all"
                  >
                    <span aria-hidden className="text-xl block mb-1.5">{tp.icon}</span>
                    <span className="block font-semibold text-sm text-[#134970]">{tp.title[lang]}</span>
                    <span className="block text-xs text-[#5c7a8e] mt-1 line-clamp-2">{tp.short[lang]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {groupTools.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#33546b] uppercase tracking-wide mb-3">{pick("সংশ্লিষ্ট টুল", "Related tools")}</h3>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupTools.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/toolbox/${tool.slug}`}
                      className="block rounded-2xl border border-[#efe3c8] bg-[#fdf9ef] hover:bg-[#faf1dc] p-4 transition-all"
                    >
                      <span aria-hidden className="text-xl block mb-1.5">{tool.icon}</span>
                      <span className="block font-semibold text-sm text-[#6b5310]">{tool.title[lang]}</span>
                      <span className="block text-xs text-[#8a6410] mt-1">{pick("ফরম পূরণ করুন", "Fill the form")} →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Level 2: inside a topic */}
      {level?.kind === "topic" && topic && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-[#f2f8fc] border border-[#dbe7f0] p-4">
            <p className="text-sm text-[#33546b] leading-relaxed">{topic.intro[lang]}</p>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            <li>
              <Link href={`/topics/${topic.slug}`} className="flex items-center justify-between rounded-2xl bg-[#134970] text-white px-4 py-3.5 font-semibold text-sm hover:bg-[#0f3b5c] transition-colors">
                {pick("সম্পূর্ণ গাইড পড়ুন", "Read the full guide")} <span aria-hidden>→</span>
              </Link>
            </li>
            <li>
              <Link href="/centers" className="flex items-center justify-between rounded-2xl border border-[#dbe7f0] px-4 py-3.5 font-semibold text-sm text-[#134970] hover:bg-[#f2f8fc] transition-colors">
                {pick("কোথায় সাহায্য পাব?", "Where to get help?")} <span aria-hidden>→</span>
              </Link>
            </li>
          </ul>
          <div>
            <h3 className="text-sm font-bold text-[#33546b] uppercase tracking-wide mb-3">{pick("প্রধান ধাপগুলো", "Main steps")}</h3>
            <ol className="space-y-2.5">
              {topic.steps.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-[#e4eef4] p-3">
                  <span className={cx("shrink-0 w-7 h-7 rounded-full grid place-items-center text-xs font-bold",
                    i === 0 ? "bg-[#134970] text-white" : "bg-[#e8f2f9] text-[#134970]")}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#134970]">{s.title[lang]}</p>
                    <p className="text-xs text-[#5c7a8e] mt-0.5 leading-relaxed">{s.body[lang]}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}
