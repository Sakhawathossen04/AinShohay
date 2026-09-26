"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { TOPIC_GROUPS, TOPICS } from "@/data/topics";

export default function TopicsPage() {
  const { pick, lang } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#134970]">{pick("বিষয়ভিত্তিক আইনি গাইড", "Legal Guides by Topic")}</h1>
      <p className="mt-3 max-w-2xl text-[15px] text-[#4a6b82] leading-relaxed">
        {pick(
          "বাংলাদেশের আইন ও প্রক্রিয়া অনুযায়ী সাজানো ধাপে ধাপে গাইড — প্রতিটিতে প্রয়োজনীয় কাগজ, খরচ, সময় ও সাধারণ প্রশ্নের উত্তর।",
          "Step-by-step guides aligned with Bangladeshi law and process — each with required papers, cost, timelines and FAQs."
        )}
      </p>

      {TOPIC_GROUPS.map((g) => {
        const list = TOPICS.filter((t) => t.group === g.id);
        if (list.length === 0) return null;
        return (
          <section key={g.id} className="mt-9" aria-labelledby={`grp-${g.id}`}>
            <h2 id={`grp-${g.id}`} className="flex items-center gap-2 text-lg font-bold text-[#134970]">
              <span aria-hidden>{g.icon}</span> {pick(g.bn, g.en)}
            </h2>
            <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((t) => (
                <li key={t.slug}>
                  <Link href={`/topics/${t.slug}`} className="block h-full rounded-2xl border border-[#dbe7f0] bg-white p-5 hover:shadow-lg hover:shadow-[#0f3350]/5 hover:-translate-y-0.5 transition-all">
                    <span aria-hidden className="text-2xl">{t.icon}</span>
                    <h3 className="mt-2 font-bold text-[#134970] text-[15px]">{t.title[lang]}</h3>
                    <p className="mt-1.5 text-xs text-[#5c7a8e] leading-relaxed">{t.short[lang]}</p>
                    <span className="mt-3 inline-block text-xs font-bold text-[#1d7bb8]">{pick("পড়ুন", "Read")} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
