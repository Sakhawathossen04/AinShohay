"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { TOOLS } from "@/data/tools";

export default function ToolboxPage() {
  const { pick, lang } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#134970]">🧰 {pick("ফরম টুলবক্স", "Form Toolbox")}</h1>
      <p className="mt-3 max-w-2xl text-[15px] text-[#4a6b82] leading-relaxed">
        {pick(
          "সহজ প্রশ্নের উত্তর দিন — সাইট প্রিন্টযোগ্য আবেদন/অভিযোগ/নোটিশ তৈরি করে দেবে, জমা দেওয়ার স্থান ও পরবর্তী ধাপসহ।",
          "Answer simple questions — the site generates a printable application/complaint/notice, with where to submit and next steps."
        )}
      </p>
      <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((t) => (
          <li key={t.slug}>
            <Link href={`/toolbox/${t.slug}`} className="block h-full rounded-2xl border border-[#efe3c8] bg-gradient-to-b from-[#fdf9ef] to-white p-5 hover:shadow-lg hover:shadow-[#8a6410]/5 hover:-translate-y-0.5 transition-all">
              <span aria-hidden className="text-2xl">{t.icon}</span>
              <h2 className="mt-2 font-bold text-[#6b5310] text-[15px]">{t.title[lang]}</h2>
              <p className="mt-1.5 text-xs text-[#8a6410] leading-relaxed">{t.purpose[lang]}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-bold">
                <span className="rounded-full bg-[#f2f8fc] text-[#33546b] px-2 py-0.5">⏱ {t.time[lang]}</span>
                <span className="rounded-full bg-[#eff8f3] text-[#22694c] px-2 py-0.5">💰 {t.feeNote[lang]}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
