"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { pick } = useI18n();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#134970]">{pick("CoU Justice Lab সম্পর্কে", "About CoU Justice Lab")}</h1>
      <div className="mt-6 rounded-3xl bg-white ring-1 ring-[#dbe7f0] p-6 sm:p-8 space-y-5 text-[15px] text-[#2b4557] leading-relaxed">
        <p>
          {pick(
            "CoU Justice Lab বাংলাদেশের নাগরিকদের জন্য একটি বিনামূল্যে আইনি স্ব-সহায়তা প্ল্যাটফর্ম — যেখানে সাধারণ মানুষ সহজ বাংলায় জানতে পারেন তার অধিকার, প্রক্রিয়া, প্রয়োজনীয় কাগজ এবং কোথায় সাহায্য পাওয়া যায়।",
            "CoU Justice Lab is a free legal self-help platform for the people of Bangladesh — where ordinary people learn their rights, processes, required documents and where to get help, in plain Bangla."
          )}
        </p>
        <p>
          {pick(
            "এই প্ল্যাটফর্মটি ADLASB (Accelerating Digital Legal Aid Services in Bangladesh) প্রকল্পের গ্র্যান্ড ফিনালে কেসের ওপর নির্মিত একটি প্রোটোটাইপ — “পাঁচ দরজা, এক রেকর্ড” স্থাপত্যে: ৫টি নাগরিক দৃশ্যপট, ৭টি প্রদানকারী ভূমিকা ও ১১টি প্রযুক্তিগত চ্যালেঞ্জ একই শেয়ার্ড রেকর্ডে।",
            "The platform is built as a prototype for the ADLASB (Accelerating Digital Legal Aid Services in Bangladesh) grand finale case — a “five doors, one record” architecture: 5 citizen scenarios, 7 provider roles and 11 technical challenges on one shared record."
          )}
        </p>
        <div className="grid sm:grid-cols-3 gap-3 pt-2">
          {[
            { v: "২৩", bn: "বাধ্যতামূলক আইটেম কভারড", en: "Mandatory items covered" },
            { v: "১", bn: "শেয়ার্ড রেকর্ড আর্কিটেকচার", en: "Shared record architecture" },
            { v: "০", bn: "ফিচার-দ্বীপ (islands)", en: "Feature islands" },
          ].map((s) => (
            <div key={s.en} className="rounded-2xl bg-[#f2f8fc] p-4 text-center">
              <p className="text-2xl font-extrabold text-[#134970]">{s.v}</p>
              <p className="text-xs font-semibold text-[#33546b] mt-1">{pick(s.bn, s.en)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <Link href="/prototype" className="rounded-3xl bg-[#134970] text-white p-6 hover:bg-[#0f3b5c] transition-colors">
          <p className="font-bold">🧪 {pick("DLAS প্রোটোটাইপ দেখুন", "Explore the DLAS prototype")}</p>
          <p className="text-sm text-white/80 mt-1.5">{pick("কেস, ফ্লো ও প্রযুক্তি ডেমো", "Cases, flows and tech demos")}</p>
        </Link>
        <Link href="/contact" className="rounded-3xl bg-white ring-1 ring-[#dbe7f0] p-6 hover:bg-[#f8fbfd] transition-colors">
          <p className="font-bold text-[#134970]">✉️ {pick("যোগাযোগ করুন", "Contact us")}</p>
          <p className="text-sm text-[#4a6b82] mt-1.5">{pick("প্রশ্ন, পরামর্শ বা সহযোগিতা", "Questions, feedback or partnership")}</p>
        </Link>
      </div>
    </div>
  );
}
