import type { ChatIntent, Lang } from "./types";

export type ChatReply = {
  answer: string;
  suggestions: string[];
  action?: { label: string; href: string };
};

const INTENTS: ChatIntent[] = [
  {
    id: "greet",
    patterns: [/^(হাই|হ্যালো|আসসালাম|সালাম|hello|hi|hey)\b/i, /^(কেমন আছ|কী খবর)/],
    answer: {
      bn: "আসসালামু আলাইকুম! আমি ন্যায়বন্ধু — CoU Justice Lab-এর সহায়ক। আপনার সমস্যা বলুন, আমি সঠিক তথ্য ও পেজে নিয়ে যাব।",
      en: "Hello! I am NyayBondhu, the CoU Justice Lab assistant. Tell me your problem and I will guide you to the right page or resource.",
    },
    suggestions: { bn: ["ভরণপোষণ চাই", "জমির নামজারি", "তালাক ও দেনমোহর", "কারখানার বেতন বাকি"], en: ["Maintenance claim", "Land name transfer", "Divorce & dower", "Unpaid factory wages"] },
  },
  {
    id: "maintenance",
    patterns: [/ভরণপোষণ|রক্ষণাবেক্ষণ|স্বামীর খরচ|সন্তানের খরচ|maintenance/i],
    answer: {
      bn: "স্বামী/পিতা ভরণপোষণ না দিলে পারিবারিক আদালতে মামলা করা যায় — খরচও নেই, আইনজীবী ছাড়াই দেওয়া যায়। ধাপে ধাপে প্রক্রিয়া দেখুন।",
      en: "If a husband/father refuses maintenance, you can file in Family Court — no court fee, and a lawyer is not mandatory. See the step-by-step process.",
    },
    suggestions: { bn: ["কোন কাগজ লাগবে?", "কতদিন সময় লাগে?", "আবেদন লিখে দিন"], en: ["What documents?", "How long does it take?", "Draft the application"] },
    action: { label: { bn: "ভরণপোষণ গাইড", en: "Maintenance guide" }, href: "/topics/maintenance" },
  },
  {
    id: "divorce",
    patterns: [/তালাক|দেনমোহর|বিবাহ বিচ্ছেদ|divorce|dower/i],
    answer: {
      bn: "তালাক (নোটিশ, ৯০ দিন), দেনমোহর ও যৌতুক সংক্রান্ত অধিকার একসাথে জেনে নিন। ফরম ও নোটিশের নমুনা টুলবক্সে আছে।",
      en: "Learn divorce notice (90 days), dower and dowry rights together. Templates are in the toolbox.",
    },
    suggestions: { bn: ["তালাকের নোটিশ কীভাবে দেব?", "দেনমোহর আদায়", "যৌতুক মামলা"], en: ["How to serve divorce notice?", "Recover dower", "Dowry case"] },
    action: { label: { bn: "তালাক ও দেনমোহর", en: "Divorce & dower" }, href: "/topics/divorce-dower" },
  },
  {
    id: "land",
    patterns: [/জমি|খতিয়ান|নামজারি|দাখিলা|উচ্ছেদ|পর্চা|land|khatian|eviction/i],
    answer: {
      bn: "জমি সংক্রান্ত সমস্যায় প্রথমে খতিয়ান ও দাখিলা যাচাই করুন, প্রয়োজনে সহকারী কমিশনার (ভূমি) অফিসে নামজারি/অভিযোগ করুন।",
      en: "For land disputes, first verify khatian and rent receipts, then apply for name mutation or file a complaint at the AC (Land) office.",
    },
    suggestions: { bn: ["খতিয়ান কীভাবে চাইব?", "নামজারির নিয়ম", "অবৈধ দখল থেকে বাঁচার উপায়"], en: ["How to get khatian?", "Mutation process", "Stop illegal occupation"] },
    action: { label: { bn: "জমি ও সম্পত্তি", en: "Land & property" }, href: "/topics/land-disputes" },
  },
  {
    id: "wage",
    patterns: [/মজুরি|বেতন|কারখানা|শ্রমিক|ওভারটাইম|wage|salary|factory/i],
    answer: {
      bn: "বকেয়া বেতন/মজুরির জন্য শ্রম আদালতে মামলা করা যায় — শ্রম আইনে বকেয়ার সুদসহ আদায়ের বিধান আছে। মামলার আগে ব্যবস্থাপকের কাছে লিখিত দাবি জানান।",
      en: "For unpaid wages you can file in the Labour Court; the Labour Act allows recovery with compensation. First make a written demand to the manager.",
    },
    suggestions: { bn: ["শ্রম আদালতে মামলা কীভাবে?", "কাগজপত্র কী কী?", "নিয়োগপত্র নেই কী করব?"], en: ["How to file in Labour Court?", "What documents?", "No appointment letter — what now?"] },
    action: { label: { bn: "শ্রম ও মজুরি", en: "Labour & wages" }, href: "/topics/labour-wages" },
  },
  {
    id: "cyber",
    patterns: [/সাইবার|ফেসবুক|ছবি|ভিডিও|ব্ল্যাকমেইল|কালাপাতি|অপমানজনক|cyber|facebook.*photo|blackmail/i],
    answer: {
      bn: "সাইবার অপরাধে অভিযোগ: নমুনা/লিংক সংরক্ষণ করুন, স্ক্রিনশট নিন, তারপর সাইবার ট্রাইব্যুনাল বা থানায় অভিযোগ করুন। ব্ল্যাকমেইল হলে টাকা না দিয়ে দ্রুত অভিযোগ করুন।",
      en: "For cyber crimes: preserve links/screenshots as evidence, then complain to the Cyber Tribunal or police. If blackmailed, do not pay — complain fast.",
    },
    suggestions: { bn: ["প্রমাণ কীভাবে সংরক্ষণ করব?", "কোথায় অভিযোগ করব?", "আমার নিরাপত্তা"], en: ["How to preserve evidence?", "Where to complain?", "My safety"] },
    action: { label: { bn: "সাইবার অপরাধ", en: "Cyber crime" }, href: "/topics/cyber-harassment" },
  },
  {
    id: "consumer",
    patterns: [/ভোগ্য|পণ্য|জাল|মান|ওজন|consumer|adulter/i],
    answer: {
      bn: "ভোগ্যপণ্যের অভিযোগ জাতীয় ভোক্তা অধিকার সংরক্ষণ অধিদপ্তরে করা যায় — হটলাইন ১৬১২১। ক্রয়ের রসিদ রাখুন।",
      en: "Complain about products to the Directorate of National Consumer Rights Protection — hotline 16121. Keep your purchase receipt.",
    },
    suggestions: { bn: ["অভিযোগ লেখার নিয়ম", "হটলাইন ১৬১২১"], en: ["How to write a complaint", "Hotline 16121"] },
    action: { label: { bn: "ভোক্তা অধিকার", en: "Consumer rights" }, href: "/topics/consumer-rights" },
  },
  {
    id: "toolbox",
    patterns: [/ফরম|আবেদন|অভিযোগ|নমুনা|লিখে দাও|draft|form|template/i],
    answer: {
      bn: "টুলবক্সে প্রস্তুত নমুনা ও সহায়তায় আবেদন তৈরির টুল আছে — উত্তর দিলেই প্রিন্টযোগ্য আবেদন তৈরি হবে।",
      en: "The toolbox has guided forms — answer simple questions and get a printable, ready application.",
    },
    suggestions: { bn: ["ভরণপোষণের আবেদন", "অভিযোগ নমুনা"], en: ["Maintenance application", "Complaint template"] },
    action: { label: { bn: "টুলবক্স খুলুন", en: "Open toolbox" }, href: "/toolbox" },
  },
  {
    id: "centers",
    patterns: [/কেন্দ্র|অফিস|কোথায় যাব|কাছে|nearby|center|office/i],
    answer: {
      bn: "আপনার জেলার জেলা আইনি সহায়তা অফিস, ইউনিয়ন ডিজিটাল সেন্টার বা এনজিও কেন্দ্র খুঁজে নিন — ঠিকানা, সময় ও যোগাযোগসহ।",
      en: "Find your District Legal Aid Office, Union Digital Centre or NGO center with address, hours and contact.",
    },
    suggestions: { bn: ["ঢাকার কেন্দ্র", "উত্তরবঙ্গের কেন্দ্র"], en: ["Centers in Dhaka", "Centers in Rajshahi region"] },
    action: { label: { bn: "সহায়তা কেন্দ্র", en: "Help centers" }, href: "/centers" },
  },
  {
    id: "helpline",
    patterns: [/হেল্পলাইন|১৬৬৯৯|16699|জরুরি|emergency/i],
    answer: {
      bn: "আইনি সহায়তা হেল্পলাইন ১৬৬৯৯ — সকাল ৯টা থেকে বিকেল ৫টা পর্যন্ত। উচ্চারণে বললেই তথ্য ও নির্দেশনা পাবেন।",
      en: "Legal aid helpline 16699 — 9am to 5pm. Call for voice guidance and case information.",
    },
    suggestions: { bn: ["হেল্পলাইন কী কী জানে?", "নিজে আবেদন করব"], en: ["What does the helpline know?", "Apply myself"] },
    action: { label: { bn: "হেল্পলাইন বিস্তারিত", en: "Helpline details" }, href: "/topics/helpline-16699" },
  },
  {
    id: "prototype",
    patterns: [/প্রোটোটাইপ|ডেমো|হ্যাকাথন|কেস|scenario|prototype|demo|ADLASB/i],
    answer: {
      bn: "ADLASB ফাইনাল কেসের ২৩টি বাধ্যতামূলক আইটেম (৫ নাগরিক + ৭ প্রদানকারী + ১১ প্রযুক্তিগত) এক আর্কিটেকচারে দেখুন — কভারেজ ম্যাট্রিক্স ও ৬টি ইন্টিগ্রেটেড ফ্লো।",
      en: "See all 23 mandatory ADLASB items (5 citizens + 7 providers + 11 tech) in one architecture — coverage matrix and six integrated flows.",
    },
    suggestions: { bn: ["ময়ূরীর কেস দেখাও", "ট্রায়াজ ডেমো", "ই-স্বাক্ষর ডেমো"], en: ["Show Moyuri's case", "Triage demo", "E-signature demo"] },
    action: { label: { bn: "প্রোটোটাইপ ওভারভিউ", en: "Prototype overview" }, href: "/prototype" },
  },
  {
    id: "scenario-a1",
    patterns: [/ময়ূরী|moyuri/i],
    answer: {
      bn: "ময়ূরীর কেস (A1): অনিরাপদ যোগাযোগ ও প্রতিনিধিত্ব — সেফ-কন্টাক্ট নিয়ম, রিপনের অনুমতির সুযোগ ও আলাদা নিশ্চিতকরণ কীভাবে কাজ করে দেখুন।",
      en: "Moyuri's case (A1): unsafe contact & representation — see safe-contact rules, Ripon's bounded authority and separate confirmation in action.",
    },
    suggestions: { bn: ["রিপনের কেস", "সেফ-কন্টাক্ট ডেমো"], en: ["Ripon's case", "Safe-contact demo"] },
    action: { label: { bn: "কেস A1 খুলুন", en: "Open case A1" }, href: "/prototype/scenarios" },
  },
  {
    id: "scenario-a3",
    patterns: [/নাবিলা|nabila/i],
    answer: {
      bn: "নাবিলার কেস (A3): জরুরি সংবেদনশীল রেফারেল — রেস্ট্রিক্টেড এভিডেন্স, ট্র্যাকড রেফারেল ও রিসিভিং অফিসের অ্যাকনলেজমেন্ট ফ্লো দেখুন।",
      en: "Nabila's case (A3): urgent sensitive referral — restricted evidence, tracked referral and receiving-office acknowledgement.",
    },
    suggestions: { bn: ["রেফারেল ডেমো", "কেস তালিকা"], en: ["Referral demo", "Case list"] },
    action: { label: { bn: "রেফারেল ডেমো", en: "Referral demo" }, href: "/prototype/tech/referral" },
  },
  {
    id: "scenario-a4",
    patterns: [/নুচিং|nuching/i],
    answer: {
      bn: "নুচিং মারমার কেস (A4): সহায়তা নেওয়া ইনটেক, অনুবাদের উৎস (provenance), সীমিত UDC অ্যাক্সেস ও অফলাইন সিঙ্ক — নেটওয়ার্ক ছেড়ে দিলেও কাজ হারায় না।",
      en: "Nuching Marma's case (A4): assisted intake, translation provenance, bounded UDC access and offline sync — work survives network loss.",
    },
    suggestions: { bn: ["অফলাইন সিঙ্ক ডেমো", "UDC ইনটেক"], en: ["Offline sync demo", "UDC intake"] },
    action: { label: { bn: "অফলাইন সিঙ্ক ডেমো", en: "Offline sync demo" }, href: "/prototype/tech/offline-sync" },
  },
  {
    id: "scenario-a5",
    patterns: [/মালেক|মালিক|malek/i],
    answer: {
      bn: "আবদুল মালেকের কেস (A5): দীর্ঘ মামলার স্ট্যাটাস, বকেয়া আইনজীবী আপডেট ও ভয়েসে অবস্থা জানা — T1 অ্যালার্ট ডেমো দেখুন।",
      en: "Abdul Malek's case (A5): long-running status, overdue lawyer updates and voice status — see the T1 alert demo.",
    },
    suggestions: { bn: ["T1 ডেমো", "আইনজীবীর দায়িত্ব"], en: ["T1 demo", "Lawyer accountability"] },
    action: { label: { bn: "T1 ডেমো", en: "T1 demo" }, href: "/prototype/tech/lawyer-inactivity" },
  },
];

