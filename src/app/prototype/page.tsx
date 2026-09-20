"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { DOORS, FLOWS, PROVIDERS, SCENARIOS, TECHS, GOLDEN_THREAD } from "@/data/caseData";

const BACKBONE = [
  { bn: "এন্ট্রি চ্যানেল", en: "Entry channel" },
  { bn: "আবেদন আইডি", en: "Application ID" },
  { bn: "যাচাই / পর্যালোচনা", en: "Verification / Review" },
  { bn: "কেস আইডি", en: "Case ID" },
  { bn: "সেবা (মেডিয়েশন / আইনজীবী / রেফারেল)", en: "Service (mediation / lawyer / referral)" },
  { bn: "ফলো-আপ", en: "Follow-up" },
  { bn: "ফলাফল", en: "Outcome" },
  { bn: "নিষ্পত্তি", en: "Closure" },
];

export default function PrototypePage() {
  const { pick, lang } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#1d7bb8]">ADLASB {pick("গ্র্যান্ড ফিনালে", "Grand Finale")}</p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#134970]">
        {pick("পাঁচ দরজা, এক রেকর্ড — DLAS প্রোটোটাইপ", "Five Doors, One Record — DLAS Prototype")}
      </h1>
      <p className="mt-3 max-w-3xl text-[15px] text-[#4a6b82] leading-relaxed">
        {pick(
          "২৩টি বাধ্যতামূলক আইটেম (৫ নাগরিক + ৭ প্রদানকারী + ১১ প্রযুক্তিগত চ্যালেঞ্জ) একটি শেয়ার্ড রেকর্ড আর্কিটেকচারে — কোনো আলাদা দ্বীপ নয়।",
          "All 23 mandatory items (5 citizens + 7 providers + 11 technical challenges) on one shared record architecture — no islands."
        )}
      </p>

      {/* Backbone pipeline */}
      <section className="mt-8 rounded-3xl bg-[#134970] text-white p-6 sm:p-8">
        <h2 className="text-lg font-bold">{pick("সাধারণ ব্যাকবোন", "The Common Backbone")}</h2>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {BACKBONE.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="rounded-xl bg-white/12 ring-1 ring-white/20 px-3.5 py-2 text-xs font-semibold">{pick(b.bn, b.en)}</span>
              {i < BACKBONE.length - 1 && <span aria-hidden className="text-white/50">→</span>}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-white/70 leading-relaxed">
          {pick(
            "আবেদন আইডি জমার সময় তৈরি হয়; গ্রহণের পর কেস আইডি — রেফারেল, মেডিয়েশন, আইনজীবী ও নিষ্পত্তি পর্যন্ত একই আইডি, অনুমতি, নথি-ইতিহাস ও অডিট রেকর্ড অনুসরণ করে।",
            "Application ID is created at submission; Case ID after acceptance — the same ID, permissions, document history and audit trail follow the case through referral, mediation, lawyer and closure."
          )}
        </p>
      </section>

      {/* Five doors */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-[#134970]">{pick("পাঁচটি দরজা", "Five Doors Into the Record")}</h2>
        <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {DOORS.map((d) => (
            <li key={d.id} className="rounded-2xl border border-[#dbe7f0] bg-white p-4">
              <span aria-hidden className="text-2xl">{d.icon}</span>
              <h3 className="mt-1.5 font-bold text-sm text-[#134970]">{pick(d.bn, d.en)}</h3>
              <p className="text-[11px] text-[#5c7a8e] mt-1 leading-relaxed">{d.implication}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Quick links */}
      <section className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { href: "/prototype/scenarios", icon: "🧕", bn: "৫টি নাগরিক কেস (A1–A5)", en: "5 citizen cases (A1–A5)" },
          { href: "/prototype/flows", icon: "🔀", bn: "৬টি ইন্টিগ্রেটেড ফ্লো", en: "6 integrated flows" },
          { href: "/prototype/roles", icon: "👥", bn: "৭টি প্রদানকারী কনসোল", en: "7 provider consoles" },
          { href: "/prototype/tech", icon: "⚙️", bn: "১১টি প্রযুক্তি ডেমো (T1–T11)", en: "11 tech demos (T1–T11)" },
          { href: "/prototype/coverage", icon: "✅", bn: "কভারেজ ম্যাট্রিক্স (২৩ আইটেম)", en: "Coverage matrix (23 items)" },
          { href: "/prototype/golden-thread", icon: "🧵", bn: "গোল্ডেন থ্রেড (G1–G10)", en: "Golden Thread (G1–G10)" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="group rounded-2xl border border-[#dbe7f0] bg-white p-5 hover:shadow-lg hover:shadow-[#0f3350]/5 hover:-translate-y-0.5 transition-all">
            <span aria-hidden className="text-2xl">{c.icon}</span>
            <p className="mt-2 font-bold text-sm text-[#134970]">{pick(c.bn, c.en)}</p>
            <span className="text-xs font-bold text-[#1d7bb8]">{pick("দেখুন", "Open")} →</span>
          </Link>
        ))}
      </section>

      {/* Snapshot numbers */}
      <section className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { v: SCENARIOS.length, bn: "নাগরিক কেস", en: "Citizen cases" },
          { v: PROVIDERS.length, bn: "প্রদানকারী ভূমিকা", en: "Provider roles" },
          { v: TECHS.length, bn: "প্রযুক্তি চ্যালেঞ্জ", en: "Tech challenges" },
          { v: FLOWS.length, bn: "ইন্টিগ্রেটেড ফ্লো", en: "Integrated flows" },
        ].map((s) => (
          <div key={s.en} className="rounded-2xl bg-[#e8f2f9] p-5 text-center">
            <p className="text-3xl font-extrabold text-[#134970]">{s.v}</p>
            <p className="text-xs font-semibold text-[#33546b] mt-1">{pick(s.bn, s.en)}</p>
          </div>
        ))}
      </section>

      {/* Golden thread teaser */}
      <section className="mt-10 rounded-3xl bg-gradient-to-br from-[#fdf9ef] to-white border border-[#efe3c8] p-6 sm:p-8">
        <h2 className="text-lg font-bold text-[#6b5310]">🧵 {pick("গোল্ডেন থ্রেড", "The Golden Thread")}</h2>
        <ul className="mt-4 grid sm:grid-cols-2 gap-2.5">
          {GOLDEN_THREAD.map((g) => (
            <li key={g.id} className="text-sm text-[#6b5310]">
              <strong>{g.id}.</strong> {g.title[lang]} — <span className="text-[#8a6410]">{g.pass[lang]}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
