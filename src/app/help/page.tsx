"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function HelpPage() {
  const { pick } = useI18n();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#134970]">
        {pick("আমরা কীভাবে সাহায্য করি?", "How Can We Help You?")}
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] text-[#4a6b82] leading-relaxed">
        {pick(
          "রিসোর্স খুঁজতে বা ব্যবহারে সমস্যা? তিনটি রুট — চ্যাট, ফোন, সরাসরি কেন্দ্র। যেকোনো একটিতেই একই নির্ভরযোগ্য তথ্য পাবেন।",
          "Trouble finding or using the resources? Three routes — chat, phone, or a center in person. All give the same reliable information."
        )}
      </p>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {[
          {
            icon: "💬",
            t: { bn: "চ্যাট করুন", en: "Chat with us" },
            d: { bn: "ডান-নিচের ন্যায়বন্ধু বোতামে ক্লিক করুন — প্রশ্ন করুন, সঠিক পেজে যান।", en: "Click NyayBondhu at bottom-right — ask anything and jump to the right page." },
          },
          {
            icon: "📞",
            t: { bn: "ফোন করুন", en: "Call us" },
            d: { bn: "১৬৬৯৯ — সকাল ৯টা থেকে বিকেল ৫টা। পড়তে না পারলেও ভয়েসে সব সুবিধা।", en: "16699 — 9am to 5pm. Everything works by voice, even if you cannot read." },
            href: "tel:16699",
          },
          {
            icon: "📍",
            t: { bn: "কেন্দ্রে যান", en: "Visit a center" },
            d: { bn: "জেলা আইনি সহায়তা অফিস বা ইউনিয়ন ডিজিটাল সেন্টার — বিনামূল্যে সহায়তা।", en: "District Legal Aid Office or Union Digital Centre — assistance free of cost." },
            href: "/centers",
          },
        ].map((c) => (
          <div key={c.t.en} className="rounded-3xl border border-[#dbe7f0] bg-white p-6">
            <span aria-hidden className="text-3xl">{c.icon}</span>
            <h2 className="mt-2.5 font-bold text-[#134970]">{pick(c.t.bn, c.t.en)}</h2>
            <p className="mt-2 text-sm text-[#4a6b82] leading-relaxed">{pick(c.d.bn, c.d.en)}</p>
            {c.href && (
              <a href={c.href} className="mt-4 inline-block rounded-xl bg-[#e8f2f9] px-4 py-2 text-xs font-bold text-[#134970] hover:bg-[#d8e9f5]">
                {c.icon === "📞" ? "16699" : pick("কেন্দ্র খুঁজুন", "Find centers")} →
              </a>
            )}
          </div>
        ))}
      </div>

      <section className="mt-10 rounded-3xl bg-white ring-1 ring-[#dbe7f0] p-6 sm:p-8">
        <h2 className="text-xl font-bold text-[#134970]">{pick("“আপনার কাছে আইনি স্ব-সহায়তা কেন্দ্র খুঁজুন”", "“Find a legal self-help center near you!”")}</h2>
        <p className="mt-2 text-sm text-[#4a6b82]">
          {pick("৬৪ জেলার DLAO, UDC ও এনজিও ডেস্কের তথ্য এক জায়গায়।", "DLAO, UDC and NGO desk information across districts, in one place.")}
        </p>
        <Link href="/centers" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#134970] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0f3b5c]">
          {pick("কেন্দ্র ডিরেক্টরি খুলুন", "Open the center directory")} →
        </Link>
      </section>

      <section className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-[#eff8f3] ring-1 ring-[#d3ecdf] p-6">
          <h3 className="font-bold text-[#22694c]">🆓 {pick("সব সেবা বিনামূল্যে", "Everything is free")}</h3>
          <p className="mt-2 text-sm text-[#2e7d51] leading-relaxed">
            {pick("গাইড, ফরম, চ্যাট, হেল্পলাইন ও কেন্দ্র — কোথাও কোনো টাকা লাগে না। কেউ টাকা চাইলে সেটাই অভিযোগযোগ্য।", "Guides, forms, chat, helpline and centers — no payment anywhere. If anyone demands money, that itself is complainable.")}
          </p>
        </div>
        <div className="rounded-3xl bg-[#f2f8fc] ring-1 ring-[#c9dcea] p-6">
          <h3 className="font-bold text-[#134970]">🔒 {pick("নিরাপদ ব্যবহার", "Safe usage")}</h3>
          <p className="mt-2 text-sm text-[#33546b] leading-relaxed">
            {pick("শেয়ার্ড ফোন ব্যবহার করলে 'লাইট মোড' চালু রাখুন এবং কাজ শেষে ব্রাউজার বন্ধ করুন — সংবেদনশীল তথ্য ক্যাশ হয় না।", "On a shared phone, keep light mode on and close the browser after use — sensitive data is never cached.")}
          </p>
        </div>
      </section>
    </div>
  );
}
