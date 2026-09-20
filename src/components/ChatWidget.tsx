"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { reply } from "@/lib/chatBrain";
import { cx } from "@/lib/utils";

type Msg = { role: "bot" | "user"; text: string; action?: { label: string; href: string }; suggestions?: string[] };

const WELCOME: Msg = {
  role: "bot",
  text: "",
};

export default function ChatWidget() {
  const { lang, pick } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ ...WELCOME, text: pick(
    "আসসালামু আলাইকুম! আমি ন্যায়বন্ধু 🤖 — সমস্যা লিখুন বা অপশন বেছে নিন, আমি সঠিক পেজে নিয়ে যাব।",
    "Hello! I am NyayBondhu 🤖 — type your problem or pick an option, and I will take you to the right page."
  ), suggestions: pick(
    "ভরণপোষণ|নামজারি|বকেয়া বেতন|সাইবার ব্ল্যাকমেইল|হেল্পলাইন ১৬৬৯৯",
    "Maintenance|Land mutation|Unpaid wages|Cyber blackmail|Helpline 16699"
  ).split("|") }]);

  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    setTimeout(() => {
      const r = reply(q, lang);
      setMsgs((m) => [...m, { role: "bot", text: r.answer, action: r.action, suggestions: r.suggestions }]);
      setBusy(false);
    }, 420);
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#134970] text-white pl-4 pr-5 py-3 shadow-xl shadow-[#0f3350]/30 hover:bg-[#0f3b5c] transition-all"
        aria-expanded={open}
        aria-label={pick("চ্যাট সহায়ক খুলুন", "Open chat assistant")}
      >
        <span aria-hidden className="text-lg">{open ? "✕" : "💬"}</span>
        <span className="text-sm font-semibold">{open ? pick("বন্ধ", "Close") : pick("ন্যায়বন্ধু", "NyayBondhu")}</span>
        {!open && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#e8b23a] ring-2 ring-white" aria-hidden />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-4 sm:right-5 z-50 w-[min(380px,calc(100vw-2rem))] rounded-3xl overflow-hidden bg-white shadow-2xl ring-1 ring-[#dbe7f0] flex flex-col max-h-[70vh]">
          <div className="bg-[#134970] text-white px-4 py-3 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-white/15 grid place-items-center text-lg" aria-hidden>⚖️</span>
            <div className="leading-tight">
              <p className="font-bold text-sm">ন্যায়বন্ধু — {pick("সাইট সহায়ক", "Site Assistant")}</p>
              <p className="text-[11px] text-white/75">{pick("প্রশ্ন করুন, সঠিক রিসোর্সে যান", "Ask anything, reach the right resource")}</p>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3 bg-[#f6fafc]" role="log" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cx("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user" ? "bg-[#134970] text-white rounded-br-md" : "bg-white text-[#2b4557] ring-1 ring-[#e4eef4] rounded-bl-md")}>
                  <p>{m.text}</p>
                  {m.action && (
                    <Link
                      href={m.action.href}
                      onClick={() => setOpen(false)}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e8b23a] text-[#3d2e07] px-3 py-1.5 text-xs font-bold hover:brightness-105"
                    >
                      {m.action.label} <span aria-hidden>→</span>
                    </Link>
                  )}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="rounded-full border border-[#c9dcea] bg-[#f2f8fc] px-2.5 py-1 text-[11px] font-medium text-[#33546b] hover:bg-[#e4eff7]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md ring-1 ring-[#e4eef4] px-4 py-3 flex gap-1" aria-label={pick("লিখছেন…", "Typing…")}>
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#9db8ca] animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            className="border-t border-[#e4eef4] bg-white p-3 flex gap-2"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-[#dbe7f0] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#134970]/25"
              placeholder={pick("আপনার প্রশ্ন লিখুন…", "Type your question…")}
              aria-label={pick("চ্যাট মেসেজ", "Chat message")}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-xl bg-[#134970] text-white px-4 font-semibold text-sm disabled:opacity-40 hover:bg-[#0f3b5c] transition-colors"
            >
              {pick("পাঠান", "Send")}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
