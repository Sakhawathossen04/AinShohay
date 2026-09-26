"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { SCENARIOS, PROVIDERS, TECHS } from "@/data/caseData";

type Row = { id: string; label: string; href: string };

export default function CoveragePage() {
  const { pick, lang } = useI18n();

  const rows: Row[] = [
    ...SCENARIOS.map((s) => ({ id: s.id, label: `${s.name[lang]} — ${s.barrier[lang]}`, href: "/prototype/scenarios" })),
    ...PROVIDERS.map((p) => ({ id: p.id, label: p.role[lang], href: p.console })),
    ...TECHS.map((tc) => ({ id: tc.id, label: tc.title[lang], href: tc.demo })),
  ];

  const badges = [
    { bn: "ইমপ্লিমেন্টেড", en: "Implemented", cls: "bg-[#eff8f3] text-[#22694c] ring-[#d3ecdf]" },
    { bn: "ইন্টিগ্রেটেড", en: "Integrated", cls: "bg-[#e8f2f9] text-[#134970] ring-[#c9dcea]" },
    { bn: "টেস্টেবল", en: "Testable", cls: "bg-[#fdf3dd] text-[#8a6410] ring-[#efe3c8]" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#1d7bb8]">
        {pick("বাধ্যতামূলক কভারেজ চেকলিস্ট", "Mandatory coverage checklist")}
      </p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#134970]">
        ✅ {pick("২৩টি বাধ্যতামূলক আইটেম", "23 Mandatory Items")}
      </h1>
      <p className="mt-3 max-w-3xl text-[15px] text-[#4a6b82] leading-relaxed">
        {pick(
          "প্রতিটি আইটেম ইমপ্লিমেন্টেড, ইন্টিগ্রেটেড (একই রেকর্ড/ওয়ার্কফ্লোতে) এবং জুরির জন্য টেস্টেবল। যেকোনো সারিতে ক্লিক করে লাইভ মডিউলে যান।",
          "Every item is implemented, integrated into the shared record/workflow, and testable by the jury. Click any row to reach its live module."
        )}
      </p>

      <div className="mt-8 overflow-x-auto rounded-3xl border border-[#dbe7f0] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f2f8fc] text-left text-xs uppercase tracking-wide text-[#33546b]">
              <th className="px-5 py-3.5 font-bold">ID</th>
              <th className="px-5 py-3.5 font-bold">{pick("আইটেম", "Item")}</th>
              <th className="px-5 py-3.5 font-bold">{pick("স্ট্যাটাস", "Status")}</th>
              <th className="px-5 py-3.5 font-bold sr-only sm:table-cell">{pick("লিংক", "Link")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef3f7]">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-[#f8fbfd]">
                <td className="px-5 py-3.5 font-extrabold text-[#1d7bb8] whitespace-nowrap">{r.id}</td>
                <td className="px-5 py-3.5 text-[#2b4557]">
                  <Link href={r.href} className="hover:text-[#134970] hover:underline">{r.label}</Link>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    {badges.map((b) => (
                      <span key={b.en} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${b.cls}`}>
                        ✓ {pick(b.bn, b.en)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <Link href={r.href} className="text-xs font-bold text-[#1d7bb8] hover:underline whitespace-nowrap">
                    {pick("খুলুন", "Open")} →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
