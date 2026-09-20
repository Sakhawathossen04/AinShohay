"use client";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CENTERS, DISTRICTS, KIND_LABEL } from "@/data/centers";
import type { Center } from "@/lib/types";
import { cx } from "@/lib/utils";

const KIND_ICON: Record<Center["kind"], string> = {
  dlao: "🏛️",
  udc: "💻",
  ngo: "🤝",
  helpline: "📞",
};

export default function CenterFinder() {
  const { pick, lang } = useI18n();
  const [district, setDistrict] = useState("All");
  const [kind, setKind] = useState<"all" | Center["kind"]>("all");

  const results = useMemo(
    () =>
      CENTERS.filter(
        (c) => (district === "All" || c.district === district) && (kind === "all" || c.kind === kind)
      ),
    [district, kind]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div>
          <label htmlFor="district" className="block text-xs font-bold text-[#33546b] mb-1.5 uppercase tracking-wide">
            {pick("জেলা", "District")}
          </label>
          <select
            id="district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-xl border border-[#dbe7f0] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#134970]/25 min-w-44"
          >
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d === "All" ? pick("সব জেলা", "All districts") : d}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="block text-xs font-bold text-[#33546b] mb-1.5 uppercase tracking-wide">{pick("ধরন", "Type")}</span>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "dlao", "udc", "ngo", "helpline"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={cx(
                  "rounded-full px-3.5 py-2 text-xs font-bold transition-colors",
                  kind === k ? "bg-[#134970] text-white" : "bg-white ring-1 ring-[#c9dcea] text-[#33546b] hover:bg-[#f2f8fc]"
                )}
                aria-pressed={kind === k}
              >
                {k === "all" ? pick("সব", "All") : `${KIND_ICON[k]} ${pick(KIND_LABEL[k].bn, KIND_LABEL[k].en)}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-[#5c7a8e] mb-4" role="status">
        {pick(`${results.length}টি কেন্দ্র পাওয়া গেছে`, `${results.length} centers found`)}
      </p>

      <ul className="grid sm:grid-cols-2 gap-4">
        {results.map((c) => (
          <li key={c.id} className="rounded-2xl border border-[#dbe7f0] bg-white p-5">
            <div className="flex items-start gap-3">
              <span aria-hidden className="text-2xl">{KIND_ICON[c.kind]}</span>
              <div className="min-w-0">
                <h3 className="font-bold text-[#134970] text-[15px] leading-snug">{c.name[lang]}</h3>
                <p className="text-xs font-semibold text-[#1d7bb8] mt-1">
                  {pick(KIND_LABEL[c.kind].bn, KIND_LABEL[c.kind].en)}
                  {c.district !== "All" && ` · ${c.district}`}
                </p>
                <p className="text-xs text-[#5c7a8e] mt-2">🕘 {c.hours[lang]}</p>
                <a
                  href={`tel:${c.phone}`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#e8f2f9] px-3 py-1.5 text-xs font-bold text-[#134970] hover:bg-[#d8e9f5]"
                >
                  📞 {c.phone}
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
