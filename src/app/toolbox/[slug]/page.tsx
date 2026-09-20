"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { TOOLS } from "@/data/tools";
import ToolWizard from "@/components/ToolWizard";

export default function ToolPage() {
  const params = useParams<{ slug: string }>();
  const { pick, lang } = useI18n();
  const tool = TOOLS.find((t) => t.slug === params.slug);

  if (!tool) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg font-bold text-[#134970]">{pick("টুল পাওয়া যায়নি", "Tool not found")}</p>
        <Link href="/toolbox" className="mt-3 inline-block text-sm font-bold text-[#1d7bb8] hover:underline">← {pick("টুলবক্স", "Toolbox")}</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-xs text-[#7d99ac] mb-4" aria-label="Breadcrumb">
        <Link href="/toolbox" className="hover:underline">{pick("টুলবক্স", "Toolbox")}</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[#134970] font-semibold">{tool.title[lang]}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-[#134970] flex items-center gap-3">
            <span aria-hidden>{tool.icon}</span> {tool.title[lang]}
          </h1>
          <p className="mt-2 text-sm text-[#4a6b82] leading-relaxed">{tool.purpose[lang]}</p>
          <div className="mt-6">
            <ToolWizard tool={tool} />
          </div>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl bg-[#f6fafc] ring-1 ring-[#e4eef4] p-5">
            <h2 className="text-sm font-bold text-[#134970]">📍 {pick("কোথায় জমা দেবেন", "Where to submit")}</h2>
            <ul className="mt-2.5 space-y-1.5 text-xs text-[#4a6b82] list-disc ml-4">
              {tool.where.map((w, i) => <li key={i}>{w[lang]}</li>)}
            </ul>
            <h2 className="text-sm font-bold text-[#134970] mt-4">🎯 {pick("ফলাফল", "Outcome")}</h2>
            <p className="mt-1.5 text-xs text-[#4a6b82] leading-relaxed">{tool.outcome[lang]}</p>
            <p className="mt-3 text-xs font-bold text-[#8a6410]">💰 {tool.feeNote[lang]}</p>
          </div>
          <div className="rounded-2xl bg-[#fdf9ef] ring-1 ring-[#efe3c8] p-5 text-xs text-[#7a5c1a] leading-relaxed">
            🔒 {pick("আপনার উত্তর এই ডেমোতে শুধু আপনার ব্রাউজারে থাকে — কোথাও পাঠানো হয় না।", "In this demo your answers stay only in your browser — nothing is sent anywhere.")}
          </div>
          <Link href="/centers" className="block rounded-2xl bg-[#134970] text-white text-center px-5 py-3.5 text-sm font-bold hover:bg-[#0f3b5c]">
            📍 {pick("সহায়তা কেন্দ্র খুঁজুন", "Find help centers")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
