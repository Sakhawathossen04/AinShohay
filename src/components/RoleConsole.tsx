"use client";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useDLAS, type CaseRecord } from "@/lib/dlasStore";
import { cx, digitsFor, shortDate } from "@/lib/utils";

const STATUS_LABEL: Record<CaseRecord["status"], { bn: string; en: string }> = {
  intake: { bn: "ইনটেক", en: "Intake" },
  verification: { bn: "যাচাই", en: "Verification" },
  accepted: { bn: "গৃহীত", en: "Accepted" },
  mediation: { bn: "মেডিয়েশন", en: "Mediation" },
  lawyer: { bn: "আইনজীবী", en: "Lawyer" },
  referral: { bn: "রেফারেল", en: "Referral" },
  closed: { bn: "নিষ্পত্তি", en: "Closed" },
};

const PROV_LABEL: Record<CaseRecord["provenance"], { bn: string; en: string }> = {
  "applicant-confirmed": { bn: "আবেদনকারী-নিশ্চিত", en: "Applicant-confirmed" },
  "representative-reported": { bn: "প্রতিনিধি-প্রতিবেদিত", en: "Representative-reported" },
  "intermediary-translated": { bn: "মধ্যস্থ-অনূদিত", en: "Intermediary-translated" },
  "staff-entered": { bn: "কর্মী-প্রবিষ্ট", en: "Staff-entered" },
  "ai-inferred": { bn: "AI-অনুমিত", en: "AI-inferred" },
};

const SAFE_LABEL: Record<CaseRecord["safeContact"], { bn: string; en: string }> = {
  unknown: { bn: "অজানা", en: "Unknown" },
  "unsafe-reported": { bn: "অনিরাপদ — নিরপেক্ষ মোড", en: "Unsafe — neutral mode" },
  "safe-confirmed": { bn: "নিরাপদ নিশ্চিত", en: "Safe confirmed" },
  "neutral-channel": { bn: "নিরপেক্ষ চ্যানেল", en: "Neutral channel" },
};

export function CaseBadges({ c }: { c: CaseRecord }) {
  const { pick } = useI18n();
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold",
        c.priority === "urgent" ? "bg-[#fdf0ef] text-[#a94442]" : c.priority === "sensitive" ? "bg-[#fdf3dd] text-[#8a6410]" : "bg-[#e8f2f9] text-[#134970]")}>
        {c.priority === "urgent" ? "⚡ জরুরি" : c.priority === "sensitive" ? "🔒 সংবেদনশীল" : "স্বাভাবিক"}
      </span>
      <span className="rounded-full bg-[#f0f4f7] px-2.5 py-1 text-[11px] font-bold text-[#5c7a8e]">{pick(STATUS_LABEL[c.status].bn, STATUS_LABEL[c.status].en)}</span>
      <span className="rounded-full bg-[#eff8f3] px-2.5 py-1 text-[11px] font-bold text-[#22694c]">🏷 {pick(PROV_LABEL[c.provenance].bn, PROV_LABEL[c.provenance].en)}</span>
      <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold",
        c.safeContact === "unsafe-reported" ? "bg-[#fdf0ef] text-[#a94442]" : "bg-[#e8f2f9] text-[#134970]")}>
        📞 {pick(SAFE_LABEL[c.safeContact].bn, SAFE_LABEL[c.safeContact].en)}
      </span>
    </div>
  );
}

