"use client";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import Logo from "./Logo";
import { cx } from "@/lib/utils";

const NAV = [
  { href: "/topics", bn: "বিষয়সমূহ", en: "Topics" },
  { href: "/toolbox", bn: "টুলবক্স", en: "Toolbox" },
  { href: "/centers", bn: "সহায়তা কেন্দ্র", en: "Help Centers" },
  { href: "/prototype", bn: "কেস প্রোটোটাইপ", en: "Case Prototype" },
  { href: "/help", bn: "সহায়তা", en: "How We Help" },
  { href: "/about", bn: "আমাদের কথা", en: "About" },
];

export default function Header() {
  const { lang, setLang, pick } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#dbe7f0]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-16 gap-3">
          <Logo />
          <nav className="hidden lg:flex items-center gap-1" aria-label={pick("প্রধান মেনু", "Main menu")}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-[#33546b] hover:bg-[#eef5fa] hover:text-[#134970] transition-colors"
              >
                {pick(item.bn, item.en)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-[#c9dcea] overflow-hidden text-xs font-semibold" role="group" aria-label="Language">
              <button
                onClick={() => setLang("bn")}
                className={cx("px-2.5 py-1.5 transition-colors", lang === "bn" ? "bg-[#134970] text-white" : "bg-white text-[#33546b] hover:bg-[#eef5fa]")}
                aria-pressed={lang === "bn"}
              >
                বাং
              </button>
              <button
                onClick={() => setLang("en")}
                className={cx("px-2.5 py-1.5 transition-colors", lang === "en" ? "bg-[#134970] text-white" : "bg-white text-[#33546b] hover:bg-[#eef5fa]")}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
            </div>
            <a
              href="tel:16699"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#e8b23a] px-3 py-2 text-xs font-bold text-[#3d2e07] hover:brightness-105 transition"
            >
              📞 ১৬৬৯৯
            </a>
            <button
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#c9dcea] text-[#134970]"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={pick("মেনু", "Menu")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-[#dbe7f0] bg-white px-4 py-3" aria-label={pick("মোবাইল মেনু", "Mobile menu")}>
          <ul className="grid gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#33546b] hover:bg-[#eef5fa]">
                  {pick(item.bn, item.en)}
                </Link>
              </li>
            ))}
            <li>
              <a href="tel:16699" className="block rounded-lg px-3 py-2.5 text-sm font-bold text-[#8a6410] bg-[#fdf3dd]">
                📞 {pick("হেল্পলাইন ১৬৬৯৯", "Helpline 16699")}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
