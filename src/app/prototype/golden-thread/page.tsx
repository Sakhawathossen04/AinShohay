"use client";
import { useI18n } from "@/lib/i18n";
import { GOLDEN_THREAD } from "@/data/caseData";

export default function GoldenThreadPage() {
  const { pick, lang } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#1d7bb8]">
        {pick("সামঞ্জস্য ও ইন্টারঅপারেবিলিটি চেকলিস্ট", "Compatibility & Interoperability Checklist")}
      </p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#134970]">🧵 {pick("গোল্ডেন থ্রেড", "The Golden Thread")}</h1>
      <p className="mt-3 max-w-3xl text-[15px] text-[#4a6b82] leading-relaxed">
        {pick(
          "২৩টি আইটেম বলে কী থাকবে; গোল্ডেন থ্রেড বলে সেগুলো কীভাবে আচরণ করবে — প্রতিটি সিনারিও, ভূমিকা ও মডিউলে একইভাবে।",
          "The 23 items say what must exist; the Golden Thread says how they must behave — consistently across every scenario, role and module."
        )}
      </p>
      <ul className="mt-8 grid sm:grid-cols-2 gap-4">
        {GOLDEN_THREAD.map((g) => (
          <li key={g.id} className="rounded-2xl border border-[#dbe7f0] bg-white p-5">
            <p className="text-[11px] font-extrabold text-[#1d7bb8]">{g.id}</p>
            <h2 className="font-bold text-[#134970] mt-0.5">{g.title[lang]}</h2>
            <p className="mt-2 text-sm text-[#4a6b82] leading-relaxed">✓ {g.pass[lang]}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
