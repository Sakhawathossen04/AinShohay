"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// ── Demo DLAS store ────────────────────────────────────────────────────────────
// A single shared record store powering all prototype demos (T-modules, flows,
// role consoles). In production this would be a server API; here it is a typed,
// event-driven client store with audit history so demos stay stateful and testable.

export type Provenance =
  | "applicant-confirmed"
  | "representative-reported"
  | "intermediary-translated"
  | "staff-entered"
  | "ai-inferred";

export type SafeContactState = "unknown" | "unsafe-reported" | "safe-confirmed" | "neutral-channel";

export interface CaseRecord {
  id: string;
  applicationId: string;
  title: string;
  citizen: string;
  district: string;
  type: "maintenance" | "dower" | "land" | "labour" | "cyber" | "consumer" | "other";
  status: "intake" | "verification" | "accepted" | "mediation" | "lawyer" | "referral" | "closed";
  priority: "normal" | "urgent" | "sensitive";
  provenance: Provenance;
  safeContact: SafeContactState;
  representation?: { name: string; kind: "family" | "udc" | "lawyer"; scope: string };
  documents: { id: string; name: string; provenance: Provenance; restricted?: boolean; ok?: boolean }[];
  tasks: { id: string; label: string; owner: string; done: boolean; overdue?: boolean }[];
  audit: AuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  at: string;
  actor: string;
  role: string;
  action: string;
  detail?: string;
  channel?: "web" | "udc" | "helpline" | "office" | "system";
}

export const SEED_CASES: CaseRecord[] = [
  {
    id: "CASE-240118",
    applicationId: "APP-100234",
    title: "ময়ূরী আক্তার — ভরণপোষণ দাবি",
    citizen: "ময়ূরী আক্তার",
    district: "জয়পুরহাট",
    type: "maintenance",
    status: "verification",
    priority: "normal",
    provenance: "representative-reported",
    safeContact: "unsafe-reported",
    representation: { name: "রিপন (ভাই)", kind: "family", scope: "আবেদন দাখিল ও তথ্য শোনা — নিশ্চিতকরণ নয়" },
    documents: [
      { id: "DOC-1", name: "বিবাহনামা (Nikahnama)", provenance: "representative-reported", ok: true },
      { id: "DOC-2", name: "সন্তানের জন্মনিবন্ধন", provenance: "representative-reported", ok: true },
      { id: "DOC-3", name: "NID (আবেদনকারী)", provenance: "applicant-confirmed", ok: false },
    ],
    tasks: [
      { id: "T-1", label: "নিরাপদ যোগাযোগ নম্বর নিশ্চিতকরণ", owner: "DLAO", done: false, overdue: false },
      { id: "T-2", label: "ময়ূরীর নিজস্ব নিশ্চিতকরণ (ভিন্ন চ্যানেল)", owner: "16699 এজেন্ট", done: false },
      { id: "T-3", label: "NID পুনরুদ্ধার সহায়তা", owner: "UDC", done: false },
    ],
    audit: [
      { at: "2026-09-18T10:12:00Z", actor: "রিপন", role: "প্রতিনিধি", action: "আবেদন দাখিল (১৬৬৯৯ ভয়েস)", channel: "helpline", detail: "প্রতিনিধি-প্রতিবেদিত তথ্য" },
      { at: "2026-09-18T10:14:00Z", actor: "সিস্টেম", role: "সেফ-কন্টাক্ট", action: "অনিরাপদ যোগাযোগ ফ্ল্যাগ", detail: "স্বামীর নিয়ন্ত্রিত নম্বর — নিরপেক্ষ বার্তা চালু" },
    ],
    createdAt: "2026-09-18",
    updatedAt: "2026-09-19",
  },
  {
    id: "CASE-240122",
    applicationId: "APP-100251",
    title: "নাবিলা — সাইবার নিপীড়ন (জরুরি)",
    citizen: "নাবিলা",
    district: "ঝিনাইদহ",
    type: "cyber",
    status: "referral",
    priority: "urgent",
    provenance: "applicant-confirmed",
    safeContact: "safe-confirmed",
    documents: [
      { id: "DOC-4", name: "স্ক্রিনশট ব্যাক (সীমিত অ্যাক্সেস)", provenance: "applicant-confirmed", restricted: true, ok: true },
      { id: "DOC-5", name: "অভিযোগ বিবরণ", provenance: "applicant-confirmed", ok: true },
    ],
    tasks: [
      { id: "T-4", label: "সংবেদনশীল তথ্যে ভূমিকা-ভিত্তিক অ্যাক্সেস নিশ্চিত", owner: "DLAO", done: true },
      { id: "T-5", label: "সাইবার ট্রাইব্যুনাল/প্রতিবেশী জেলায় রেফারেল স্বীকৃতি", owner: "রিসিভিং DLAO", done: false, overdue: true },
    ],
    audit: [
      { at: "2026-09-19T08:40:00Z", actor: "নাবিলা", role: "আবেদনকারী", action: "ওয়েব ইনটেক সম্পন্ন", channel: "web" },
      { at: "2026-09-19T09:05:00Z", actor: "DLAO", role: "কর্মকর্তা", action: "জরুরি রেফারেল প্রেরণ", channel: "office", detail: "কারণ, ইতিহাস ও নথিসহ প্যাকেজ" },
    ],
    createdAt: "2026-09-19",
    updatedAt: "2026-09-20",
  },
  {
    id: "CASE-240127",
    applicationId: "APP-100266",
    title: "নুচিং মারমা — ভূমি নথি সহায়তা",
    citizen: "নুচিং মারমা",
    district: "খাগড়াছড়ি",
    type: "land",
    status: "intake",
    priority: "normal",
    provenance: "intermediary-translated",
    safeContact: "neutral-channel",
    representation: { name: "UDC উদ্যোক্তা (কামাল)", kind: "udc", scope: "ফরম পূরণ ও ছবি তোলা — সিদ্ধান্ত নয়" },
    documents: [
      { id: "DOC-6", name: "জমির দলিলের ছবি", provenance: "intermediary-translated", ok: false },
      { id: "DOC-7", name: "অনুবাদ-সহ বিবরণ", provenance: "intermediary-translated", ok: true },
    ],
    tasks: [{ id: "T-6", label: "দলিলের ছবি পুনঃতোলা (অস্পষ্ট)", owner: "UDC", done: false }],
    audit: [
      { at: "2026-09-20T05:55:00Z", actor: "UDC উদ্যোক্তা", role: "সহকারী", action: "অফলাইন ইনটেক সম্পন্ন", channel: "udc", detail: "ডিভাইসে সংরক্ষিত, সিঙ্ক অপেক্ষমাণ" },
    ],
    createdAt: "2026-09-20",
    updatedAt: "2026-09-20",
  },
  {
    id: "CASE-240131",
    applicationId: "APP-100270",
    title: "আবদুল মালেক — দীর্ঘস্থায়ী মামলা",
    citizen: "আবদুল মালেক",
    district: "বরগুনা",
    type: "other",
    status: "lawyer",
    priority: "normal",
    provenance: "staff-entered",
    safeContact: "safe-confirmed",
    documents: [{ id: "DOC-8", name: "আদালতের তারিখ নোট", provenance: "staff-entered", ok: true }],
    tasks: [
      { id: "T-7", label: "প্যানেল আইনজীবীর আপডেট (২ বার বাকি)", owner: "প্যানেল আইনজীবী", done: false, overdue: true },
      { id: "T-8", label: "মালেককে ভয়েসে স্ট্যাটাস জানানো", owner: "16699", done: false },
    ],
    audit: [
      { at: "2026-09-15T11:00:00Z", actor: "প্যানেল আইনজীবী", role: "আইনজীবী", action: "হিয়ারিং আপডেট বাকি", detail: "দ্বিতীয়বার — প্যাটার্ন অ্যালার্ট তৈরি" },
      { at: "2026-09-16T06:30:00Z", actor: "১৬৬৯৯", role: "হেল্পলাইন", action: "ভয়েস স্ট্যাটাস কল", channel: "helpline" },
    ],
    createdAt: "2026-02-14",
    updatedAt: "2026-09-16",
  },
  {
    id: "CASE-240133",
    applicationId: "APP-100271",
    title: "সালমা বেগম — কারখানার ক্ষতিপূরণ (সংশ্লিষ্ট ঘটনা)",
    citizen: "সালমা বেগম",
    district: "গাজীপুর",
    type: "labour",
    status: "accepted",
    priority: "normal",
    provenance: "applicant-confirmed",
    safeContact: "safe-confirmed",
    documents: [{ id: "DOC-9", name: "সাধারণ নিরাপত্তা রিপোর্ট (গ্রুপ প্রমাণ)", provenance: "staff-entered", ok: true }],
    tasks: [{ id: "T-9", label: "সংশ্লিষ্ট ৩টি কেসের গ্রুপ ভিউ যাচাই", owner: "DLAO", done: false }],
    audit: [{ at: "2026-09-17T07:00:00Z", actor: "DLAO", role: "কর্মকর্তা", action: "সংশ্লিষ্ট ঘটনা গ্রুপে যুক্ত", channel: "office" }],
    createdAt: "2026-09-17",
    updatedAt: "2026-09-17",
  },
];

