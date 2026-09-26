"use client";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { searchAll, type SearchHit } from "@/lib/search";
import { TOPICS } from "@/data/topics";
import { TOOLS } from "@/data/tools";
import { cx } from "@/lib/utils";

export default function SearchBox() {
  const { lang, pick, t } = useI18n();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const hits: SearchHit[] = useMemo(() => searchAll(q, TOPICS, TOOLS, lang), [q, lang]);

  const show = focused && q.trim().length >= 2;

  return (
    <div ref={boxRef} className="relative w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 rounded-2xl bg-white shadow-lg shadow-[#0f3350]/10 ring-1 ring-[#dbe7f0] px-4 py-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b8ba3" strokeWidth="2" strokeLinecap="round" className="shrink-0">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          type="search"
          className="w-full bg-transparent outline-none text-[15px] text-[#134970] placeholder:text-[#8aa7ba]"
          placeholder={pick("আপনার সমস্যা লিখুন — যেমন: ভরণপোষণ, জমি, বেতন…", "Describe your problem — e.g. maintenance, land, wages…")}
          aria-label={pick("সাইট সার্চ", "Site search")}
        />
      </div>
      {show && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl bg-white shadow-xl ring-1 ring-[#dbe7f0] overflow-hidden">
          {hits.length === 0 ? (
            <p className="px-4 py-5 text-sm text-[#5c7a8e]">
              {pick("কিছু পাওয়া যায়নি — অন্য শব্দে চেষ্টা করুন।", "Nothing found — try different words.")}
            </p>
          ) : (
            <ul className="max-h-80 overflow-auto divide-y divide-[#eef3f7]">
              {hits.map((h) => (
                <li key={h.href}>
                  <Link
                    href={h.href}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[#f2f8fc] transition-colors"
                    onClick={() => setQ("")}
                  >
                    <span aria-hidden className="text-xl leading-none mt-0.5">{h.icon}</span>
                    <span>
                      <span className="block text-sm font-semibold text-[#134970]">{h.title}</span>
                      <span className="block text-xs text-[#5c7a8e] line-clamp-1">{h.snippet}</span>
                      <span className={cx("mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        h.type === "topic" ? "bg-[#e3f0e9] text-[#22694c]" : "bg-[#fdf3dd] text-[#8a6410]")}>
                        {h.type === "topic" ? pick("গাইড", "Guide") : pick("টুল", "Tool")}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="bg-[#f6fafc] px-4 py-2 text-[11px] text-[#7d99ac]">
            {t({ bn: "টিপ: হেল্পলাইন ১৬৬৯৯-এ কল করেও সাহায্য নিতে পারেন", en: "Tip: you can also get help by calling helpline 16699" })}
          </div>
        </div>
      )}
    </div>
  );
}
