"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { TECHS } from "@/data/caseData";
import { TECH_COMPONENTS } from "@/components/tech/TechDemo";

const DEMO_LABEL: Record<string, { bn: string; en: string }> = {
  "/prototype/tech/lawyer-inactivity": { bn: "মালেকের কেস", en: "Malek's case" },
  "/prototype/tech/jurisdiction": { bn: "রহিম মিয়ার কেস", en: "Rahim Mia's case" },
  "/prototype/tech/related-incidents": { bn: "সালমা ও সহকর্মী", en: "Salma & co-workers" },
  "/prototype/tech/duplicates": { bn: "ডুপ্লিকেট কিউ", en: "Duplicate queue" },
  "/prototype/tech/intake-agent": { bn: "ভয়েস/চ্যাট ইনটেক", en: "Voice/chat intake" },
  "/prototype/tech/document-agent": { bn: "নথি ব্রিফিং", en: "Document briefing" },
  "/prototype/tech/settlement-drafting": { bn: "মিডিয়েশন খসড়া", en: "Mediation draft" },
  "/prototype/tech/triage": { bn: "দৈনিক কিউ", en: "Daily queue" },
  "/prototype/tech/offline-sync": { bn: "UDC অফলাইন", en: "UDC offline" },
  "/prototype/tech/pwa": { bn: "PWA/লাইট মোড", en: "PWA/light mode" },
  "/prototype/tech/e-signature": { bn: "সেটেলমেন্ট সই", en: "Settlement signing" },
  "/prototype/tech/referral": { bn: "নাবিলার রেফারেল", en: "Nabila's referral" },
};

export default function TechPage() {
  const { pick, lang } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#1d7bb8]">Part C — {pick("প্রযুক্তিগত চ্যালেঞ্জ", "Technical Challenges")}</p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#134970]">
        {pick("১১টি প্রযুক্তি চ্যালেঞ্জ — লাইভ ডেমোসহ", "11 Technical Challenges — With Live Demos")}
      </h1>
      <p className="mt-3 max-w-3xl text-[15px] text-[#4a6b82] leading-relaxed">
        {pick(
          "প্রতিটি মডিউল একই DLAS রেকর্ডে লেখে — আলাদা মিনি-সিস্টেম নয়। প্রতিটি কার্ডে সমস্যা, বিল্ড, গ্রহণযোগ্যতা পরীক্ষা ও গার্ডরেইল দেওয়া আছে।",
          "Every module writes to the same DLAS record — no mini-systems. Each card shows problem, build, acceptance test and guardrail."
        )}
      </p>
      <ul className="mt-8 space-y-4">
        {TECHS.map((t) => {
          const Demo = TECH_COMPONENTS[t.id];
          return (
            <li key={t.id} className="rounded-3xl border border-[#dbe7f0] bg-white overflow-hidden">
              <div className="px-6 py-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-xl bg-[#134970] text-white px-3 py-1.5 text-xs font-extrabold">{t.id}</span>
                  <h2 className="font-bold text-[#134970] text-lg">{t.title[lang]}</h2>
                  <span className="text-xs text-[#7d99ac]">⚓ {t.anchor}</span>
                </div>
                <div className="mt-4 grid md:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-[11px] font-bold uppercase text-[#a94442]">{pick("সমস্যা", "Problem")}</p><p className="mt-1 text-[#4a6b82] leading-relaxed">{t.problem[lang]}</p></div>
                  <div><p className="text-[11px] font-bold uppercase text-[#134970]">{pick("বিল্ড", "Build")}</p><p className="mt-1 text-[#4a6b82] leading-relaxed">{t.build[lang]}</p></div>
                  <div><p className="text-[11px] font-bold uppercase text-[#1c6b43]">{pick("গ্রহণযোগ্যতা", "Acceptance")}</p><p className="mt-1 text-[#4a6b82] leading-relaxed">{t.acceptance[lang]}</p></div>
                  <div><p className="text-[11px] font-bold uppercase text-[#8a6410]">{pick("গার্ডরেইল", "Guardrail")}</p><p className="mt-1 text-[#4a6b82] leading-relaxed">{t.guardrail[lang]}</p></div>
                </div>
                <div className="mt-4">
                  <Link href={t.demo} className="inline-flex items-center gap-1.5 rounded-xl bg-[#e8f2f9] px-4 py-2 text-xs font-bold text-[#134970] hover:bg-[#d8e9f5]">
                    ▶ {pick("লাইভ ডেমো:", "Live demo:")} {pick(DEMO_LABEL[t.demo]?.bn ?? "", DEMO_LABEL[t.demo]?.en ?? "")} →
                  </Link>
                </div>
              </div>
              {Demo && <div className="border-t border-[#eef3f7] bg-[#fbfdfe] px-6 py-5"><Demo /></div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
