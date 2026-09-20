"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { SCENARIOS, DOORS, FLOWS } from "@/data/caseData";

const FLOW_LABEL: Record<string, string> = {
  F1: "নিরাপদ ইনটেক",
  F2: "অফলাইন ইনটেক",
  F3: "DLAO অপারেশন",
  F4: "মেডিয়েশন",
  F5: "জরুরি রেফারেল",
  F6: "আইনজীবী জবাবদিহি",
};

const PERSONA_ICON: Record<string, string> = { A1: "🧕", A2: "👨‍🦯", A3: "👩‍🎓", A4: "Mountain?", A5: "👴" };

export default function ScenariosPage() {
  const { pick, lang, t } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#1d7bb8]">Part A — {pick("নাগরিক দৃশ্যপট", "Citizen Scenarios")}</p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#134970]">
        {pick("পাঁচজন নাগরিক, পাঁচ বাস্তব বাধা — এক শেয়ার্ড রেকর্ড", "Five Citizens, Five Real Barriers — One Shared Record")}
      </h1>
      <p className="mt-3 max-w-3xl text-[15px] text-[#4a6b82] leading-relaxed">
        {pick(
          "প্রতিটি পরিস্থিতি বাংলাদেশের মাঠ-বাস্তবতা থেকে নেওয়া। নিচে প্রতিটি কেসে সিস্টেম কীভাবে বাধা অতিক্রম করে তার প্রমাণ ও ব্যর্থতা পরীক্ষা দেওয়া আছে — জুরি যেকোনো একটি লাইভ চেক করতে পারেন।",
          "Each situation mirrors a real field constraint in Bangladesh. Below, every case shows how the system overcomes the barrier, with evidence and failure tests — the jury can live-check any of them."
        )}
      </p>

      <ul className="mt-8 space-y-6">
        {SCENARIOS.map((s) => (
          <li key={s.id} className="rounded-3xl border border-[#dbe7f0] bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-[#134970] to-[#1d7bb8] text-white px-6 py-5 flex flex-wrap items-center gap-3">
              <span aria-hidden className="text-2xl">{PERSONA_ICON[s.id] === "Mountain?" ? "🧗" : PERSONA_ICON[s.id]}</span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">{s.id} · {s.place}</p>
                <h2 className="text-lg font-bold">{s.name[lang]}</h2>
              </div>
              <span className="ml-auto rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25">
                {s.barrier[lang]}
              </span>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#7d99ac]">{pick("পরিস্থিতি", "Situation")}</h3>
                <p className="mt-2 text-sm text-[#2b4557] leading-relaxed">{s.situation[lang]}</p>

                <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-[#7d99ac]">{pick("সমাধানযোগ্য", "Must be solved")}</h3>
                <ul className="mt-2 space-y-1.5">
                  {s.mustSolve.map((m, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#2b4557]">
                      <span className="text-[#1d7bb8] font-bold" aria-hidden>›</span> {m[lang]}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#7d99ac]">{pick("ন্যূনতম প্রমাণ", "Minimum evidence")}</h3>
                <ul className="mt-2 space-y-2">
                  {s.evidence.map((e, i) => (
                    <li key={i} className="rounded-xl bg-[#eff8f3] border border-[#d3ecdf] px-3.5 py-2.5 text-sm text-[#22694c]">
                      ✓ {e}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl bg-[#fdf0ef] border border-[#f3d2ce] px-3.5 py-2.5 text-sm text-[#a94442]">
                  ⚠️ {s.failureTest[lang]}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.doors.map((d) => {
                    const door = DOORS.find((x) => x.id === d)!;
                    return (
                      <span key={d} className="rounded-full bg-[#e8f2f9] px-2.5 py-1 text-[11px] font-semibold text-[#134970]">
                        {door.icon} {pick(door.bn, door.en)}
                      </span>
                    );
                  })}
                  {s.flowIds.map((f) => {
                    const flow = FLOWS.find((x) => x.id === f)!;
                    return (
                      <Link key={f} href="/prototype/flows" className="rounded-full bg-[#fdf3dd] px-2.5 py-1 text-[11px] font-semibold text-[#8a6410] hover:bg-[#faeccb]">
                        {f}: {t({ bn: FLOW_LABEL[f] ?? flow.title.bn, en: FLOW_LABEL[f] ? (f === "F1" ? "Safe intake" : f === "F2" ? "Offline intake" : f === "F3" ? "DLAO ops" : f === "F4" ? "Mediation" : f === "F5" ? "Referral" : "Lawyer accountability") : flow.title.en })} →
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
