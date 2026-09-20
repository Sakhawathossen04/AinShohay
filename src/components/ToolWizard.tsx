"use client";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Tool } from "@/lib/types";
import { cx, idFor, todayFor } from "@/lib/utils";

type Values = Record<string, string>;

export default function ToolWizard({ tool }: { tool: Tool }) {
  const { pick, lang } = useI18n();
  const [stepIdx, setStepIdx] = useState(0);
  const [values, setValues] = useState<Values>({});
  const [done, setDone] = useState(false);
  const [refNo] = useState(() => idFor("CoUJL"));

  const step = tool.steps[stepIdx];
  const last = stepIdx === tool.steps.length - 1;

  const missing = useMemo(
    () => step.fields.filter((f) => f.required && !values[`${step.id}.${f.id}`]?.trim()).map((f) => f.label[lang]),
    [step, values, lang]
  );

  function set(stepId: string, fieldId: string, v: string) {
    setValues((prev) => ({ ...prev, [`${stepId}.${fieldId}`]: v }));
  }

  const label = (stepId: string, fieldId: string) => `${stepId}.${fieldId}`;

  if (done) {
    const lines = tool.steps.flatMap((s) =>
      s.fields
        .map((f) => ({ q: f.label[lang], a: values[label(s.id, f.id)] ?? "" }))
        .filter((r) => r.a)
    );
    return (
      <div className="rounded-3xl bg-white ring-1 ring-[#dbe7f0] p-5 sm:p-8">
        <div className="rounded-2xl bg-[#e9f7ef] border border-[#bfe3cd] p-4 flex items-start gap-3">
          <span className="text-2xl" aria-hidden>✅</span>
          <div>
            <p className="font-bold text-[#1c6b43]">{pick("আবেদন প্রস্তুত!", "Application ready!")}</p>
            <p className="text-sm text-[#2e7d51] mt-1">
              {pick("রেফারেন্স:", "Reference:")} <strong>{refNo}</strong> — {todayFor(lang)}
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-[#dbe7f0] p-5 bg-[#fbfdfe]">
          <h3 className="font-bold text-[#134970] text-center">{tool.title[lang]}</h3>
          <p className="text-center text-xs text-[#5c7a8e] mt-1">{refNo} · {todayFor(lang)}</p>
          <dl className="mt-5 space-y-3 text-sm">
            {lines.map((r) => (
              <div key={r.q} className="grid sm:grid-cols-[38%_1fr] gap-1 sm:gap-3 border-b border-dotted border-[#dbe7f0] pb-2.5">
                <dt className="font-semibold text-[#33546b]">{r.q}</dt>
                <dd className="text-[#2b4557] whitespace-pre-wrap">{r.a}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 rounded-xl bg-[#f2f8fc] p-4 text-xs text-[#33546b] leading-relaxed">
            <p className="font-bold text-[#134970]">{pick("জমা দেওয়ার স্থান:", "Where to submit:")}</p>
            <ul className="list-disc ml-4 mt-1 space-y-0.5">
              {tool.where.map((w, i) => <li key={i}>{w[lang]}</li>)}
            </ul>
            <p className="mt-2 font-bold text-[#134970]">{pick("পরবর্তী ধাপ:", "Next step:")}</p>
            <p className="mt-0.5">{tool.outcome[lang]}</p>
            <p className="mt-2 text-[#8a6410]">💰 {tool.feeNote[lang]}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button onClick={() => window.print()} className="rounded-xl bg-[#134970] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0f3b5c]">
            🖨️ {pick("প্রিন্ট / PDF সেভ", "Print / Save PDF")}
          </button>
          <button
            onClick={() => { setDone(false); setStepIdx(0); setValues({}); }}
            className="rounded-xl ring-1 ring-[#c9dcea] px-5 py-2.5 text-sm font-bold text-[#134970] hover:bg-[#f2f8fc]"
          >
            {pick("নতুন আবেদন", "New application")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white ring-1 ring-[#dbe7f0] p-5 sm:p-8">
      {/* progress */}
      <ol className="flex items-center gap-1.5 mb-7" aria-label={pick("অগ্রগতি", "Progress")}>
        {tool.steps.map((s, i) => (
          <li key={s.id} className="flex-1">
            <div className={cx("h-1.5 rounded-full", i <= stepIdx ? "bg-[#1d7bb8]" : "bg-[#dbe7f0]")} />
            <p className={cx("mt-1.5 text-[10px] font-semibold truncate", i === stepIdx ? "text-[#134970]" : "text-[#8aa7ba]")}>{s.title[lang]}</p>
          </li>
        ))}
      </ol>

      <h2 className="text-lg font-bold text-[#134970]">{step.title[lang]}</h2>
      {step.help[lang] && <p className="text-sm text-[#5c7a8e] mt-1">{step.help[lang]}</p>}

      <div className="mt-6 space-y-5">
        {step.fields.map((f) => {
          const key = label(step.id, f.id);
          const val = values[key] ?? "";
          const common = "w-full rounded-xl border border-[#dbe7f0] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#134970]/25 bg-[#fbfdfe]";
          return (
            <div key={f.id}>
              <label htmlFor={key} className="block text-sm font-semibold text-[#33546b] mb-1.5">
                {f.label[lang]} {f.required && <span className="text-[#c0392b]" aria-hidden>*</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea id={key} rows={3} value={val} onChange={(e) => set(step.id, f.id, e.target.value)} className={common} />
              ) : f.type === "select" ? (
                <select id={key} value={val} onChange={(e) => set(step.id, f.id, e.target.value)} className={common}>
                  <option value="">{pick("-- নির্বাচন করুন --", "-- Select --")}</option>
                  {f.options?.map((o, i) => <option key={i} value={o[lang]}>{o[lang]}</option>)}
                </select>
              ) : f.type === "radio" ? (
                <div className="flex gap-2.5">
                  {f.options?.map((o, i) => (
                    <label key={i} className={cx("flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm cursor-pointer",
                      val === o[lang] ? "border-[#134970] bg-[#e8f2f9] text-[#134970] font-semibold" : "border-[#dbe7f0] bg-[#fbfdfe]")}>
                      <input type="radio" name={key} checked={val === o[lang]} onChange={() => set(step.id, f.id, o[lang])} className="accent-[#134970]" />
                      {o[lang]}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  id={key}
                  type={f.type === "tel" ? "tel" : f.type === "date" ? "date" : "text"}
                  value={val}
                  onChange={(e) => set(step.id, f.id, e.target.value)}
                  className={common}
                  placeholder={f.hint?.[lang]}
                />
              )}
              {f.hint && f.type !== "text" && <p className="mt-1 text-[11px] text-[#7d99ac]">{f.hint[lang]}</p>}
            </div>
          );
        })}
      </div>

      {missing.length > 0 && stepIdx > 0 === false && null}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
          disabled={stepIdx === 0}
          className="rounded-xl ring-1 ring-[#c9dcea] px-4 py-2.5 text-sm font-bold text-[#134970] disabled:opacity-40 hover:bg-[#f2f8fc]"
        >
          ← {pick("পেছনে", "Back")}
        </button>
        {last ? (
          <button
            onClick={() => missing.length === 0 && setDone(true)}
            disabled={missing.length > 0}
            className="rounded-xl bg-[#1d7bb8] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#156a9e] disabled:opacity-40"
            title={missing.length ? `${pick("বাধ্যতামূলক:", "Required:")} ${missing.join(", ")}` : ""}
          >
            ✅ {pick("আবেদন তৈরি করুন", "Generate application")}
          </button>
        ) : (
          <button
            onClick={() => missing.length === 0 && setStepIdx((i) => i + 1)}
            disabled={missing.length > 0}
            className="rounded-xl bg-[#134970] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0f3b5c] disabled:opacity-40"
            title={missing.length ? `${pick("বাধ্যতামূলক:", "Required:")} ${missing.join(", ")}` : ""}
          >
            {pick("পরবর্তী", "Next")} →
          </button>
        )}
      </div>
      {missing.length > 0 && (
        <p className="mt-3 text-xs text-[#a94442] bg-[#fdf0ef] rounded-lg px-3 py-2">
          {pick("বাধ্যতামূলক ঘরগুলো পূরণ করুন:", "Please fill the required fields:")} {missing.join(", ")}
        </p>
      )}
    </div>
  );
}
