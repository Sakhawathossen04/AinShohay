import type { Center } from "@/lib/types";

export const CENTERS: Center[] = [
  { id: "c1", district: "Dhaka", kind: "dlao", name: { bn: "জেলা আইনি সহায়তা অফিস, ঢাকা", en: "District Legal Aid Office, Dhaka" }, phone: "0X-XXXXXXXX", hours: { bn: "রবি–বৃহস্পতি, ৯টা–৫টা", en: "Sun–Thu, 9am–5pm" } },
  { id: "c2", district: "Dhaka", kind: "ngo", name: { bn: "আইন ও সালিশ কেন্দ্র (ASk) — ধানমন্ডি", en: "Ain o Salish Kendra (ASK) — Dhanmondi" }, phone: "0X-XXXXXXXX", hours: { bn: "রবি–বৃহস্পতি, ৯টা–৫টা", en: "Sun–Thu, 9am–5pm" } },
  { id: "c3", district: "Joypurhat", kind: "dlao", name: { bn: "জেলা আইনি সহায়তা অফিস, জয়পুরহাট", en: "District Legal Aid Office, Joypurhat" }, phone: "0X-XXXXXXXX", hours: { bn: "রবি–বৃহস্পতি, ৯টা–৫টা", en: "Sun–Thu, 9am–5pm" } },
  { id: "c4", district: "Joypurhat", kind: "udc", name: { bn: "ইউনিয়ন ডিজিটাল সেন্টার — পুর্বা মলদ", en: "Union Digital Centre — Purbba Maldah" }, phone: "0X-XXXXXXXX", hours: { bn: "প্রতিদিন, ৯টা–৬টা", en: "Daily, 9am–6pm" } },
  { id: "c5", district: "Jhenaidah", kind: "dlao", name: { bn: "জেলা আইনি সহায়তা অফিস, ঝিনাইদহ", en: "District Legal Aid Office, Jhenaidah" }, phone: "0X-XXXXXXXX", hours: { bn: "রবি–বৃহস্পতি, ৯টা–৫টা", en: "Sun–Thu, 9am–5pm" } },
  { id: "c6", district: "Khagrachhari", kind: "udc", name: { bn: "ইউনিয়ন ডিজিটাল সেন্টার — খাগড়াছড়ি সদর", en: "Union Digital Centre — Khagrachhari Sadar" }, phone: "0X-XXXXXXXX", hours: { bn: "প্রতিদিন, ৯টা–৬টা", en: "Daily, 9am–6pm" } },
  { id: "c7", district: "Khagrachhari", kind: "ngo", name: { bn: "আদিবাসী ন্যায় কেন্দ্র (সহায়তা ডেস্ক)", en: "Indigenous Justice Desk (support)" }, phone: "0X-XXXXXXXX", hours: { bn: "রবি–বৃহস্পতি, ১০টা–৪টা", en: "Sun–Thu, 10am–4pm" } },
  { id: "c8", district: "Barguna", kind: "dlao", name: { bn: "জেলা আইনি সহায়তা অফিস, বরগুনা", en: "District Legal Aid Office, Barguna" }, phone: "0X-XXXXXXXX", hours: { bn: "রবি–বৃহস্পতি, ৯টা–৫টা", en: "Sun–Thu, 9am–5pm" } },
  { id: "c9", district: "Gazipur", kind: "ngo", name: { bn: "শ্রমিক অধিকার ডেস্ক — টঙ্গী", en: "Workers' Rights Desk — Tongi" }, phone: "0X-XXXXXXXX", hours: { bn: "রবি–বৃহস্পতি, ৯টা–৫টা", en: "Sun–Thu, 9am–5pm" } },
  { id: "c10", district: "Gazipur", kind: "udc", name: { bn: "ইউনিয়ন ডিজিটাল সেন্টার — বোর্ডবাজার", en: "Union Digital Centre — Board Bazar" }, phone: "0X-XXXXXXXX", hours: { bn: "প্রতিদিন, ৯টা–৬টা", en: "Daily, 9am–6pm" } },
  { id: "c11", district: "All", kind: "helpline", name: { bn: "আইনি সহায়তা হেল্পলাইন ১৬৬৯৯", en: "Legal Aid Helpline 16699" }, phone: "16699", hours: { bn: "সকাল ৯টা–বিকেল ৫টা", en: "9am–5pm" } },
  { id: "c12", district: "All", kind: "helpline", name: { bn: "জাতীয় জরুরি সেবা ৯৯৯", en: "National Emergency 999" }, phone: "999", hours: { bn: "২৪ ঘণ্টা", en: "24 hours" } },
];

export const DISTRICTS = ["All", ...Array.from(new Set(CENTERS.map((c) => c.district)))];

export const KIND_LABEL: Record<Center["kind"], { bn: string; en: string }> = {
  dlao: { bn: "আইনি সহায়তা অফিস", en: "Legal Aid Office" },
  udc: { bn: "ডিজিটাল সেন্টার (UDC)", en: "Digital Centre (UDC)" },
  ngo: { bn: "এনজিও কেন্দ্র", en: "NGO Center" },
  helpline: { bn: "হেল্পলাইন", en: "Helpline" },
};
