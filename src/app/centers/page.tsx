"use client";
import { useI18n } from "@/lib/i18n";
import CenterFinder from "@/components/CenterFinder";

export default function CentersPage() {
  const { pick } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#134970]">📍 {pick("আইনি স্ব-সহায়তা কেন্দ্র খুঁজুন", "Find a Legal Self-Help Center")}</h1>
      <p className="mt-3 max-w-2xl text-[15px] text-[#4a6b82] leading-relaxed">
        {pick(
          "জেলা আইনি সহায়তা অফিস (DLAO), ইউনিয়ন ডিজিটাল সেন্টার (UDC), এনজিও কেন্দ্র ও হেল্পলাইন — আপনার এলাকা বেছে নিন।",
          "District Legal Aid Offices (DLAO), Union Digital Centres (UDC), NGO centers and helplines — pick your area."
        )}
      </p>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <a href="tel:16699" className="flex items-center justify-between rounded-2xl bg-[#134970] text-white px-5 py-4 hover:bg-[#0f3b5c] transition-colors">
          <span className="text-sm font-bold">📞 {pick("আইনি সহায়তা হেল্পলাইন ১৬৬৯৯", "Legal aid helpline 16699")}</span>
          <span aria-hidden>→</span>
        </a>
        <a href="tel:999" className="flex items-center justify-between rounded-2xl bg-[#c0392b] text-white px-5 py-4 hover:bg-[#a93226] transition-colors">
          <span className="text-sm font-bold">🚨 {pick("জরুরি সেবা ৯৯৯", "Emergency 999")}</span>
          <span aria-hidden>→</span>
        </a>
      </div>

      <div className="mt-8">
        <CenterFinder />
      </div>
    </div>
  );
}
