"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { PROVIDERS } from "@/data/caseData";

const ROLE_ICON: Record<string, string> = {
  B1: "🧑‍💼", B2: "🤝", B3: "📞", B4: "🏪", B5: "⚖️", B6: "🏢", B7: "🗂️",
};

export default function RolesPage() {
  const { pick, lang } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#1d7bb8]">Part B — {pick("প্রদানকারী দৃশ্যপট", "Provider Scenarios")}</p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#134970]">
        {pick("৭টি প্রদানকারী ভূমিকা — প্রত্যেকের নিজস্ব ভিউ, একই রেকর্ড", "7 Provider Roles — Each With Its Own View, One Record")}
      </h1>
      <ul className="mt-8 grid sm:grid-cols-2 gap-4">
        {PROVIDERS.map((p) => (
          <li key={p.id}>
            <Link href={p.console} className="block h-full rounded-3xl border border-[#dbe7f0] bg-white p-6 hover:shadow-lg hover:shadow-[#0f3350]/5 hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-3">
                <span aria-hidden className="text-2xl">{ROLE_ICON[p.id]}</span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#1d7bb8]">{p.id}</p>
                  <h2 className="font-bold text-[#134970]">{p.role[lang]}</h2>
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-[#a94442] uppercase tracking-wide">{pick("আজকের চ্যালেঞ্জ", "Challenge today")}</p>
              <p className="text-sm text-[#4a6b82] mt-1 leading-relaxed">{p.today[lang]}</p>
              <p className="mt-3 text-xs font-semibold text-[#22694c] uppercase tracking-wide">{pick("সিস্টেম ফলাফল", "System outcome")}</p>
              <p className="text-sm text-[#2b4557] mt-1 leading-relaxed">{p.outcome[lang]}</p>
              <span className="mt-4 inline-block text-xs font-bold text-[#1d7bb8]">{pick("কনসোল খুলুন", "Open console")} →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
