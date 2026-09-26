"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import SearchBox from "@/components/SearchBox";
import ResourceLibrary from "@/components/ResourceLibrary";
import { TOPICS } from "@/data/topics";
import { TOOLS } from "@/data/tools";
import { CENTERS } from "@/data/centers";

const QUICK = [
  { icon: "🧾", href: "/topics/maintenance", bn: "ভরণপোষণ দাবি", en: "Maintenance claim" },
  { icon: "🌾", href: "/topics/land-disputes", bn: "জমির নামজারি", en: "Land mutation" },
  { icon: "📑", href: "/toolbox/divorce-notice", bn: "তালাকের নোটিশ", en: "Divorce notice" },
  { icon: "🏭", href: "/topics/labour-wages", bn: "বকেয়া বেতন", en: "Unpaid wages" },
  { icon: "📱", href: "/topics/cyber-harassment", bn: "সাইবার হয়রানি", en: "Cyber harassment" },
  { icon: "🛒", href: "/topics/consumer-rights", bn: "ভোক্তা অভিযোগ", en: "Consumer complaint" },
];

export default function HomePage() {
  const { pick } = useI18n();

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf6fd] via-[#dff0fa] to-[#f4f8fb]">
        <div className="mx-auto max-w-6xl px-4 pt-14 pb-10 grid lg:grid-cols-2 gap-8 items-center">
          <div className="relative z-10 text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 ring-1 ring-[#b7d3e5] px-3.5 py-1.5 text-xs font-bold text-[#134970] mb-5">
              🇧🇩 {pick("বাংলাদেশের প্রথম পূর্ণাঙ্গ আইনি স্ব-সহায়তা পোর্টাল", "Bangladesh's complete legal self-help portal")}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] font-extrabold text-[#134970] tracking-tight">
              {pick("আপনার অধিকার, আপনার হাতে —", "Your rights, in your hands —")}
              <span className="block text-[#1d7bb8]">{pick("সহজ বাংলায়, বিনামূল্যে", "plain Bangla, completely free")}</span>
            </h1>
            <p className="mt-4 text-[15px] sm:text-base text-[#4a6b82] leading-relaxed max-w-lg mx-auto lg:mx-0">
              {pick(
                "পরিবার, জমি, শ্রম, ভোক্তা ও অনলাইন নিরাপত্তা — প্রতিটি বিষয়ে ধাপে ধাপে গাইড, প্রস্তুত ফরম ও নিকটস্থ সহায়তা কেন্দ্র। ফোনেও (১৬৬৯৯) সব সুবিধা।",
                "Family, land, labour, consumer and online safety — step-by-step guides, ready forms and nearby help centers. Everything also works by phone (16699)."
              )}
            </p>
            <div className="mt-7">
              <SearchBox />
            </div>
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2">
              {QUICK.map((q) => (
                <Link
                  key={q.href}
                  href={q.href}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-[#c9dcea] px-3.5 py-1.5 text-xs font-semibold text-[#33546b] hover:bg-[#e8f2f9] hover:text-[#134970] transition-colors"
                >
                  <span aria-hidden>{q.icon}</span> {pick(q.bn, q.en)}
                </Link>
              ))}
            </div>
          </div>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-rural-bd.svg"
              alt=""
              aria-hidden
              className="w-full rounded-3xl shadow-xl shadow-[#0f3350]/10 ring-1 ring-white/60"
            />
            <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto rounded-2xl bg-white/92 backdrop-blur px-4 py-3 ring-1 ring-[#dbe7f0] shadow-lg">
              <p className="text-[13px] font-bold text-[#134970]">🌊 {pick("নদী-বিলের দেশ থেকে", "From the land of rivers and beels")}</p>
              <p className="text-[11px] text-[#5c7a8e] mt-0.5">
                {pick("প্রতিটি গ্রামে আইনি সহায়তা পৌঁছে দিতে আমাদের লক্ষ্য", "Our mission: legal help for every village")}
              </p>
            </div>
          </div>
        </div>
        {/* Stats strip */}
        <div className="border-t border-white/60 bg-white/60 backdrop-blur">
          <dl className="mx-auto max-w-6xl px-4 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { v: "৯", bn: "টি বিষয় গাইড", en: "Topic guides" },
              { v: "৬", bn: "টি ফরম টুল", en: "Form tools" },
              { v: "১২+", bn: "টি সহায়তা কেন্দ্র", en: "Help centers" },
              { v: "১৬৬৯৯", bn: "হেল্পলাইন", en: "Helpline" },
            ].map((s) => (
              <div key={s.en}>
                <dt className="sr-only">{s.en}</dt>
                <dd className="text-2xl font-extrabold text-[#1d7bb8]">{s.v}</dd>
                <dd className="text-xs font-medium text-[#5c7a8e] mt-0.5">{pick(s.bn, s.en)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 space-y-14 pt-12">
        {/* ── Resource library ───────────────────────────────── */}
        <ResourceLibrary />

        {/* ── How can we help you (kept from MLH) ────────────── */}
        <section aria-labelledby="how-help-title" className="rounded-3xl bg-[#134970] text-white p-6 sm:p-9 relative overflow-hidden">
          <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-[#1d7bb8]/30 blur-2xl decorative" aria-hidden />
          <h2 id="how-help-title" className="text-2xl font-bold">{pick("আমরা কীভাবে আপনাকে সাহায্য করতে পারি?", "How Can We Help You?")}</h2>
          <p className="mt-2 text-white/80 text-sm max-w-2xl">
            {pick("নিচের যেকোনো পথ বেছে নিন — সব রুটেই একই নির্ভরযোগ্য তথ্য।", "Choose any path below — every route gives the same reliable information.")}
          </p>
          <div className="mt-6 grid sm:grid-cols-3 gap-3.5">
            {[
              { icon: "📖", t: { bn: "বিষয়ভিত্তিক গাইড", en: "Topic guides" }, d: { bn: "ধাপে ধাপে, কাগজ ও আইনসহ", en: "Step-by-step with documents and laws" }, href: "/topics" },
              { icon: "🧰", t: { bn: "ফরম টুলবক্স", en: "Form toolbox" }, d: { bn: "উত্তর দিন, প্রিন্টযোগ্য আবেদন নিন", en: "Answer questions, get a printable application" }, href: "/toolbox" },
              { icon: "📍", t: { bn: "কেন্দ্র খুঁজুন", en: "Find a center" }, d: { bn: "DLAO, UDC ও এনজিও কেন্দ্র", en: "DLAO, UDC and NGO centers" }, href: "/centers" },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="group rounded-2xl bg-white/10 hover:bg-white/16 ring-1 ring-white/20 p-5 transition-colors">
                <span aria-hidden className="text-2xl">{c.icon}</span>
                <p className="mt-2 font-bold">{pick(c.t.bn, c.t.en)}</p>
                <p className="text-xs text-white/75 mt-1 leading-relaxed">{pick(c.d.bn, c.d.en)}</p>
                <span className="mt-3 inline-block text-xs font-bold text-[#ffd97a] group-hover:translate-x-0.5 transition-transform">{pick("শুরু করুন", "Start")} →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Case prototype teaser ──────────────────────────── */}
        <section aria-labelledby="case-teaser" className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-[#dbe7f0] bg-white p-6 sm:p-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#1d7bb8]">ADLASB {pick("ফাইনাল কেস", "Final Case")}</p>
            <h2 id="case-teaser" className="mt-2 text-xl font-bold text-[#134970]">
              {pick("৫ নাগরিক + ৭ প্রদানকারী + ১১ প্রযুক্তি = ২৩ বাধ্যতামূলক আইটেম", "5 Citizens + 7 Providers + 11 Tech = 23 Mandatory Items")}
            </h2>
            <p className="mt-3 text-sm text-[#4a6b82] leading-relaxed">
              {pick(
                "ময়ূরী, রিপন, নাবিলা, নুচিং ও মালেক — পাঁচ বাস্তব বাধা, এক শেয়ার্ড রেকর্ড। প্রোটোটাইপে প্রতিটি কেস লাইভ টেস্ট করুন।",
                "Moyuri, Ripon, Nabila, Nuching and Malek — five real barriers, one shared record. Live-test every case in the prototype."
              )}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/prototype" className="rounded-xl bg-[#134970] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0f3b5c]">
                {pick("প্রোটোটাইপ খুলুন", "Open prototype")}
              </Link>
              <Link href="/prototype/scenarios" className="rounded-xl ring-1 ring-[#c9dcea] px-4 py-2.5 text-sm font-bold text-[#134970] hover:bg-[#f2f8fc]">
                {pick("কেসগুলো দেখুন", "See the cases")}
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-[#dbe7f0] bg-gradient-to-br from-[#fdf9ef] to-white p-6 sm:p-8">
            <h3 className="font-bold text-[#6b5310]">📞 {pick("“Need help finding or using the resources?”", "“Need help finding or using the resources?”")}</h3>
            <p className="mt-2 text-sm text-[#7a5c1a] leading-relaxed">
              {pick(
                "চ্যাট সহায়ক ন্যায়বন্ধুকে জিজ্ঞেস করুন, হেল্পলাইনে কল করুন, অথবা কাছের কেন্দ্রে যান — তিনটি রুটই খোলা।",
                "Ask our chatbot NyayBondhu, call the helpline, or visit a nearby center — all three routes are open."
              )}
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              <a href="tel:16699" className="flex items-center justify-between rounded-xl bg-white ring-1 ring-[#efe3c8] px-4 py-3 font-semibold text-[#6b5310] hover:bg-[#fdf6e4]">
                {pick("হেল্পলাইন ১৬৬৯৯ — কল করুন", "Helpline 16699 — call now")} <span aria-hidden>→</span>
              </a>
              <Link href="/help" className="flex items-center justify-between rounded-xl bg-white ring-1 ring-[#efe3c8] px-4 py-3 font-semibold text-[#6b5310] hover:bg-[#fdf6e4]">
                {pick("“আপনার কাছে আইনি স্ব-সহায়তা কেন্দ্র খুঁজুন”", "“Find a legal self-help center near you!”")} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Topic grid preview ─────────────────────────────── */}
        <section aria-labelledby="topics-preview">
          <div className="flex items-end justify-between mb-5">
            <h2 id="topics-preview" className="text-xl font-bold text-[#134970]">{pick("সব বিষয়", "All topics")}</h2>
            <Link href="/topics" className="text-sm font-bold text-[#1d7bb8] hover:underline">{pick("সব দেখুন", "View all")} →</Link>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPICS.slice(0, 6).map((tp) => (
              <li key={tp.slug}>
                <Link href={`/topics/${tp.slug}`} className="block h-full rounded-2xl border border-[#dbe7f0] bg-white p-5 hover:shadow-lg hover:shadow-[#0f3350]/5 hover:-translate-y-0.5 transition-all">
                  <span aria-hidden className="text-2xl">{tp.icon}</span>
                  <h3 className="mt-2 font-bold text-[#134970] text-[15px]">{tp.title.bn}</h3>
                  <p className="mt-1.5 text-xs text-[#5c7a8e] leading-relaxed line-clamp-2">{tp.short.bn}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
