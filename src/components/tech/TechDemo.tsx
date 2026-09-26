"use client";
import { useState, type ComponentType } from "react";
import { useI18n } from "@/lib/i18n";
import { useDLAS } from "@/lib/dlasStore";
import { cx, digitsFor } from "@/lib/utils";

/* ── Shared UI bits ─────────────────────────────────────────── */

function DemoShell({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-3xl border border-[#dbe7f0] bg-white p-5 sm:p-7">
      {children}
      {note && (
        <p className="mt-5 text-xs text-[#7d99ac] bg-[#f6fafc] rounded-xl px-3.5 py-2.5 leading-relaxed">ℹ️ {note}</p>
      )}
    </div>
  );
}

function Btn({ children, onClick, tone = "primary", disabled }: { children: React.ReactNode; onClick?: () => void; tone?: "primary" | "ghost" | "warn" | "ok"; disabled?: boolean }) {
  const tones = {
    primary: "bg-[#134970] text-white hover:bg-[#0f3b5c]",
    ghost: "ring-1 ring-[#c9dcea] text-[#134970] hover:bg-[#f2f8fc]",
    warn: "bg-[#c0392b] text-white hover:bg-[#a93226]",
    ok: "bg-[#1d7bb8] text-white hover:bg-[#156a9e]",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={cx("rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-40", tones[tone])}>
      {children}
    </button>
  );
}

function Tag({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "red" | "gold" | "grey" }) {
  const tones = {
    blue: "bg-[#e8f2f9] text-[#134970]",
    green: "bg-[#eff8f3] text-[#22694c]",
    red: "bg-[#fdf0ef] text-[#a94442]",
    gold: "bg-[#fdf3dd] text-[#8a6410]",
    grey: "bg-[#f0f4f7] text-[#5c7a8e]",
  };
  return <span className={cx("inline-block rounded-full px-2.5 py-1 text-[11px] font-bold", tones[tone])}>{children}</span>;
}

function useCase(id: string) {
  const { cases } = useDLAS();
  return cases.find((c) => c.id === id)!;
}

/* ── T1: Lawyer inactivity ──────────────────────────────────── */

export function T1LawyerInactivity() {
  const { lang, pick } = useI18n();
  const { patchCase } = useDLAS();
  const c = useCase("CASE-240131");
  const [missed, setMissed] = useState(2);
  const [alertRaised, setAlertRaised] = useState(true);
  const [reassigned, setReassigned] = useState(false);
  const [paid, setPaid] = useState(false);

  return (
    <DemoShell note={pick("গার্ডরেইল: প্যাটার্ন অ্যালার্ট কেবল পর্যালোচনা ট্রিগার করে — অসদাচরণ প্রমাণ বা অর্থ কাটার সিদ্ধান্ত নয়।", "Guardrail: pattern detection triggers review only — it does not establish misconduct or recoverable amounts.")}>
      <h2 className="text-lg font-bold text-[#134970]">T1 · {pick("আইনজীবীর নীরবতা ট্র্যাকার", "Lawyer Inactivity Tracker")}</h2>
      <p className="text-sm text-[#5c7a8e] mt-1">{c.title} — {c.district}</p>

      <div className="mt-5 grid sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[#f6fafc] ring-1 ring-[#e4eef4] p-4 text-center">
          <p className="text-3xl font-extrabold text-[#c0392b]">{digitsFor(missed, lang)}</p>
          <p className="text-xs font-semibold text-[#5c7a8e] mt-1">{pick("মিসড আপডেট", "Missed updates")}</p>
        </div>
        <div className="rounded-2xl bg-[#f6fafc] ring-1 ring-[#e4eef4] p-4 text-center">
          <p className="text-3xl font-extrabold text-[#8a6410]">{alertRaised ? "🔔" : "—"}</p>
          <p className="text-xs font-semibold text-[#5c7a8e] mt-1">{pick("প্যাটার্ন অ্যালার্ট", "Pattern alert")}</p>
        </div>
        <div className="rounded-2xl bg-[#f6fafc] ring-1 ring-[#e4eef4] p-4 text-center">
          <p className="text-3xl font-extrabold text-[#1d7bb8]">{reassigned ? "✅" : "—"}</p>
          <p className="text-xs font-semibold text-[#5c7a8e] mt-1">{pick("পুনর্বণ্টন", "Reassigned")}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Btn tone="warn" onClick={() => { const m = missed + 1; setMissed(m); if (m >= 2) setAlertRaised(true); }}>
          {pick("আইনজীবীর আপডেট মিস সিমুলেট", "Simulate missed update")}
        </Btn>
        <Btn tone="ok" onClick={() => { setReassigned(true); patchCase(c.id, { tasks: c.tasks.map((t) => (t.id === "T-7" ? { ...t, done: true } : t)) }, { actor: "DLAO", role: "কর্মকর্তা", action: "প্যানেল আইনজীবী পুনর্বণ্টন", detail: "মানব পর্যালোচনা সিদ্ধান্ত", channel: "office" }); }}>
          {pick("DLAO পর্যালোচনা ও পুনর্বণ্টন", "DLAO review & reassign")}
        </Btn>
        <Btn tone="ghost" onClick={() => setPaid(true)}>{pick("স্টেজ-ভিত্তিক পেমেন্ট রিকনসিলিয়েশন", "Stage payment reconciliation")}</Btn>
      </div>

      <ol className="mt-5 space-y-2 text-sm">
        {[
          { ok: missed >= 2, bn: "নাগরিক আইনজীবী-পরিবর্তন অনুরোধ করেছেন", en: "Citizen filed lawyer-change request" },
          { ok: alertRaised, bn: "২+ মিসে প্যাটার্ন অ্যালার্ট (আলাদা রিভিউ কিউ)", en: "Pattern alert raised at 2+ misses (separate review queue)" },
          { ok: reassigned, bn: "কর্মকর্তার মানব পর্যালোচনায় পুনর্বণ্টন ও অডিট এন্ট্রি", en: "Officer reassigned after human review, audit written" },
          { ok: paid, bn: "পেমেন্ট-স্ট্যাটাস আপডেট রেকর্ডে", en: "Payment-status reconciled on the record" },
        ].map((s, i) => (
          <li key={i} className={cx("flex items-center gap-2.5 rounded-xl px-3.5 py-2.5", s.ok ? "bg-[#eff8f3] text-[#22694c]" : "bg-[#f6fafc] text-[#8aa7ba]")}>
            <span aria-hidden>{s.ok ? "✅" : "⬜"}</span> {pick(s.bn, s.en)}
          </li>
        ))}
      </ol>
    </DemoShell>
  );
}

/* ── T2: Jurisdiction tug-of-war ────────────────────────────── */

export function T2Jurisdiction() {
  const { pick } = useI18n();
  const [returns, setReturns] = useState(0);
  const [escalated, setEscalated] = useState(false);
  const [decision, setDecision] = useState<string | null>(null);

  return (
    <DemoShell note={pick("গার্ডরেইল: সিস্টেম এসকেলেট করে; আইনগত জুরিসডিকশন সিদ্ধান্ত অনুমোদিত মানুষই নেন।", "Guardrail: the system escalates; the legal jurisdiction decision stays with an authorised human.")}>
      <h2 className="text-lg font-bold text-[#134970]">T2 · {pick("জুরিসডিকশন টানাটানি", "Jurisdiction Tug-of-War")}</h2>
      <p className="text-sm text-[#5c7a8e] mt-1">{pick("রহিম মিয়া — ক্ষতিপূরণ মামলা: DLAO ↔ লেবার লিগ্যাল এইড সেল", "Rahim Mia — compensation matter: DLAO ↔ Labour Legal Aid Cell")}</p>

      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f6fafc] ring-1 ring-[#e4eef4] p-4">
        <span className="font-bold text-[#134970] text-sm">DLAO</span>
        <div className="flex-1 h-1.5 rounded-full bg-[#dbe7f0] relative overflow-visible">
          <span className="absolute -top-2 text-lg transition-all" style={{ left: `${Math.min(returns * 40, 90)}%` }} aria-hidden>📦</span>
        </div>
        <span className="font-bold text-[#134970] text-sm">{pick("লেবার সেল", "Labour Cell")}</span>
      </div>
      <p className="mt-2 text-xs text-[#5c7a8e]">{pick(`ফেরত/রিটার্ন: ${returns} বার`, `Returned: ${returns} time(s)`)}</p>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Btn tone="warn" onClick={() => { const r = returns + 1; setReturns(r); if (r >= 2) setEscalated(true); }}>
          {pick("রিটার্ন সিমুলেট (কারণসহ)", "Simulate return (with reason)")}
        </Btn>
        {escalated && !decision && (
          <>
            <Btn onClick={() => setDecision("DLAO")}>DLAO {pick("রাখুন", "retains")}</Btn>
            <Btn onClick={() => setDecision(pick("লেবার সেল", "Labour Cell"))}>{pick("লেবার সেলে পাঠান", "Route to Labour Cell")}</Btn>
          </>
        )}
      </div>

      {escalated && (
        <div className="mt-4 rounded-2xl bg-[#fdf3dd] ring-1 ring-[#efe3c8] px-4 py-3 text-sm text-[#8a6410]">
          ⚠️ {pick("২টি রিটার্নের পর এসকেলেশন — অনুমোদিত কর্মকর্তার চূড়ান্ত রাউটিং সিদ্ধান্ত অপেক্ষমাণ।", "Two returns detected — escalated. Awaiting final routing decision by an authorised officer.")}
        </div>
      )}
      {decision && (
        <div className="mt-4 rounded-2xl bg-[#eff8f3] ring-1 ring-[#d3ecdf] px-4 py-3 text-sm text-[#22694c]">
          ✅ {pick(`চূড়ান্ত সিদ্ধান্ত (মানব):`, "Final human decision:")} <strong>{decision}</strong> — {pick("সিদ্ধান্ত ও কারণ অডিটে রেকর্ড হলো।", "Decision and reason recorded in the audit trail.")}
        </div>
      )}
    </DemoShell>
  );
}

/* ── T3: Related incidents ──────────────────────────────────── */

export function T3RelatedIncidents() {
  const { pick } = useI18n();
  const [uploaded, setUploaded] = useState(false);

  const linked = [
    { id: "CASE-240133", bn: "সালমা বেগম", en: "Salma Begum" },
    { id: "CASE-240134", bn: "রোকসানা আক্তার", en: "Roksana Akter" },
    { id: "CASE-240135", bn: "জুলেখা বেগম", en: "Julekha Begum" },
  ];

  return (
    <DemoShell note={pick("গার্ডরেইল: লিংক করা হয়, মার্জ নয়। গোপনীয়তা, নির্দেশনা ও ফলাফল কেস-নির্দিষ্ট থাকে।", "Guardrail: linked, never merged. Confidentiality, instructions and outcomes remain case-specific.")}>
      <h2 className="text-lg font-bold text-[#134970]">T3 · {pick("এক ঘটনা, একাধিক আবেদনকারী", "Multiple Applicants, One Incident")}</h2>
      <p className="text-sm text-[#5c7a8e] mt-1">{pick("কারখানার অগ্নিকাণ্ড — গাজীপুর; ৩টি আলাদা দাবি, শেয়ার্ড নিরাপত্তা রিপোর্ট।", "Factory fire — Gazipur; three separate claims, one shared safety report.")}</p>

      <ul className="mt-5 space-y-2">
        {linked.map((l, i) => (
          <li key={l.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e4eef4] px-4 py-3">
            <Tag tone="blue">{l.id}</Tag>
            <span className="text-sm font-semibold text-[#2b4557]">{pick(l.bn, l.en)}</span>
            {uploaded && i === 0 && <Tag tone="green">{pick("কমন প্রমাণ এখানে আপলোড", "common evidence uploaded here")}</Tag>}
            {uploaded && i > 0 && <Tag tone="gold">↗ {pick("শেয়ার্ড রেফারেন্স", "shared reference")}</Tag>}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {!uploaded ? (
          <Btn onClick={() => setUploaded(true)}>{pick("কমন প্রমাণ একবার আপলোড করুন", "Upload common evidence once")}</Btn>
        ) : (
          <Btn tone="ghost" onClick={() => setUploaded(false)}>{pick("রিসেট", "Reset")}</Btn>
        )}
      </div>
      {uploaded && (
        <div className="mt-4 rounded-2xl bg-[#eff8f3] ring-1 ring-[#d3ecdf] px-4 py-3 text-sm text-[#22694c]">
          ✅ {pick("১টি নথি, ৩টি রেকর্ডে রেফারেন্সড — কেস-নির্দিষ্ট তথ্য অবিভক্ত। গ্রুপ ভিউ সব ৩ কেস একসাথে দেখায়।", "One document referenced by three records — case-specific facts untouched. The group view shows all 3 cases together.")}
        </div>
      )}
    </DemoShell>
  );
}

/* ── T4: Duplicate detection ────────────────────────────────── */

const DEMO_PEOPLE = [
  { a: { bn: "মোসাম্মৎ সালমা বেগম, গাজীপুর, NID …4521", en: "Mst. Salma Begum, Gazipur, NID …4521" }, b: { bn: "সালমা বেগম, গাজীপুর, NID …4521", en: "Salma Begum, Gazipur, NID …4521" }, score: 96, dup: true },
  { a: { bn: "মোঃ রহিম মিয়া, বরিশাল, NID …7810", en: "Md. Rahim Mia, Barishal, NID …7810" }, b: { bn: "মোঃ রহিম উদ্দিন, বরিশাল, NID …3302", en: "Md. Rahim Uddin, Barishal, NID …3302" }, score: 61, dup: false },
  { a: { bn: "নুচিং মারমা, খাগড়াছড়ি, জন্ম ১৯৯৪", en: "Nuching Marma, Khagrachhari, b.1994" }, b: { bn: "নুচিং মারমা, খাগড়াছড়ি, জন্ম ১৯৯৪", en: "Nuching Marma, Khagrachhari, b.1994" }, score: 99, dup: true },
  { a: { bn: "আবদুল মালেক, বরগুনা, NID …9903", en: "Abdul Malek, Barguna, NID …9903" }, b: { bn: "আবদুল মালেক, পিরোজপুর, NID …1177", en: "Abdul Malek, Pirojpur, NID …1177" }, score: 44, dup: false },
];

export function T4Duplicates() {
  const { pick, lang } = useI18n();
  const [decisions, setDecisions] = useState<Record<number, string>>({});

  return (
    <DemoShell note={pick("গার্ডরেইল: কখনো অটো-রিজেক্ট, অটো-মার্জ বা 'প্রতারক' ট্যাগ নয় — শুধু পাশাপাশি মানব পর্যালোচনা।", "Guardrail: never auto-reject, auto-merge or label a person fraudulent — side-by-side human review only.")}>
      <h2 className="text-lg font-bold text-[#134970]">T4 · {pick("ডুপ্লিকেট / জালিয়াতি-ঝুঁকি শনাক্তকরণ", "Duplicate / Fraud-Risk Detection")}</h2>
      <p className="text-sm text-[#5c7a8e] mt-1">
        {pick("ফাজি ম্যাচিং: নাম + জেলা + NID + জন্মসন; কনফিডেন্স স্কোরসহ জুটি নিচে। ২টি ট্র্যাপ জুটি খেয়াল করুন।", "Fuzzy matching across name + district + NID + birth year; candidate pairs with confidence below. Note the two trap pairs.")}
      </p>
      <ul className="mt-5 space-y-3">
        {DEMO_PEOPLE.map((p, i) => {
          const d = decisions[i];
          return (
            <li key={i} className="rounded-2xl border border-[#e4eef4] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Tag tone={p.score >= 90 ? "red" : p.score >= 60 ? "gold" : "grey"}>{pick("স্কোর", "Score")} {digitsFor(p.score, lang)}%</Tag>
                <Tag tone={p.dup ? "red" : "green"}>{p.dup ? pick("সম্ভাব্য ডুপ্লিকেট", "likely duplicate") : pick("ট্র্যাপ: ভিন্ন মানুষ", "trap: different person")}</Tag>
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-[#f6fafc] px-3.5 py-2.5 text-[#2b4557]">{p.a[lang]}</div>
                <div className="rounded-xl bg-[#f6fafc] px-3.5 py-2.5 text-[#2b4557]">{p.b[lang]}</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { k: "dup", bn: "ডুপ্লিকেট নিশ্চিত", en: "Confirm duplicate" },
                  { k: "diff", bn: "ভিন্ন মানুষ", en: "Different person" },
                  { k: "pend", bn: "আরও তথ্য দরকার", en: "Need more info" },
                ].map((o) => (
                  <button
                    key={o.k}
                    onClick={() => setDecisions((prev) => ({ ...prev, [i]: o.k }))}
                    className={cx("rounded-lg px-3 py-1.5 text-xs font-bold ring-1 transition-colors",
                      d === o.k ? "bg-[#134970] text-white ring-[#134970]" : "bg-white text-[#33546b] ring-[#c9dcea] hover:bg-[#f2f8fc]")}
                    aria-pressed={d === o.k}
                  >
                    {pick(o.bn, o.en)}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-[#5c7a8e]">
        {pick(`মানব পর্যালোচনা: ${Object.keys(decisions).length}/৪ জুটি সিদ্ধান্ত হয়েছে — সব সিদ্ধান্ত অডিটে যায়।`, `Human review: ${Object.keys(decisions).length}/4 pairs decided — every decision is audited.`)}
      </p>
    </DemoShell>
  );
}

/* ── T5: Conversational intake ──────────────────────────────── */

export function T5IntakeAgent() {
  const { pick, lang } = useI18n();
  const [turn, setTurn] = useState(0);
  const [slots, setSlots] = useState<Record<string, string>>({});
  const [handoff, setHandoff] = useState(false);

  const SCRIPT = [
    { q: { bn: "আপনার সমস্যা কী সংক্ষেপে বলুন?", en: "Briefly, what is your problem?" }, key: "problem", example: { bn: "স্বামী ৬ মাস খরচ দেয়নি", en: "Husband hasn't paid maintenance for 6 months" } },
    { q: { bn: "আপনি কোন জেলায়?", en: "Which district are you in?" }, key: "district", example: { bn: "জয়পুরহাট", en: "Joypurhat" } },
    { q: { bn: "আবেদনকারীর নাম ও সম্পর্ক?", en: "Applicant's name and relation?" }, key: "name", example: { bn: "ময়ূরী আক্তার, আমি ভাই (রিপন)", en: "Moyuri Akter, I am her brother (Ripon)" } },
  ];

  const sensitive = (slots["problem"] ?? "").length > 0 && /চাপ|হুমকি|blackmail|threat|ছবি/i.test(slots["problem"] ?? "");

  return (
    <DemoShell note={pick("গার্ডরেইল: এজেন্ট প্রকাশিত নিয়ম ব্যাখ্যা করে, যোগ্যতা সিদ্ধান্ত নেয় না; প্রতিটি তথ্যের উৎস রেকর্ড হয়।", "Guardrail: the agent explains published rules and never decides eligibility; every fact's provenance is recorded.")}>
      <h2 className="text-lg font-bold text-[#134970]">T5 · {pick("কথোপকথনমূলক বাংলা ইনটেক", "Conversational Bangla Intake")}</h2>
      <p className="text-sm text-[#5c7a8e] mt-1">{pick("ফরম-উইজার্ডের বদলে স্বাভাবিক প্রশ্নোত্তর — স্লট পূরণ ও প্রক্রিয়া-সচেতন হ্যান্ডঅফসহ।", "Natural Q&A instead of a form wizard — slot filling with provenance-aware handoff.")}</p>

      <div className="mt-5 rounded-2xl bg-[#f6fafc] ring-1 ring-[#e4eef4] p-4 space-y-2.5 min-h-40">
        {SCRIPT.slice(0, turn).map((s, i) => (
          <div key={i} className="text-sm">
            <p className="font-semibold text-[#134970]">🤖 {s.q[lang]}</p>
            {slots[s.key] && <p className="text-[#2b4557] mt-0.5 ml-5">👤 {slots[s.key]} <Tag tone="grey">{pick("রেকর্ডেড", "recorded")}</Tag></p>}
          </div>
        ))}
        {turn < SCRIPT.length && (
          <p className="text-sm font-semibold text-[#134970]">🤖 {SCRIPT[turn].q[lang]}</p>
        )}
        {turn >= SCRIPT.length && (
          <p className="text-sm text-[#22694c]">✅ {pick("স্লট পূরণ সম্পন্ন — আবেদন খসড়া তৈরি, ময়ূরীর নিজস্ব নিশ্চিতকরণের জন্য কলব্যাক টাস্ক তৈরি হয়েছে।", "Slot filling complete — draft created; callback task raised for Moyuri's own confirmation.")}</p>
        )}
        {sensitive && (
          <div className="rounded-xl bg-[#fdf0ef] px-3.5 py-2.5 text-sm text-[#a94442]">
            ⚠️ {pick("সংবেদনশীল সংকেত শনাক্ত — DLAO কর্মকর্তার কাছে প্রসঙ্গসহ হ্যান্ডঅফ করা হবে (AI সিদ্ধান্ত নেবে না)।", "Sensitive signal detected — handing off to a DLAO officer with context (the AI does not decide).")}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {turn < SCRIPT.length ? (
          <Btn onClick={() => { setSlots((s) => ({ ...s, [SCRIPT[turn].key]: SCRIPT[turn].example[lang] })); setTurn((t) => t + 1); }}>
            {pick("নমুনা উত্তর দিন", "Give sample answer")}
          </Btn>
        ) : (
          <Btn tone="ghost" onClick={() => { setTurn(0); setSlots({}); setHandoff(false); }}>{pick("রিসেট", "Reset")}</Btn>
        )}
        {sensitive && !handoff && <Btn tone="warn" onClick={() => setHandoff(true)}>{pick("মানবের কাছে হ্যান্ডঅফ", "Hand off to human")}</Btn>}
      </div>
      {handoff && (
        <div className="mt-4 rounded-2xl bg-[#eff8f3] ring-1 ring-[#d3ecdf] px-4 py-3 text-sm text-[#22694c]">
          ✅ {pick("DLAO কিউতে যুক্ত: কে বলল, কী অনুবাদ/অনুমান হলো — সব প্রসঙ্গসহ।", "Added to the DLAO queue with full context: who said what, what was translated/inferred.")}
        </div>
      )}
    </DemoShell>
  );
}

/* ── T6: Document agent ─────────────────────────────────────── */

const DEMO_DOCS = [
  { bn: "বিবাহনামা (কাবিননামা)", en: "Kabinnama (marriage deed)", status: "ok" as const },
  { bn: "সন্তানের জন্মনিবন্ধন", en: "Child birth certificate", status: "ok" as const },
  { bn: "চিকিৎসা রিপোর্ট (আংশিক পাঠযোগ্য)", en: "Medical report (partly readable)", status: "unclear" as const },
  { bn: "NID কপি", en: "NID copy", status: "missing" as const },
  { bn: "ভূমি দাখিলা রসিদ", en: "Land tax receipt", status: "ok" as const },
  { bn: "পুলিশ GD কপি", en: "Police GD copy", status: "ok" as const },
];

export function T6DocumentAgent() {
  const { pick, lang } = useI18n();
  const [analysed, setAnalysed] = useState(false);

  return (
    <DemoShell note={pick("গার্ডরেইল: অস্পষ্ট জিনিস অনুমান করা হয় না — উন্মোচন করা হয়; কর্মকর্তা ব্রিফিং যাচাই করেন।", "Guardrail: unclear content is surfaced, never guessed; the officer verifies the briefing.")}>
      <h2 className="text-lg font-bold text-[#134970]">T6 · {pick("নথি ব্রিফিং ও চেকলিস্ট এজেন্ট", "Document Briefing & Checklist Agent")}</h2>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {!analysed ? (
          <Btn onClick={() => setAnalysed(true)}>{pick("৬টি নথি বিশ্লেষণ করুন", "Analyse 6 documents")}</Btn>
        ) : (
          <Btn tone="ghost" onClick={() => setAnalysed(false)}>{pick("রিসেট", "Reset")}</Btn>
        )}
      </div>
      {analysed && (
        <div className="mt-5 grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-[#f6fafc] ring-1 ring-[#e4eef4] p-4">
            <h3 className="text-sm font-bold text-[#134970] mb-2.5">📄 {pick("ব্রিফিং (সোর্স রেফারেন্সসহ)", "Briefing (with source references)")}</h3>
            <ul className="space-y-2 text-sm text-[#2b4557]">
              <li>• {pick("বিবাহ ২০১৯-সালে নিবন্ধিত — কাবিননামা পৃষ্ঠা ১ [সোর্স: DOC-1]", "Marriage registered 2019 — kabinnama p.1 [source: DOC-1]")}</li>
              <li>• {pick("১টি নাবালক সন্তান (২০২১) — জন্মনিবন্ধন [সোর্স: DOC-2]", "One minor child (2021) — birth certificate [source: DOC-2]")}</li>
              <li>• {pick("চিকিৎসা খরচের প্রমাণ আংশিক — পৃষ্ঠা ২ অস্পষ্ট [সোর্স: DOC-3 ⚠]", "Medical cost evidence partial — p.2 unclear [source: DOC-3 ⚠]")}</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-[#f6fafc] ring-1 ring-[#e4eef4] p-4">
            <h3 className="text-sm font-bold text-[#134970] mb-2.5">📋 {pick("ভরণপোষণ চেকলিস্ট", "Maintenance checklist")}</h3>
            <ul className="space-y-2 text-sm">
              {DEMO_DOCS.map((d, i) => (
                <li key={i} className="flex items-center gap-2">
                  {d.status === "ok" && <span className="text-[#22694c]" aria-hidden>✅</span>}
                  {d.status === "unclear" && <span aria-hidden>⚠️</span>}
                  {d.status === "missing" && <span aria-hidden>❌</span>}
                  <span className={d.status === "missing" ? "text-[#a94442] font-semibold" : "text-[#2b4557]"}>{d[lang]}</span>
                  {d.status === "missing" && <Tag tone="red">{pick("ঘাটতি", "missing")}</Tag>}
                  {d.status === "unclear" && <Tag tone="gold">{pick("অস্পষ্ট", "unclear")}</Tag>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </DemoShell>
  );
}

/* ── T7: Settlement drafting ────────────────────────────────── */

export function T7Settlement() {
  const { pick, lang } = useI18n();
  const [type, setType] = useState<"maintenance" | "property" | "labour">("maintenance");
  const [drafted, setDrafted] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  const DRAFTS: Record<string, { title: string; clauses: string[]; warn: string }> = {
    maintenance: {
      title: pick("ভরণপোষণ মীমাংসা খসড়া", "Draft maintenance settlement"),
      clauses: [
        pick("প্রতিবাদী প্রতি মাসের ১০ তারিখের মধ্যে ৬,০০০ টাকা ভরণপোষণ পরিশোধ করবেন। [AI-পূর্ণ]", "Respondent shall pay BDT 6,000 monthly maintenance by the 10th of each month. [AI-filled]"),
        pick("বকেয়া ৩৬,০০০ টাকা ৩ কিস্তিতে পরিশোধ হবে। [AI-অনুমিত]", "Arrears of BDT 36,000 payable in 3 instalments. [AI-inferred]"),
        pick("মিয়াদ পূর্তির পর পক্ষগুলো পারস্পরিক দাবি প্রত্যাহার করবে।", "On compliance, parties withdraw mutual claims."),
      ],
      warn: pick("অসঙ্গতি: কিস্তির সংখ্যা ও মোট বকেয়া মিলছে না (৩৬,০০০ ≠ ৩×১০,০০০) — মিডিয়েটর যাচাই করুন।", "Inconsistency: instalments and total arrears do not match (36,000 ≠ 3×10,000) — mediator must verify."),
    },
    property: {
      title: pick("সম্পত্তি বিভাজন মীমাংসা খসড়া", "Draft property settlement"),
      clauses: [
        pick("দাগ নং ৪৫২-এর ০.২৫ একর প্রতিপক্ষ গৃহীত করবে; বাকি অংশ আবেদনকারীর। [AI-পূর্ণ]", "Respondent keeps 0.25 acre of dag 452; the rest goes to the applicant. [AI-filled]"),
        pick("নামজারি ৬০ দিনের মধ্যে সম্পন্ন হবে। [AI-অনুমিত]", "Mutation completed within 60 days. [AI-inferred]"),
      ],
      warn: pick("অসঙ্গতি: দাগ নম্বর খতিয়ানের সঙ্গে মিলছে না — মৌজা ম্যাপ যাচাই করুন।", "Inconsistency: dag number does not match the khatian — verify the mouza map."),
    },
    labour: {
      title: pick("শ্রম মীমাংসা খসড়া", "Draft labour settlement"),
      clauses: [
        pick("মালিকপক্ষ বকেয়া বেতন ৪৮,০০০ টাকা ও ছাঁটাই ক্ষতিপূরণ পরিশোধ করবে। [AI-পূর্ণ]", "Management shall pay wage arrears of BDT 48,000 plus retrenchment compensation. [AI-filled]"),
        pick("পরিশোধের ৭ দিনের মধ্যে শ্রমিক পক্ষ অভিযোগ প্রত্যাহার করবে।", "Within 7 days of payment, the worker withdraws complaints."),
      ],
      warn: pick("অসঙ্গতি: ছাঁটাই ক্ষতিপূরণের হিসাব (৩০ দিনের মূল বেতন) যোগ হয়নি — যাচাই করুন।", "Inconsistency: retrenchment compensation (30 days' base pay) not added — verify."),
    },
  };
  const d = DRAFTS[type];

  return (
    <DemoShell note={pick("গার্ডরেইল: আউটপুট কেবল খসড়া — মানব আইনি পর্যালোচনা, পক্ষের সম্মতি ও আনুষ্ঠানিকতা বাধ্যতামূলক।", "Guardrail: output is only a draft — human legal review, party consent and formalities remain mandatory.")}>
      <h2 className="text-lg font-bold text-[#134970]">T7 · {pick("সেটেলমেন্ট ড্রাফটিং সহকারী", "Settlement Drafting Assistant")}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["maintenance", "property", "labour"] as const).map((k) => (
          <button key={k} onClick={() => { setType(k); setDrafted(false); setReviewed(false); }}
            className={cx("rounded-full px-3.5 py-2 text-xs font-bold", type === k ? "bg-[#134970] text-white" : "bg-white ring-1 ring-[#c9dcea] text-[#33546b]")}
            aria-pressed={type === k}>
            {k === "maintenance" ? pick("ভরণপোষণ", "Maintenance") : k === "property" ? pick("সম্পত্তি", "Property") : pick("শ্রম", "Labour")}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Btn onClick={() => setDrafted(true)}>{pick("মিডিয়েটর নোট থেকে খসড়া তৈরি", "Draft from mediator notes")}</Btn>
        {drafted && !reviewed && <Btn tone="ok" onClick={() => setReviewed(true)}>{pick("মিডিয়েটর পর্যালোচনা সম্পন্ন", "Complete mediator review")}</Btn>}
      </div>
      {drafted && (
        <div className={cx("mt-5 rounded-2xl border p-5", reviewed ? "border-[#d3ecdf] bg-[#fbfefc]" : "border-[#efe3c8] bg-[#fffdf6]")}>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-bold text-[#134970]">{d.title}</h3>
            <Tag tone={reviewed ? "green" : "gold"}>{reviewed ? pick("মানব-পর্যালোচিত", "human-reviewed") : pick("খসড়া — পর্যালোচনা বাকি", "draft — review pending")}</Tag>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-[#2b4557]">
            {d.clauses.map((cl, i) => (
              <li key={i} className="rounded-xl bg-white ring-1 ring-[#e4eef4] px-3.5 py-2.5">{cl}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-[#a94442] bg-[#fdf0ef] rounded-xl px-3.5 py-2.5">⚠️ {d.warn}</p>
        </div>
      )}
    </DemoShell>
  );
}

/* ── T8: Multi-agent triage ─────────────────────────────────── */

export function T8Triage() {
  const { pick } = useI18n();
  const [ran, setRan] = useState<string | null>(null);

  const CASES = [
    { id: "CASE-240122", bn: "নাবিলা (সাইবার, জরুরি)", en: "Nabila (cyber, urgent)", cat: "সাইবার", catEn: "Cyber", urg: "জরুরি", urgEn: "Urgent", jur: "সাইবার ট্রাইব্যুনাল", jurEn: "Cyber Tribunal", conflict: false },
    { id: "CASE-240118", bn: "ময়ূরী (ভরণপোষণ)", en: "Moyuri (maintenance)", cat: "পারিবারিক", catEn: "Family", urg: "স্বাভাবিক", urgEn: "Normal", jur: "পারিবারিক আদালত", jurEn: "Family Court", conflict: false },
    { id: "CASE-240131", bn: "মালেক (দীর্ঘস্থায়ী)", en: "Malek (long-running)", cat: "অন্যান্য", catEn: "Other", urg: "উচ্চ", urgEn: "High", jur: "জেলা আদালত", jurEn: "District Court", conflict: false },
    { id: "CASE-240140", bn: "রহিম মিয়া (জুরিসডিকশন দ্বন্দ্ব)", en: "Rahim Mia (jurisdiction conflict)", cat: "শ্রম", catEn: "Labour", urg: "উচ্চ", urgEn: "High", jur: "দ্বন্দ্ব!", jurEn: "Conflict!", conflict: true },
    { id: "CASE-240127", bn: "নুচিং (ভূমি, সহায়তা প্রয়োজন)", en: "Nuching (land, needs assistance)", cat: "ভূমি", catEn: "Land", urg: "স্বাভাবিক", urgEn: "Normal", jur: "ভূমি অফিস", jurEn: "Land Office", conflict: false },
  ];

  return (
    <DemoShell note={pick("গার্ডরেইল: চূড়ান্ত অগ্রাধিকার/রাউটিং মানব-পর্যালোচনাযোগ্য; ব্যাখ্যা মানে সংক্ষিপ্ত কারণ — লুকানো চেইন-অব-থট নয়।", "Guardrail: final priority/routing stays human-reviewable; explainability means concise reasons, not hidden chain-of-thought.")}>
      <h2 className="text-lg font-bold text-[#134970]">T8 · {pick("মাল্টি-এজেন্ট ট্রায়াজ পাইপলাইন", "Multi-Agent Triage Pipeline")}</h2>
      <p className="text-sm text-[#5c7a8e] mt-1">
        {pick("৩টি বিশেষায়িত এজেন্ট: (১) ক্যাটেগরাইজার (২) কমপ্লায়েন্স/প্রসেস চেকার (৩) রাউটার — প্রস্তাব দেয়, সিদ্ধান্ত দেয় না।", "3 specialised agents: (1) categoriser (2) compliance/process checker (3) router — they propose, never decide.")}
      </p>
      <div className="mt-4"><Btn onClick={() => setRan("run")}>{pick("৫টি নমুনা কেসে ট্রায়াজ চালান", "Run triage on 5 sample cases")}</Btn></div>
      {ran && (
        <ul className="mt-5 space-y-2.5">
          {CASES.map((c) => (
            <li key={c.id} className={cx("rounded-2xl border px-4 py-3.5", c.conflict ? "border-[#f3d2ce] bg-[#fffaf9]" : "border-[#e4eef4] bg-white")}>
              <div className="flex flex-wrap items-center gap-2">
                <Tag tone="blue">{c.id}</Tag>
                <span className="text-sm font-semibold text-[#2b4557]">{pick(c.bn, c.en)}</span>
                {c.conflict && <Tag tone="red">⚠ {pick("এজেন্টদের মতবিরোধ — মানব পর্যালোচনায়", "agent conflict — human review")}</Tag>}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                <span className="rounded-full bg-[#f2f8fc] ring-1 ring-[#dbe7f0] px-2.5 py-1 text-[#33546b]">🏷️ {pick("ক্যাটেগরি:", "Category:")} {pick(c.cat, c.catEn)}</span>
                <span className="rounded-full bg-[#fdf3dd] ring-1 ring-[#efe3c8] px-2.5 py-1 text-[#8a6410]">⚡ {pick("তাড়াহুড়ো:", "Urgency:")} {pick(c.urg, c.urgEn)}</span>
                <span className="rounded-full bg-[#eff8f3] ring-1 ring-[#d3ecdf] px-2.5 py-1 text-[#22694c]">🧭 {pick("রাউট:", "Route:")} {pick(c.jur, c.jurEn)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DemoShell>
  );
}

/* ── T9: Offline sync ───────────────────────────────────────── */

export function T9OfflineSync() {
  const { pick, lang } = useI18n();
  const [offlineRecords, setOfflineRecords] = useState(0);
  const [synced, setSynced] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [conflictResolved, setConflictResolved] = useState(false);
  const [verified, setVerified] = useState(false);

  return (
    <DemoShell note={pick("থ্রেট মডেল: ডিভাইস-লোকাল কিউ স্পষ্ট সাইন-অফ ছাড়া সার্ভারে যায় না; ইনটিগ্রিটি হ্যাশ পরিবহন-ত্রুটি ধরে — পরম ট্যাম্পার-প্রুফ দাবি নয়।", "Threat model: the device-local queue never reaches the server without explicit sign-off; integrity hashes catch transport corruption — not absolute tamper-proofing.")}>
      <h2 className="text-lg font-bold text-[#134970]">T9 · {pick("অফলাইন-ফার্স্ট সিঙ্ক", "Offline-First Sync")}</h2>
      <p className="text-sm text-[#5c7a8e] mt-1">{pick("নুচিং-এর UDC দৃশ্যপট: নেটওয়ার্ক নেই — কাজ চলবে, পরে সিঙ্ক হবে।", "Nuching's UDC scenario: no network — work continues, syncs later.")}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <Btn onClick={() => setOfflineRecords((r) => Math.min(3, r + 1))}>{pick("অফলাইনে রেকর্ড তৈরি করুন", "Create record offline")}</Btn>
        <Btn tone="ok" disabled={offlineRecords === 0} onClick={() => setSynced(true)}>{pick("সংযোগ দিন ও সিঙ্ক", "Reconnect & sync")}</Btn>
        {synced && !conflict && <Btn tone="warn" onClick={() => setConflict(true)}>{pick("বিরোধ সিমুলেট", "Simulate conflict")}</Btn>}
        {conflict && !conflictResolved && <Btn onClick={() => setConflictResolved(true)}>{pick("মানব পর্যালোচনায় মীমাংসা", "Resolve via human review")}</Btn>}
        {conflictResolved && !verified && <Btn tone="ok" onClick={() => setVerified(true)}>{pick("ইনটিগ্রিটি যাচাই", "Verify integrity")}</Btn>}
      </div>

      <div className="mt-5 grid sm:grid-cols-4 gap-3 text-center">
        {[
          { v: offlineRecords, l: { bn: "অফলাইন রেকর্ড", en: "Offline records" } },
          { v: synced ? offlineRecords : 0, l: { bn: "সিঙ্কড (ডুপ্লিকেট নেই)", en: "Synced (no duplicates)" } },
          { v: conflict ? 1 : 0, l: { bn: "বিরোধ", en: "Conflicts" } },
          { v: verified ? "✓" : "—", l: { bn: "হ্যাশ যাচাই", en: "Hash verified" } },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl bg-[#f6fafc] ring-1 ring-[#e4eef4] p-4">
            <p className="text-2xl font-extrabold text-[#134970]">{typeof s.v === "number" ? digitsFor(s.v, lang) : s.v}</p>
            <p className="text-[11px] font-semibold text-[#5c7a8e] mt-1">{pick(s.l.bn, s.l.en)}</p>
          </div>
        ))}
      </div>
      {conflict && !conflictResolved && (
        <div className="mt-4 rounded-2xl bg-[#fdf0ef] ring-1 ring-[#f3d2ce] px-4 py-3 text-sm text-[#a94442]">
          ⚠️ {pick("বিরোধ: একই রেকর্ডে ২টি সম্পাদনা (ডিভাইস কপি ও সার্ভার কপি) — স্বয়ংক্রিয় মার্জ নয়; মানব পর্যালোচনায় যাবে।", "Conflict: two edits on the same record (device copy vs server copy) — no auto-merge; routed to human review.")}
        </div>
      )}
      {verified && (
        <div className="mt-4 rounded-2xl bg-[#eff8f3] ring-1 ring-[#d3ecdf] px-4 py-3 text-sm text-[#22694c]">
          ✅ {pick("SHA-256 হ্যাশ মিলেছে — সিঙ্কের পরেও রেকর্ড অপরিবর্তিত; অডিট এন্ট্রি যুক্ত হলো।", "SHA-256 hash matches — record unchanged through sync; audit entry appended.")}
        </div>
      )}
    </DemoShell>
  );
}

/* ── T10: PWA / light mode ──────────────────────────────────── */

export function T10Pwa() {
  const { pick, lang } = useI18n();
  const [mode, setMode] = useState<"normal" | "light">("normal");
  const [measuring, setMeasuring] = useState(false);
  const [result, setResult] = useState<{ normal: number; light: number } | null>(null);

  function measure() {
    setMeasuring(true);
    setResult(null);
    setTimeout(() => {
      setResult({ normal: 4200 + Math.floor(Math.random() * 400), light: 900 + Math.floor(Math.random() * 200) });
      setMeasuring(false);
    }, 1200);
  }

  return (
    <DemoShell note={pick("গার্ডরেইল: শেয়ার্ড ডিভাইসে সংবেদনশীল ডেটা ক্যাশ হয় না; ক্যাশ শুধু পাবলিক শেল — সংবেদনশীল ডেমো-স্টেট মেমোরিতে।", "Guardrail: sensitive data is never cached on shared devices; the cache holds only the public shell — sensitive demo state stays in memory.")}>
      <h2 className="text-lg font-bold text-[#134970]">T10 · {pick("কম-ব্যান্ডউইথ PWA", "Low-Bandwidth PWA")}</h2>
      <p className="text-sm text-[#5c7a8e] mt-1">
        {pick("এই সাইটটি ইনস্টলযোগ্য PWA — ব্রাউজারের মেনু থেকে 'Add to Home screen' করুন; অফলাইনেও শেল খোলে।", "This site is an installable PWA — use your browser's 'Add to Home screen'; the shell opens even offline.")}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <div className="flex rounded-xl ring-1 ring-[#c9dcea] overflow-hidden">
          {(["normal", "light"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={cx("px-4 py-2.5 text-sm font-bold", mode === m ? "bg-[#134970] text-white" : "bg-white text-[#33546b]")} aria-pressed={mode === m}>
              {m === "normal" ? pick("নরমাল মোড", "Normal mode") : pick("লাইট মোড (কম ডেটা)", "Light mode (low data)")}
            </button>
          ))}
        </div>
        <Btn tone="ok" onClick={measure} disabled={measuring}>
          {measuring ? pick("মাপা হচ্ছে… (3G থ্রটল)", "Measuring… (3G throttle)") : pick("থ্রটলড নেটওয়ার্কে তুলনা করুন", "Compare under throttled network")}
        </Btn>
      </div>
      {result && (
        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          <div className={cx("rounded-2xl p-4 ring-1", mode === "normal" ? "bg-[#e8f2f9] ring-[#c9dcea]" : "bg-[#f6fafc] ring-[#e4eef4]")}>
            <p className="text-xs font-bold text-[#33546b]">{pick("নরমাল মোড — ফার্স্ট লোড", "Normal mode — first load")}</p>
            <p className="text-2xl font-extrabold text-[#134970] mt-1">~{digitsFor(result.normal, lang)} KB</p>
          </div>
          <div className={cx("rounded-2xl p-4 ring-1", mode === "light" ? "bg-[#eff8f3] ring-[#d3ecdf]" : "bg-[#f6fafc] ring-[#e4eef4]")}>
            <p className="text-xs font-bold text-[#33546b]">{pick("লাইট মোড — ফার্স্ট লোড", "Light mode — first load")}</p>
            <p className="text-2xl font-extrabold text-[#1c6b43] mt-1">~{digitsFor(result.light, lang)} KB</p>
            <p className="text-[11px] text-[#5c7a8e] mt-1">{pick("ছবি বাদ, শুধু টেক্সট ও ফরম", "Images off, text & forms only")}</p>
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-[#5c7a8e]">
        {pick("টিপ: বাম-নিচের 'লাইট মোড' টগল দিয়ে সাইটজুড়ে ডেটা-সেভার চালু করুন।", "Tip: use the 'Light mode' toggle at the bottom-left to enable data-saver across the site.")}
      </p>
    </DemoShell>
  );
}

/* ── T11: E-signature ───────────────────────────────────────── */

export function T11ESignature() {
  const { pick, lang } = useI18n();
  const [partyA, setPartyA] = useState(false);
  const [partyBOffline, setPartyBOffline] = useState(false);
  const [syncedB, setSyncedB] = useState(false);
  const [tamper, setTamper] = useState(false);
  const [verified, setVerified] = useState(false);

  const hashBase = "a91f…c77e";

  return (
    <DemoShell note={pick("গার্ডরেইল: ক্রিপ্টোগ্রাফিক বৈধতা একাই আইনি বৈধতা, পরিচয়, ক্ষমতা বা সম্মতি প্রমাণ করে না।", "Guardrail: cryptographic validity alone does not establish legal validity, identity, capacity or consent.")}>
      <h2 className="text-lg font-bold text-[#134970]">T11 · {pick("অ্যাসিনক্রোনাস ই-স্বাক্ষর", "Asynchronous E-Signature")}</h2>
      <p className="text-sm text-[#5c7a8e] mt-1">{pick("সেটেলমেন্ট নথি: মেডিয়েশন রেকর্ড CASE-240145-এ লিংকড; দুই পক্ষ ভিন্ন সময়ে সই করবেন।", "Settlement document: linked to mediation record CASE-240145; both parties sign at different times.")}</p>

      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#e4eef4] px-4 py-3.5">
          <span className="text-sm font-semibold text-[#2b4557] min-w-40">{pick("পক্ষ ১ — সালমা (অনলাইন)", "Party 1 — Salma (online)")}</span>
          {partyA ? <Tag tone="green">✓ {pick("স্বাক্ষরিত", "signed")} · {hashBase}</Tag> : <Btn onClick={() => setPartyA(true)}>{pick("স্বাক্ষর করুন", "Sign")}</Btn>}
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#e4eef4] px-4 py-3.5">
          <span className="text-sm font-semibold text-[#2b4557] min-w-40">{pick("পক্ষ ২ — রফিক (অফলাইন)", "Party 2 — Rafiq (offline)")}</span>
          {!partyBOffline && <Btn onClick={() => setPartyBOffline(true)}>{pick("অফলাইনে স্বাক্ষর", "Sign offline")}</Btn>}
          {partyBOffline && !syncedB && <Tag tone="gold">✓ {pick("ডিভাইসে স্বাক্ষর, সিঙ্ক অপেক্ষমাণ", "signed on device, awaiting sync")}</Tag>}
          {partyBOffline && !syncedB && <Btn tone="ok" onClick={() => setSyncedB(true)}>{pick("নেটওয়ার্ক ফিরল — সিঙ্ক", "Network back — sync")}</Btn>}
          {syncedB && <Tag tone="green">✓ {pick("স্বাক্ষরিত ও সিঙ্কড", "signed & synced")} · {hashBase}</Tag>}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Btn tone="warn" disabled={!partyA} onClick={() => { setTamper(true); setVerified(false); }}>{pick("নথিতে টেম্পার সিমুলেট", "Simulate document tamper")}</Btn>
        <Btn tone="ok" disabled={!partyA || !syncedB} onClick={() => setVerified(true)}>{pick("স্বাক্ষর ও ইনটিগ্রিটি যাচাই", "Verify signatures & integrity")}</Btn>
      </div>

      {verified && (
        <div className={cx("mt-4 rounded-2xl ring-1 px-4 py-3 text-sm", tamper ? "bg-[#fdf0ef] ring-[#f3d2ce] text-[#a94442]" : "bg-[#eff8f3] ring-[#d3ecdf] text-[#22694c]")}>
          {tamper
            ? `❌ ${pick("যাচাই ব্যর্থ: হ্যাশ মেলেনি — নথি স্বাক্ষরের পরে পরিবর্তিত হয়েছে। সিস্টেম পরিবর্তনটি ধরেছে।", "Verification FAILED: hash mismatch — the document changed after signing. The system caught the alteration.")}`
            : `✅ ${pick("উভয় স্বাক্ষর বৈধ; হ্যাশ মিলেছে — নথি অপরিবর্তিত।", "Both signatures valid; hashes match — document unchanged.")}`}
        </div>
      )}
      {tamper && verified && (
        <Btn tone="ghost" onClick={() => { setTamper(false); }}>{pick("টেম্পার রিসেট করে আবার যাচাই করুন", "Reset tamper and verify again")}</Btn>
      )}
    </DemoShell>
  );
}

/* ── Registry ───────────────────────────────────────────────── */

export const TECH_COMPONENTS: Record<string, ComponentType> = {
  T1: T1LawyerInactivity,
  T2: T2Jurisdiction,
  T3: T3RelatedIncidents,
  T4: T4Duplicates,
  T5: T5IntakeAgent,
  T6: T6DocumentAgent,
  T7: T7Settlement,
  T8: T8Triage,
  T9: T9OfflineSync,
  T10: T10Pwa,
  T11: T11ESignature,
};
