"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Bi, Lang } from "./types";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (b: Bi) => string;
  pick: (bn: string, en: string) => string;
}

const Ctx = createContext<LangCtx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("coujl-lang");
      if (saved === "en" || saved === "bn") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem("coujl-lang", lang);
    } catch {}
  }, [lang]);

  const value = useMemo<LangCtx>(
    () => ({
      lang,
      setLang: setLangState,
      t: (b: Bi) => (b ? b[lang] : ""),
      pick: (bn: string, en: string) => (lang === "bn" ? bn : en),
    }),
    [lang]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
