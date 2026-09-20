import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  metadataBase: new URL("https://cou-justice-lab.vercel.app"),
  title: {
    default: "CoU Justice Lab — বিনামূল্যে আইনি স্ব-সহায়তা (বাংলাদেশ)",
    template: "%s | CoU Justice Lab",
  },
  description:
    "বাংলাদেশভিত্তিক বিনামূল্যে আইনি স্ব-সহায়তা প্ল্যাটফর্ম — ভরণপোষণ, তালাক, জমি, শ্রম, ভোক্তা ও সাইবার অধিকার গাইড, ফরম টুলবক্স এবং ডিজিটাল লিগ্যাল এইড সিস্টেম প্রোটোটাইপ।",
  keywords: ["আইনি সহায়তা", "legal aid Bangladesh", "ভরণপোষণ", "DLAS", "ADLASB", "CoU Justice Lab"],
  manifest: "/manifest.json",
  openGraph: {
    title: "CoU Justice Lab — ন্যায়বন্ধু",
    description: "বাংলাদেশের নাগরিকদের জন্য বিনামূল্যে আইনি স্ব-সহায়তা",
    type: "website",
    locale: "bn_BD",
    images: [{ url: "/images/og-cover.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#134970",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f4f8fb] text-[#2b4557] antialiased">
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:m-2">
            মূল কনটেন্টে যান / Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <ChatWidget />
          <PwaRegister />
        </Providers>
      </body>
    </html>
  );
}
