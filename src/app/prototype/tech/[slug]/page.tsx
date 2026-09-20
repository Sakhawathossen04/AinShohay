"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { TECHS, SCENARIOS, FLOWS } from "@/data/caseData";
import { TECH_COMPONENTS } from "@/components/tech/TechDemo";

const SLUG_MAP: Record<string, string> = {
  "lawyer-inactivity": "T1",
  jurisdiction: "T2",
  "related-incidents": "T3",
  duplicates: "T4",
  "intake-agent": "T5",
  "document-agent": "T6",
  "settlement-drafting": "T7",
  triage: "T8",
  "offline-sync": "T9",
  pwa: "T10",
  "e-signature": "T11",
  referral: "T2",
};

const ANCHOR_SCENARIO: Record<string, string> = {
  T1: "A5", T2: "A3", T3: "A5", T4: "A1", T5: "A1", T6: "A4", T7: "A3", T8: "A3", T9: "A4", T10: "A4", T11: "A3",
};

export default function TechDemoPage() {
  const params = useParams<{ slug: string }>();
  const { pick, lang } = useI18n();
  const tid = SLUG_MAP[params.slug] ?? "T1";
  const tech = TECHS.find((t) => t.id === tid)!;
  const Demo = TECH_COMPONENTS[tid];
  const scenario = SCENARIOS.find((s) => s.id === ANCHOR_SCENARIO[tid]);
  const flows = FLOWS.filter((f) => f.covers.includes(tid));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-xs text-[#7d99ac] mb-4" aria-label="Breadcrumb">
        <Link href="/prototype" className="hover:underline">{pick("প্রোটোটাইপ", "Prototype")}</Link>
        <span className="mx-1.5">›</span>
        <Link href="/prototype/tech" className="hover:underline">{pick("প্রযুক্তি চ্যালেঞ্জ", "Tech challenges")}</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[#134970] font-semibold">{tech.id}</span>
      </nav>

      <div className="rounded-3xl bg-gradient-to-r from-[#134970] to-[#1d7bb8] text-white p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">{tech.id} · {pick("লাইভ ডেমো", "Live Demo")}</p>
        <h1 className="mt-1.5 text-xl sm:text-2xl font-extrabold">{tech.title[lang]}</h1>
        <p className="mt-2 text-sm text-white/85">{tech.build[lang]}</p>
        <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-bold">
          <span className="rounded-full bg-white/15 ring-1 ring-white/25 px-2.5 py-1">⚓ {tech.anchor}</span>
          {scenario && <span className="rounded-full bg-white/15 ring-1 ring-white/25 px-2.5 py-1">{scenario.id} · {scenario.name[lang]}</span>}
          {flows.map((f) => <span key={f.id} className="rounded-full bg-white/15 ring-1 ring-white/25 px-2.5 py-1">{f.id} · {f.title[lang]}</span>)}
        </div>
      </div>

      <div className="mt-6">
        {Demo ? <Demo /> : <p className="text-sm text-[#5c7a8e]">{pick("ডেমো পাওয়া যায়নি — T-হাব পেজ দেখুন।", "Demo not found — see the T-hub page.")}</p>}
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <Link href="/prototype/tech" className="rounded-2xl bg-white ring-1 ring-[#dbe7f0] px-5 py-4 text-sm font-bold text-[#134970] hover:bg-[#f2f8fc] text-center">
          ← {pick("সব প্রযুক্তি চ্যালেঞ্জ", "All tech challenges")}
        </Link>
        <Link href="/prototype/coverage" className="rounded-2xl bg-white ring-1 ring-[#dbe7f0] px-5 py-4 text-sm font-bold text-[#134970] hover:bg-[#f2f8fc] text-center">
          ✅ {pick("২৩ আইটেম কভারেজ", "23-item coverage")}
        </Link>
      </div>
    </div>
  );
}
