import Link from "next/link";

export default function Logo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="CoU Justice Lab — home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dark ? "/icons/logo-dark.svg" : "/icons/logo.svg"} alt="" width={44} height={33} className="h-9 w-auto" />
      <span className={`leading-tight ${dark ? "text-white" : "text-[#134970]"}`}>
        <span className="block font-bold text-[15px] tracking-tight">CoU Justice Lab</span>
        {!compact && <span className="block text-[11px] font-medium opacity-75">ন্যায়বন্ধু আইনি সহায়তা</span>}
      </span>
    </Link>
  );
}