export function reply(input: string, lang: Lang): ChatReply {
  const text = input.trim();
  if (!text) {
    return {
      answer: lang === "bn" ? "কিছু লিখুন বা অপশন বেছে নিন।" : "Type something or pick an option.",
      suggestions: [],
    };
  }
  for (const intent of INTENTS) {
    if (intent.patterns.some((p) => p.test(text))) {
      return {
        answer: intent.answer[lang],
        suggestions: intent.suggestions[lang],
        action: intent.action
          ? { label: intent.action.label[lang], href: intent.action.href }
          : undefined,
      };
    }
  }
  return {
    answer:
      lang === "bn"
        ? "আমি নিশ্চিত নই — তবে সাহায্য করতে পারি। সমস্যার ধরন বলুন (পরিবার, জমি, বেতন, সাইবার…) অথবা নিচের বিষয়গুলো দেখুন।"
        : "I am not sure — but I can still help. Name the problem area (family, land, wages, cyber…) or browse the topics below.",
    suggestions:
      lang === "bn"
        ? ["পরিবার সংক্রান্ত", "জমি সংক্রান্ত", "বেতন/মজুরি", "সাইবার হয়রানি"]
        : ["Family matter", "Land matter", "Wages", "Cyber harassment"],
    action: { label: lang === "bn" ? "সব বিষয় দেখুন" : "Browse all topics", href: "/topics" },
  };
}