interface DLASCtx {
  cases: CaseRecord[];
  logAudit: (caseId: string, entry: Omit<AuditEntry, "at">) => void;
  patchCase: (caseId: string, patch: Partial<CaseRecord>, audit?: Omit<AuditEntry, "at">) => void;
  toggleTask: (caseId: string, taskId: string) => void;
  reset: () => void;
}

const Ctx = createContext<DLASCtx | null>(null);

export function DLASProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<CaseRecord[]>(SEED_CASES);

  const logAudit = useCallback((caseId: string, entry: Omit<AuditEntry, "at">) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? { ...c, audit: [{ ...entry, at: new Date().toISOString() }, ...c.audit], updatedAt: new Date().toISOString().slice(0, 10) }
          : c
      )
    );
  }, []);

  const patchCase = useCallback((caseId: string, patch: Partial<CaseRecord>, audit?: Omit<AuditEntry, "at">) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const next = { ...c, ...patch, updatedAt: new Date().toISOString().slice(0, 10) };
        if (audit) next.audit = [{ ...audit, at: new Date().toISOString() }, ...next.audit];
        return next;
      })
    );
  }, []);

  const toggleTask = useCallback((caseId: string, taskId: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
              audit: [
                {
                  at: new Date().toISOString(),
                  actor: "ডেমো ইউজার",
                  role: "পরীক্ষক",
                  action: "টাস্ক আপডেট",
                  detail: taskId,
                  channel: "office" as const,
                },
                ...c.audit,
              ],
            }
          : c
      )
    );
  }, []);

  const reset = useCallback(() => setCases(SEED_CASES), []);

  const value = useMemo(() => ({ cases, logAudit, patchCase, toggleTask, reset }), [cases, logAudit, patchCase, toggleTask, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDLAS(): DLASCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDLAS must be used within DLASProvider");
  return ctx;
}
