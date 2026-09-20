export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Bangladesh-standard digit conversion (0-9 → ০-৯) */
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export function bnDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export function digitsFor(input: string | number, lang: "bn" | "en"): string {
  return lang === "bn" ? bnDigits(input) : String(input);
}

export function todayFor(lang: "bn" | "en"): string {
  return new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function idFor(prefix: string): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${n}`;
}

export function shortDate(iso: string, lang: "bn" | "en"): string {
  return new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}
