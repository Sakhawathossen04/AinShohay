"use client";
import { I18nProvider } from "@/lib/i18n";
import { DLASProvider } from "@/lib/dlasStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <DLASProvider>{children}</DLASProvider>
    </I18nProvider>
  );
}
