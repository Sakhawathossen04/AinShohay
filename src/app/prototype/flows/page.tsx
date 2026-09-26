"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { FLOWS, SCENARIOS } from "@/data/caseData";
import { cx } from "@/lib/utils";

export default function FlowsPage() {
  const { pick, lang } = useI18n();
  const [active, setActive] = useState("F1");
  const flow = FLOWS.find((f) => f.id === active)!;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#1d7bb8]">
        {pick("কীভাবে তৈরি করবেন: ৬ ফ্লো, ১ সিস্টেম", "How to build: 6 flows, 1 system")}
      </p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#134970]">
        {pick("ইন্টিগ্রেটেড ফ্লো", "Integrated Flows")}
      </h1>
      <p className="mt-3 max-w-3xl text-[15px] text-[#4a6b82] leading-relaxed">
        {pick(
          "২৩টি আলাদা ডেমো নয় — ছয়টি সংযুক্ত এন্ড-টু-এন্ড ফ্লো, প্রতিটি ধাপ একই রেকর্ডে লেখে। প্রতিটি ফ্লো খুলে ধাপগুলো অনুসরণ করুন।",
          "Not 23 separate demos — six connected end-to-end flows, every stage writing to the same record. Open each flow and follow the stages."
        )}
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {FLOWS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-bold transition-colors",
              active === f.id ? "bg-[#134970] text-white" : "bg-white ring-1 ring-[#c9dcea] text-[#33546b] hover:bg-[#f2f8fc]"
            )}
            aria-pressed={active === f.id}
          >
            {f.id} · {f.title[lang]}
          </button>
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-[#dbe7f0] bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-[#134970] to-[#1d7bb8] text-white px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">{flow.id}</p>
          <h2 className="text-lg font-bold">{flow.title[lang]}</h2>
          <p className="mt-1.5 text-sm text-white/85 max-w-2xl">{flow.summary[lang]}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {flow.covers.map((c) => {
              const sc = SCENARIOS.find((s) => s.id === c);
              return (
                <span key={c} className="rounded-full bg-white/15 ring-1 ring-white/25 px-2.5 py-1 text-[11px] font-bold">
                  {sc ? `${c} · ${sc.name[lang]}` : c}
                </span>
              );
            })}
          </div>
        </div>
        <ol className="p-6 space-y-0">
          {flow.stages.map((st, i) => (
            <li key={i} className="relative pl-10 pb-7 last:pb-0">
              {i < flow.stages.length - 1 && (
                <span aria-hidden className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-[#dbe7f0]" />
              )}
              <span className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[#e8f2f9] ring-2 ring-white grid place-items-center text-xs font-extrabold text-[#134970]">
                {i + 1}
              </span>
              <h3 className="font-bold text-[#134970] text-[15px]">{st.label[lang]}</h3>
              <p className="mt-1 text-sm text-[#4a6b82] leading-relaxed">{st.detail[lang]}</p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                <span className="rounded-full bg-[#f2f8fc] ring-1 ring-[#dbe7f0] px-2.5 py-1 text-[#33546b]">👤 {st.actor}</span>
                <span className="rounded-full bg-[#eff8f3] ring-1 ring-[#d3ecdf] px-2.5 py-1 text-[#22694c]">📝 {st.writes}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
