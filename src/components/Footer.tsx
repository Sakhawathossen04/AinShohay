"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import Logo from "./Logo";

export default function Footer() {
  const { pick } = useI18n();
  return (
    <footer className="mt-16 bg-[#0f3350] text-[#cfe2ef]">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <Logo dark />
          <p className="text-sm leading-relaxed max-w-md">
            {pick(
              "CoU Justice Lab — বাংলাদেশের নাগরিকদের জন্য বিনামূল্যে আইনি স্ব-সহায়তা প্ল্যাটফর্ম। সহজ বাংলায় অধিকার, প্রক্রিয়া ও ফরম — এবং একটি ডিজিটাল লিগ্যাল এইড সিস্টেম প্রোটোটাইপ।",
              "CoU Justice Lab — a free legal self-help platform for the people of Bangladesh. Rights, processes and forms in plain Bangla — plus a Digital Legal Aid System prototype."
            )}
          </p>
          <p className="text-xs text-[#8fb4cc] max-w-md">
            {pick(
              "দাবিত্যাগ: এই সাইটের তথ্য সাধারণ সচেতনতার জন্য; এটি আইনি পরামর্শ নয়। ব্যক্তিগত মামলার জন্য আইনজীবী বা জেলা আইনি সহায়তা অফিসের সঙ্গে যোগাযোগ করুন।",
              "Disclaimer: information here is for general awareness and is not legal advice. For your specific case, consult a lawyer or the District Legal Aid Office."
            )}
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm mb-3">{pick("দ্রুত লিংক", "Quick links")}</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/topics">{pick("বিষয়সমূহ", "Topics")}</Link></li>
            <li><Link className="hover:text-white" href="/toolbox">{pick("টুলবক্স", "Toolbox")}</Link></li>
            <li><Link className="hover:text-white" href="/centers">{pick("সহায়তা কেন্দ্র", "Help centers")}</Link></li>
            <li><Link className="hover:text-white" href="/prototype">{pick("কেস প্রোটোটাইপ", "Case prototype")}</Link></li>
            <li><Link className="hover:text-white" href="/help">{pick("আমরা কীভাবে সাহায্য করি", "How we help")}</Link></li>
            <li><Link className="hover:text-white" href="/contact">{pick("যোগাযোগ", "Contact")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm mb-3">{pick("যোগাযোগ", "Contact")}</h3>
          <ul className="space-y-2 text-sm">
            <li>📞 <a className="hover:text-white" href="tel:16699">16699</a> — {pick("আইনি সহায়তা হেল্পলাইন", "Legal aid helpline")}</li>
            <li>🚨 <a className="hover:text-white" href="tel:999">999</a> — {pick("জরুরি সেবা", "Emergency")}</li>
            <li>✉️ hello@coujusticelab.org</li>
            <li>📍 {pick("ঢাকা, বাংলাদেশ", "Dhaka, Bangladesh")}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#1c4a6b]">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-[#8fb4cc] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 CoU Justice Lab. {pick("শিক্ষামূলক প্রোটোটাইপ — সব তথ্য নমুনা।", "Educational prototype — all data is illustrative.")}</span>
          <span>{pick("নাগরিকদের জন্য ❤️ দিয়ে নির্মিত", "Built with ❤️ for citizens")}</span>
        </div>
      </div>
    </footer>
  );
}
