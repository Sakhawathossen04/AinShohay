"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function PwaRegister() {
  const { pick } = useI18n();
  const [light, setLight] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    try {
      const saved = window.localStorage.getItem("coujl-light");
      if (saved === "1") setLight(true);
      setOnline(navigator.onLine);
      const on = () => setOnline(true);
      const off = () => setOnline(false);
      window.addEventListener("online", on);
      window.addEventListener("offline", off);
      return () => {
        window.removeEventListener("online", on);
        window.removeEventListener("offline", off);
      };
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.dataset.light = light ? "1" : "0";
    try {
      window.localStorage.setItem("coujl-light", light ? "1" : "0");
    } catch {}
  }, [light]);

  return (
    <>
      {/* data- saver / light mode toggle (T10) */}
      <button
        onClick={() => setLight((v) => !v)}
        className="fixed bottom-5 left-5 z-50 rounded-full bg-white text-[#33546b] ring-1 ring-[#dbe7f0] shadow-lg px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 hover:bg-[#f2f8fc] transition-colors"
        aria-pressed={light}
        title={pick("লাইট মোড: ছবি বন্ধ, ডেটা বাঁচান", "Light mode: reduce images, save data")}
      >
        {light ? "🌿" : "📶"} {pick("লাইট মোড", "Light mode")}
      </button>
      {!online && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[#8a6410] text-white text-xs font-semibold px-4 py-1.5 shadow-lg">
          {pick("অফলাইন — পরিবর্তনগুলো ডিভাইসে সংরক্ষিত হবে", "Offline — changes will stay on this device")}
        </div>
      )}
    </>
  );
}
