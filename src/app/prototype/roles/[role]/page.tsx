"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import RoleConsole from "@/components/RoleConsole";

const VALID = ["dlao", "mediator", "helpline", "udc", "lawyer", "admin", "receiving"];
const MAP: Record<string, string> = { dlao: "B1", mediator: "B2", helpline: "B3", udc: "B4", lawyer: "B5", admin: "B7", receiving: "B6" };

export default function RolePage() {
  const params = useParams<{ role: string }>();
  const roleId = MAP[params.role] ?? "B1";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-xs text-[#7d99ac] mb-4" aria-label="Breadcrumb">
        <Link href="/prototype" className="hover:underline">প্রোটোটাইপ</Link>
        <span className="mx-1.5">›</span>
        <Link href="/prototype/roles" className="hover:underline">প্রদানকারী ভূমিকা</Link>
      </nav>
      <RoleConsole roleId={roleId} />
      <div className="mt-6 flex flex-wrap gap-2">
        {VALID.map((r) => (
          <Link
            key={r}
            href={`/prototype/roles/${r}`}
            className={`rounded-full px-3.5 py-2 text-xs font-bold ${r === params.role ? "bg-[#134970] text-white" : "bg-white ring-1 ring-[#c9dcea] text-[#33546b] hover:bg-[#f2f8fc]"}`}
          >
            {MAP[r]}
          </Link>
        ))}
      </div>
    </div>
  );
}