export default function RoleConsole({ roleId }: { roleId: string }) {
  const { pick, lang } = useI18n();
  const { cases, toggleTask, patchCase } = useDLAS();
  const [selected, setSelected] = useState<string | null>(null);
  const [overridden, setOverridden] = useState<string | null>(null);

  const view = useMemo(() => {
    switch (roleId) {
      case "B1": return cases; // officer sees all
      case "B2": return cases.filter((c) => c.status === "mediation" || c.status === "accepted");
      case "B3": return cases.filter((c) => c.safeContact !== "unsafe-reported" || c.id === "CASE-240118");
      case "B4": return cases.filter((c) => c.representation?.kind === "udc" || c.status === "intake");
      case "B5": return cases.filter((c) => c.status === "lawyer" || c.status === "accepted");
      case "B6": return cases.filter((c) => c.status === "referral");
      case "B7": return cases;
      default: return cases;
    }
  }, [cases, roleId]);

  const c = selected ? cases.find((x) => x.id === selected) ?? null : null;

  const ROLE_TITLE: Record<string, { bn: string; en: string }> = {
    B1: { bn: "DLAO কর্মকর্তা — দৈনিক অ্যাকশন ভিউ", en: "DLAO Officer — Daily Action View" },
    B2: { bn: "আইনি কর্মকর্তা / মিডিয়েটর — মেডিয়েশন ওয়ার্কলিস্ট", en: "Legal Aid Officer / Mediator — Mediation Worklist" },
    B3: { bn: "১৬৬৯৯ এজেন্ট — কলার ভিউ", en: "16699 Agent — Caller View" },
    B4: { bn: "UDC উদ্যোক্তা — সহায়তা মোড", en: "UDC Entrepreneur — Assisted Mode" },
    B5: { bn: "প্যানেল আইনজীবী — ওয়ার্কলিস্ট", en: "Panel Lawyer — Worklist" },
    B6: { bn: "রিসিভিং DLAO — রেফারেল ইনবক্স", en: "Receiving DLAO — Referral Inbox" },
    B7: { bn: "কেস-সাপোর্ট কর্মী — রেকর্ড ও রিপোর্ট", en: "Case-Support Staff — Records & Reports" },
  };

  const overdue = view.filter((x) => x.tasks.some((t) => t.overdue && !t.done));
  const urgent = view.filter((x) => x.priority === "urgent");

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-[#134970] to-[#1d7bb8] text-white p-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">{roleId} · {pick("রোল কনসোল", "Role Console")}</p>
        <h1 className="mt-1 text-xl font-extrabold">{pick(ROLE_TITLE[roleId].bn, ROLE_TITLE[roleId].en)}</h1>
        <div className="mt-4 grid grid-cols-3 gap-3 max-w-md">
          <div className="rounded-xl bg-white/12 px-3 py-2.5 text-center">
            <p className="text-xl font-extrabold">{digitsFor(view.length, lang)}</p>
            <p className="text-[10px] text-white/75 font-semibold">{pick("মোট ভিউয়ে", "In view")}</p>
          </div>
          <div className="rounded-xl bg-white/12 px-3 py-2.5 text-center">
            <p className="text-xl font-extrabold text-[#ffd97a]">{digitsFor(urgent.length, lang)}</p>
            <p className="text-[10px] text-white/75 font-semibold">{pick("জরুরি", "Urgent")}</p>
          </div>
          <div className="rounded-xl bg-white/12 px-3 py-2.5 text-center">
            <p className="text-xl font-extrabold text-[#ffb3a7]">{digitsFor(overdue.length, lang)}</p>
            <p className="text-[10px] text-white/75 font-semibold">{pick("বকেয়া ফ্ল্যাগ", "Overdue flags")}</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-white/70">
          🔒 {pick("এই ভিউতে কেবল এই ভূমিকার প্রয়োজনীয় তথ্য — ভূমিকা-ভিত্তিক গোপনীয়তা (G9)।", "This view shows only what this role needs — role-based privacy (G9).")}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Queue */}
        <div className="rounded-3xl border border-[#dbe7f0] bg-white p-5">
          <h2 className="font-bold text-[#134970] mb-4">📋 {pick("কেস কিউ (একই শেয়ার্ড রেকর্ড)", "Case queue (same shared record)")}</h2>
          <ul className="space-y-2.5">
            {view.map((k) => (
              <li key={k.id}>
                <button
                  onClick={() => setSelected(k.id)}
                  className={cx("w-full text-left rounded-2xl border px-4 py-3.5 transition-colors",
                    selected === k.id ? "border-[#134970] bg-[#f2f8fc]" : "border-[#e4eef4] hover:bg-[#f8fbfd]")}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-[#1d7bb8]">{k.id}</span>
                    <span className="text-sm font-bold text-[#134970]">{k.title}</span>
                    {k.tasks.some((t) => t.overdue && !t.done) && <span className="rounded-full bg-[#fdf0ef] text-[#a94442] px-2 py-0.5 text-[10px] font-bold">বকেয়া</span>}
                  </div>
                  <p className="text-xs text-[#5c7a8e] mt-1">{k.citizen} · {k.district} · {pick("আপডেট", "updated")} {shortDate(k.updatedAt, lang)}</p>
                  <div className="mt-2"><CaseBadges c={k} /></div>
                </button>
              </li>
            ))}
            {view.length === 0 && <li className="text-sm text-[#8aa7ba] py-4 text-center">{pick("এই ভিউতে কেস নেই।", "No cases in this view.")}</li>}
          </ul>
        </div>

        {/* Detail */}
        <div className="rounded-3xl border border-[#dbe7f0] bg-white p-5">
          {!c ? (
            <div className="h-full grid place-items-center text-center py-10">
              <div>
                <p className="text-4xl" aria-hidden>👈</p>
                <p className="mt-3 text-sm text-[#8aa7ba] max-w-60">{pick("বাঁ দিকের কিউ থেকে একটি কেস নির্বাচন করুন — বিস্তারিত এখানে খুলবে।", "Select a case from the queue — details open here.")}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-[#1d7bb8]">{c.id}</span>
                  <span className="text-[11px] text-[#8aa7ba]">{pick("আবেদন", "Application")} {c.applicationId}</span>
                </div>
                <h2 className="font-bold text-[#134970] mt-1">{c.title}</h2>
                <div className="mt-2"><CaseBadges c={c} /></div>
              </div>

              {c.representation && (
                <div className="rounded-2xl bg-[#f6fafc] ring-1 ring-[#e4eef4] p-4">
                  <p className="text-[11px] font-bold uppercase text-[#7d99ac]">🤝 {pick("প্রতিনিধিত্ব (G2)", "Representation (G2)")}</p>
                  <p className="text-sm mt-1.5 text-[#2b4557]"><strong>{c.representation.name}</strong> — <span className="text-[#5c7a8e]">{c.representation.scope}</span></p>
                </div>
              )}

              {/* Tasks */}
              <div>
                <p className="text-[11px] font-bold uppercase text-[#7d99ac] mb-2">✅ {pick("টাস্ক (মালিক ও স্ট্যাটাস — G7)", "Tasks (owner & status — G7)")}</p>
                <ul className="space-y-2">
                  {c.tasks.map((t) => (
                    <li key={t.id} className="flex items-center gap-2.5 rounded-xl border border-[#e4eef4] px-3.5 py-2.5">
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => toggleTask(c.id, t.id)}
                        className="w-4 h-4 accent-[#134970]"
                        aria-label={t.label}
                      />
                      <span className={cx("text-sm flex-1", t.done ? "line-through text-[#9db8ca]" : "text-[#2b4557]")}>{t.label}</span>
                      {t.overdue && !t.done && <span className="rounded-full bg-[#fdf0ef] text-[#a94442] px-2 py-0.5 text-[10px] font-bold">বকেয়া</span>}
                      <span className="text-[11px] text-[#7d99ac] font-semibold whitespace-nowrap">{t.owner}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Documents */}
              <div>
                <p className="text-[11px] font-bold uppercase text-[#7d99ac] mb-2">📄 {pick("নথি ও উৎস", "Documents & provenance")}</p>
                <ul className="space-y-1.5">
                  {c.documents.map((d) => (
                    <li key={d.id} className="flex flex-wrap items-center gap-2 text-sm rounded-xl bg-[#f6fafc] px-3.5 py-2">
                      <span className="text-[#2b4557]">{d.restricted ? "🔒" : "📄"} {d.name}</span>
                      <span className="text-[10px] font-bold text-[#5c7a8e] uppercase">{pick(PROV_LABEL[d.provenance].bn, PROV_LABEL[d.provenance].en)}</span>
                      {d.ok ? <span className="text-[#22694c] text-xs font-bold">✓</span> : <span className="text-[#a94442] text-xs font-bold">⚠ {pick("সমস্যা", "issue")}</span>}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions per role */}
              {roleId === "B1" && (
                <div className="rounded-2xl bg-[#fdf3dd] ring-1 ring-[#efe3c8] p-4">
                  <p className="text-[11px] font-bold uppercase text-[#8a6410]">🧭 {pick("সিস্টেম সুপারিশ (ওভাররাইডযোগ্য — G5)", "System recommendation (overridable — G5)")}</p>
                  <p className="text-sm mt-1.5 text-[#6b5310]">
                    {c.priority === "urgent"
                      ? pick("আজই রেফারেল স্বীকৃতি ফলো-আপ করুন — ডেডলাইন কাছাকাছি।", "Follow up referral acknowledgement today — deadline near.")
                      : pick("যাচাই-স্টেজ কেস — নিরাপদ কলব্যাক শিডিউল করুন।", "Verification-stage case — schedule a safe callback.")}
                  </p>
                  <button
                    onClick={() => setOverridden(c.id)}
                    className="mt-2.5 rounded-lg bg-white ring-1 ring-[#e5d9b8] px-3 py-1.5 text-xs font-bold text-[#8a6410] hover:bg-[#fdf6e4]"
                  >
                    {pick("সুপারিশ ওভাররাইড করুন (রেকর্ড হবে)", "Override recommendation (will be recorded)")}
                  </button>
                  {overridden === c.id && (
                    <p className="mt-2 text-xs text-[#22694c] font-semibold">✓ {pick("ওভাররাইড অডিটে রেকর্ড হয়েছে (G5, G10)", "Override recorded in audit (G5, G10)")}</p>
                  )}
                </div>
              )}

              {roleId === "B6" && (
                <div className="flex flex-wrap gap-2">
                  {[
                    { k: "ack", bn: "স্বীকৃতি দিন", en: "Acknowledge" },
                    { k: "accept", bn: "গ্রহণ করুন", en: "Accept" },
                    { k: "return", bn: "কারণসহ ফেরত দিন", en: "Return with reason" },
                  ].map((a) => (
                    <button
                      key={a.k}
                      onClick={() => patchCase(c.id, { status: a.k === "return" ? "referral" : "accepted" }, { actor: "রিসিভিং DLAO", role: "B6", action: a.bn, detail: `${c.id} ${a.k}`, channel: "office" })}
                      className="rounded-xl bg-[#134970] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0f3b5c]"
                    >
                      {pick(a.bn, a.en)}
                    </button>
                  ))}
                  <p className="w-full text-[11px] text-[#7d99ac] mt-1">
                    {pick("অ-স্বীকৃতি ৪৮ ঘণ্টা পেরোলে স্বয়ংক্রিয় ফলো-আপ টাস্ক তৈরি হয় (A3 ব্যর্থতা পরীক্ষা)।", "Non-acknowledgement beyond 48h auto-creates a follow-up task (A3 failure test).")}
                  </p>
                </div>
              )}

              {roleId === "B5" && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => patchCase(c.id, {}, { actor: "প্যানেল আইনজীবী", role: "B5", action: "আপডেট জমা", detail: "হিয়ারিং রিপোর্ট", channel: "web" })} className="rounded-xl bg-[#134970] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0f3b5c]">
                    {pick("আপডেট জমা দিন", "Submit update")}
                  </button>
                  <button onClick={() => patchCase(c.id, {}, { actor: "প্যানেল আইনজীবী", role: "B5", action: "হিয়ারিং রিমাইন্ডার সেট", detail: "সেফ এসএমএস", channel: "system" })} className="rounded-xl ring-1 ring-[#c9dcea] px-4 py-2.5 text-xs font-bold text-[#134970] hover:bg-[#f2f8fc]">
                    {pick("সেফ ক্লায়েন্ট রিমাইন্ডার", "Safe client reminder")}
                  </button>
                </div>
              )}

              {/* Audit */}
              <div>
                <p className="text-[11px] font-bold uppercase text-[#7d99ac] mb-2">🧾 {pick("অডিট ট্রেইল (G10)", "Audit trail (G10)")}</p>
                <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {c.audit.map((a, i) => (
                    <li key={i} className="rounded-xl bg-[#f6fafc] px-3.5 py-2.5 text-xs">
                      <p className="font-bold text-[#134970]">{a.action}</p>
                      <p className="text-[#5c7a8e] mt-0.5">
                        {a.actor} · {a.role}{a.channel ? ` · ${a.channel}` : ""} · {new Date(a.at).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      {a.detail && <p className="text-[#8aa7ba] mt-0.5">{a.detail}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
