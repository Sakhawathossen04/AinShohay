"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function ContactPage() {
  const { pick } = useI18n();
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#134970]">{pick("যোগাযোগ", "Contact")}</h1>
      <p className="mt-3 max-w-2xl text-[15px] text-[#4a6b82] leading-relaxed">
        {pick("প্রশ্ন, পরামর্শ বা সহযোগিতার জন্য আমাদের জানান — অথবা সরাসরি হেল্পলাইনে কল করুন।", "Send us questions, feedback or partnership ideas — or call the helpline directly.")}
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {[
            { icon: "📞", t: "আইনি সহায়তা হেল্পলাইন", en: "Legal aid helpline", v: "16699", href: "tel:16699" },
            { icon: "🚨", t: "জরুরি সেবা", en: "Emergency", v: "999", href: "tel:999" },
            { icon: "✉️", t: "ইমেইল", en: "Email", v: "hello@coujusticelab.org", href: "mailto:hello@coujusticelab.org" },
            { icon: "📍", t: "ঠিকানা", en: "Address", v: "ঢাকা, বাংলাদেশ / Dhaka, Bangladesh" },
          ].map((c) => (
            <div key={c.en} className="flex items-center gap-3.5 rounded-2xl bg-white ring-1 ring-[#dbe7f0] px-5 py-4">
              <span aria-hidden className="text-xl">{c.icon}</span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#7d99ac]">{pick(c.t, c.en)}</p>
                {c.href ? (
                  <a href={c.href} className="text-sm font-bold text-[#134970] hover:underline">{c.v}</a>
                ) : (
                  <p className="text-sm font-bold text-[#134970]">{c.v}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white ring-1 ring-[#dbe7f0] p-6">
          {sent ? (
            <div className="text-center py-8">
              <p className="text-4xl" aria-hidden>✅</p>
              <p className="mt-3 font-bold text-[#134970]">{pick("ধন্যবাদ! বার্তা গৃহীত হয়েছে (ডেমো)।", "Thank you! Message received (demo).")}</p>
              <button onClick={() => setSent(false)} className="mt-4 text-sm font-bold text-[#1d7bb8] hover:underline">
                {pick("আরেকটি বার্তা", "Send another")}
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="cname" className="block text-sm font-semibold text-[#33546b] mb-1.5">{pick("নাম", "Name")}</label>
                <input id="cname" required className="w-full rounded-xl border border-[#dbe7f0] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#134970]/25 bg-[#fbfdfe]" />
              </div>
              <div>
                <label htmlFor="cmail" className="block text-sm font-semibold text-[#33546b] mb-1.5">{pick("ইমেইল / ফোন", "Email / phone")}</label>
                <input id="cmail" required className="w-full rounded-xl border border-[#dbe7f0] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#134970]/25 bg-[#fbfdfe]" />
              </div>
              <div>
                <label htmlFor="cmsg" className="block text-sm font-semibold text-[#33546b] mb-1.5">{pick("বার্তা", "Message")}</label>
                <textarea id="cmsg" required rows={4} className="w-full rounded-xl border border-[#dbe7f0] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#134970]/25 bg-[#fbfdfe]" />
              </div>
              <button type="submit" className="w-full rounded-xl bg-[#134970] px-5 py-3 text-sm font-bold text-white hover:bg-[#0f3b5c]">
                {pick("পাঠিয়ে দিন", "Send message")}
              </button>
              <p className="text-[11px] text-[#8aa7ba] text-center">{pick("ডেমো ফরম — কোথাও পাঠানো হয় না।", "Demo form — nothing is sent.")}</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
