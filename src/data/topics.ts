import type { Topic } from "@/lib/types";

export const TOPIC_GROUPS: { id: string; bn: string; en: string; icon: string }[] = [
  { id: "family", bn: "পরিবার", en: "Family", icon: "👨‍👩‍👧" },
  { id: "land", bn: "ভূমি ও সম্পত্তি", en: "Land & Property", icon: "🌾" },
  { id: "labour", bn: "শ্রম ও মজুরি", en: "Labour & Wages", icon: "🏭" },
  { id: "money", bn: "অর্থ ও মামলা", en: "Money & Courts", icon: "⚖️" },
  { id: "violence", bn: "নির্যাতন ও নিরাপত্তা", en: "Abuse & Safety", icon: "🛡️" },
  { id: "consumer", bn: "ভোক্তা অধিকার", en: "Consumer", icon: "🛒" },
  { id: "cyber", bn: "অনলাইন নিরাপত্তা", en: "Online Safety", icon: "📱" },
];

export const TOPICS: Topic[] = [
  {
    slug: "maintenance",
    icon: "🧾",
    group: "family",
    title: { bn: "ভরণপোষণ (মেইনটেন্যান্স)", en: "Maintenance (Family Support)" },
    short: {
      bn: "স্বামী বা পিতা খরচ না দিলে বিনা খরচে পারিবারিক আদালতে দাবি করা যায়।",
      en: "Claim maintenance from a husband or father free of cost in Family Court.",
    },
    intro: {
      bn: "স্ত্রী, সন্তান ও অবিবাহিত কন্যার ভরণপোষণ পাওয়া আইনি অধিকার। পারিবারিক আদালত অধ্যাদেশ ১৯৮৫ অনুযায়ী এই দাবি করতে কোনো আদালত ফি লাগে না এবং আইনজীবী ছাড়াই আবেদন করা যায়।",
      en: "Wives, children and unmarried daughters have a legal right to maintenance. Under the Family Courts Ordinance 1985 there is no court fee and a lawyer is not required.",
    },
    steps: [
      {
        title: { bn: "১. প্রয়োজনীয় তথ্য ও কাগজপত্র জোগাড় করুন", en: "1. Collect your information and papers" },
        body: {
          bn: "বিবাহনামা (কাবিননামা), জন্মনিবন্ধন, প্রয়োজনে NID, এবং খরচের হিসাব (স্কুল বিল, চিকিৎসা রসিদ) প্রস্তুত রাখুন।",
          en: "Keep the marriage certificate (kabinnama), birth certificates, NID if available and cost evidence such as school bills or medical receipts ready.",
        },
      },
      {
        title: { bn: "২. ইউনিয়ন/পৌরসভা পর্যায়ে মীমাংসার চেষ্টা", en: "2. Try settlement at union/municipality level" },
        body: {
          bn: "শালিশ/মেডিয়েশনে সমাধান না হলে বা বিলম্ব হলে সরাসরি আদালতে যাওয়া বাধ্যতামূলক নয় — তবে মীমাংসার চেষ্টা প্রমাণ হিসেবে কাজে লাগে।",
          en: "While shalish/mediation is not mandatory, attempting settlement first often helps and its record can support your case.",
        },
      },
      {
        title: { bn: "৩. পারিবারিক আদালতে আবেদন দাখিল", en: "3. File the application in Family Court" },
        body: {
          bn: "আবেদনকারীর নিজ জেলার পারিবারিক আদালতে লিখিত আবেদন দাখিল করুন। কোনো ফি নেই; আইনজীবী ছাড়াই করা যায়। জেলা আইনি সহায়তা অফিস (DLAO) থেকে ফ্রি আইনজীবী চাইতে পারেন।",
          en: "File a written application in your district's Family Court. There is no fee; you may go without a lawyer and request a free panel lawyer via the District Legal Aid Office.",
        },
      },
      {
        title: { bn: "৪. সমন ও শুনানি", en: "4. Summons and hearing" },
        body: {
          bn: "আদালত প্রতিবাদীকে সমন দেয়; উভয় পক্ষের শুনানি হয়। মধ্যস্থতায় মীমাংসা হলে ডিক্রি হয়, নাহলে সাক্ষ্য-প্রমাণে রায় হয়।",
          en: "The court summons the respondent and hears both sides. If mediation succeeds a decree is recorded; otherwise the court decides after evidence.",
        },
      },
      {
        title: { bn: "৫. ডিক্রি ও বকেয়া আদায়", en: "5. Decree and enforcement" },
        body: {
          bn: "রায়ের পরও টাকা না দিলে ডিক্রি এক্সিকিউশনের আবেদন করুন — বকেয়ার ওপর সুদ পাওয়ার বিধানও আছে।",
          en: "If payment is still not made, apply for execution of the decree; interest on arrears may be awarded.",
        },
      },
    ],
    docs: [
      { name: { bn: "বিবাহনামা / কাবিননামার কপি", en: "Marriage certificate (kabinnama) copy" }, required: true },
      { name: { bn: "আবেদনকারী ও সন্তানের জন্মনিবন্ধন", en: "Applicant's and children's birth certificates" }, required: true },
      { name: { bn: "NID / পাসপোর্ট (থাকলে)", en: "NID / passport (if available)" }, required: false },
      { name: { bn: "খরচের প্রমাণ (বিল, রসিদ)", en: "Cost evidence (bills, receipts)" }, required: false },
      { name: { bn: "ঠিকানা প্রমাণ", en: "Address proof" }, required: false },
    ],
    faq: [
      {
        q: { bn: "আইনজীবী ছাড়া কি মামলা করা যাবে?", en: "Can I file without a lawyer?" },
        a: {
          bn: "হ্যাঁ, পারিবারিক আদালতে আইনজীবী ছাড়া আবেদন করা যায়। চাইলে DLAO-এর প্যানেল আইনজীবী বিনামূল্যে পাবেন।",
          en: "Yes. Family Court allows you to apply without a lawyer, and the District Legal Aid Office provides free panel lawyers if eligible.",
        },
      },
      {
        q: { bn: "কতদিন সময় লাগে?", en: "How long does it take?" },
        a: {
          bn: "সাধারণত ৬ মাসের মধ্যে নিষ্পত্তির চেষ্টা করা হয়; জটিলতায় সময় বাড়তে পারে।",
          en: "The court tries to dispose of the case within 6 months; complex matters may take longer.",
        },
      },
      {
        q: { bn: "মামলা চলাকালীন খরচ কি পাওয়া যায়?", en: "Can I get interim support?" },
        a: {
          bn: "হ্যাঁ, আদালত অন্তর্বর্তীকালীন ভরণপোষণের আদেশ দিতে পারে।",
          en: "Yes, the court can order interim maintenance during the case.",
        },
      },
    ],
    lawRefs: ["পারিবারিক আদালত অধ্যাদেশ, ১৯৮৫ (Family Courts Ordinance 1985)", "মুসলিম পারিবারিক আইন অধ্যাদেশ, ১৯৬১"],
  },
  {
    slug: "divorce-dower",
    icon: "📑",
    group: "family",
    title: { bn: "তালাক ও দেনমোহর", en: "Divorce & Dower" },
    short: {
      bn: "তালাকের নোটিশ, ৯০ দিনের সময়সীমা এবং দেনমোহর/যৌতুকের অধিকার জেনে নিন।",
      en: "Understand divorce notice, the 90-day rule, and your dower and dowry rights.",
    },
    intro: {
      bn: "মুসলিম বিবাহ বিচ্ছেদে লিখিত নোটিশ, চেয়ারম্যানের কাছে জানানো এবং ৯০ দিন অপেক্ষার নিয়ম রয়েছে। তালাকের পর বকেয়া দেনমোহর আদায় করা যায়; যৌতুক আদায় অপরাধ।",
      en: "Muslim divorce requires a written notice, notification to the Chairman and a 90-day period. Arrears of dower remain recoverable after divorce, and demanding dowry is a criminal offence.",
    },
    steps: [
      {
        title: { bn: "১. লিখিত তালাকনামা প্রস্তুত", en: "1. Prepare a written divorce notice" },
        body: {
          bn: "স্বামী/স্ত্রী যে কেউ লিখিতভাবে তালাক ঘোষণা করতে পারেন; কারণ উল্লেখ করা ভালো।",
          en: "Either spouse may serve a written divorce notice; stating reasons is advisable.",
        },
      },
      {
        title: { bn: "২. চেয়ারম্যানের কাছে নোটিশ জানানো", en: "2. Notify the Chairman (UP/Pourashava)" },
        body: {
          bn: "নোটিশের কপি সংশ্লিষ্ট ইউনিয়ন পরিষদ/পৌরসভার চেয়ারম্যানের কাছে জানাতে হয়; ব্যর্থ হলে জরিমানা হতে পারে।",
          en: "A copy of the notice must be sent to the Chairman of the concerned UP/Pourashava; failure may attract a fine.",
        },
      },
      {
        title: { bn: "৩. ৯০ দিন অপেক্ষা ও আরবিট্রেশন কাউন্সিল", en: "3. 90-day wait and Arbitration Council" },
        body: {
          bn: "নোটিশের পর ৯০ দিনের মধ্যে আরবিট্রেশন কাউন্সিল মীমাংসার চেষ্টা করে; এর আগে তালাক কার্যকর হয় না। গর্ভবতী হলে নিয়ম ভিন্ন।",
          en: "Within 90 days the Arbitration Council attempts reconciliation; the divorce is not effective earlier. Rules differ if the wife is pregnant.",
        },
      },
      {
        title: { bn: "৪. তালাকনামা রেজিস্ট্রেশন", en: "4. Register the divorce" },
        body: {
          bn: "কার্যকর হওয়ার পর নিকটস্থ রেজিস্ট্রার অফিসে তালাক নিবন্ধন করে সনদ নিন।",
          en: "Once effective, register the divorce at the nearest registrar office and collect the certificate.",
        },
      },
      {
        title: { bn: "৫. দেনমোহর ও ভরণপোষণ দাবি", en: "5. Claim dower and maintenance" },
        body: {
          bn: "বকেয়া দেনমোহর, ভরণপোষণ ও সন্তানের হেফাজত পারিবারিক আদালতে দাবি করা যায়।",
          en: "Arrears of dower, maintenance and child custody can be claimed in the Family Court.",
        },
      },
    ],
    docs: [
      { name: { bn: "কাবিননামা", en: "Kabinnama" }, required: true },
      { name: { bn: "তালাকনামা (যদি থাকে)", en: "Divorce notice (if issued)" }, required: false },
      { name: { bn: "NID / জন্মনিবন্ধন", en: "NID / birth certificate" }, required: true },
    ],
    faq: [
      {
        q: { bn: "ফেসবুক মেসেজে তালাক কি কার্যকর হয়?", en: "Is divorce by Facebook message valid?" },
        a: {
          bn: "না। লিখিত নোটিশ, চেয়ারম্যানকে জানানো ও ৯০ দিনের প্রক্রিয়া ছাড়া তালাক কার্যকর হয় না।",
          en: "No. Without the written notice, notification to the Chairman and the 90-day process, a divorce is not effective.",
        },
      },
      {
        q: { bn: "যৌতুক ফেরত চাইলে কী করব?", en: "How do I recover dowry goods?" },
        a: {
          bn: "যৌতুক নিষিদ্ধকরণ আইনে দাবি করুন এবং থানায় অভিযোগ করুন; যৌতুকের তালিকা ও সাক্ষী রাখুন।",
          en: "Claim under the Dowry Prohibition Act and file a police complaint; keep the dowry list and witnesses ready.",
        },
      },
    ],
    lawRefs: ["মুসলিম বিবাহ ও তালাক (রেজিস্ট্রেশন) অ্যাক্ট, ১৯৭৪", "যৌতুক নিরোধ অ্যাক্ট, ১৯৮০"],
  },
  {
    slug: "land-disputes",
    icon: "🌾",
    group: "land",
    title: { bn: "জমি ও সম্পত্তি বিরোধ", en: "Land & Property Disputes" },
    short: {
      bn: "খতিয়ান যাচাই, নামজারি, দাখিলা ও অবৈধ দখল থেকে সুরক্ষার প্রক্রিয়া।",
      en: "Verify khatian, apply for mutation, pay rent dues and resist illegal occupation.",
    },
    intro: {
      bn: "ভূমি বিরোধে প্রথম পদক্ষেপ নথিপত্র যাচাই। খতিয়ান (পর্চা), দাখিলা রসিদ ও মৌজা ম্যাপ মিলিয়ে দেখে প্রয়োজনে ভূমি অফিসে নামজারি বা আদালতে যেতে হয়।",
      en: "In land disputes the first step is verifying documents. Compare khatian (porcha), rent receipts and mouza maps, then apply for mutation at the land office or go to court.",
    },
    steps: [
      {
        title: { bn: "১. খতিয়ান ও নথি যাচাই", en: "1. Verify khatian and deeds" },
        body: {
          bn: "জাতীয় ভূমি রেকর্ড ও প্রশাসনের ই-সেবা পোর্টাল থেকে অনলাইনে খতিয়ান যাচাই করুন; দলিলের সঙ্গে মৌজা ম্যাপ মেলান।",
          en: "Verify khatian online via the national land record portal and match the deed with the mouza map.",
        },
      },
      {
        title: { bn: "২. দাখিলা (ভূমি উন্নয়ন কর) রসিদ সংগ্রহ", en: "2. Collect land development tax (dakhila) receipts" },
        body: {
          bn: "নিয়মিত কর পরিশোধের রসিদ দখলের শক্ত প্রমাণ।",
          en: "Regular tax receipts are strong evidence of possession.",
        },
      },
      {
        title: { bn: "৩. নামজারি (মিউটেশন) আবেদন", en: "3. Apply for mutation (namjari)" },
        body: {
          bn: "উত্তরাধিকার বা ক্রয়ের পর সহকারী কমিশনার (ভূমি) অফিসে অনলাইনে/অফলাইনে নামজারি করান।",
          en: "After inheritance or purchase, apply for mutation at the AC (Land) office online or in person.",
        },
      },
      {
        title: { bn: "৪. অবৈধ দখল হলে", en: "4. If illegally occupied" },
        body: {
          bn: "ভূমি সংক্রান্ত অপরাধ দমন আইনে নির্বাহী ম্যাজিস্ট্রেট আদালতে অভিযোগ করুন; প্রয়োজনে দেওয়ানি মামলা (দখল উচ্ছেদ) করুন।",
          en: "File under the Land Crimes Prevention Act before an Executive Magistrate; if needed, file a civil suit for ejectment.",
        },
      },
    ],
    docs: [
      { name: { bn: "দলিল / বেয়া-দলিল", en: "Deed / Beya-deed" }, required: true },
      { name: { bn: "খতিয়ান / পর্চা", en: "Khatian / Porcha" }, required: true },
      { name: { bn: "হালনাগাদ দাখিলা রসিদ", en: "Updated dakhila receipts" }, required: true },
      { name: { bn: "মৌজা ম্যাপ", en: "Mouza map" }, required: false },
      { name: { bn: "মৃত মালিকের ওয়ারিশান সনদ (উত্তরাধিকারে)", en: "Succession certificate (for inheritance)" }, required: false },
    ],
    faq: [
      {
        q: { bn: "নামজারিতে কত খরচ ও সময় লাগে?", en: "How much and how long for mutation?" },
        a: {
          bn: "সরকারি ফি নির্দিষ্ট; অনলাইনে আবেদন করলে সাধারণত ২৫–৫০ কর্মদিবসে হয় (জেলাভেদে ভিন্ন)।",
          en: "Government fees are fixed; online applications typically complete in 25–50 working days (varies by district).",
        },
      },
      {
        q: { bn: "ভাগিদার জমি বিক্রি করলে কী করব?", en: "A co-sharer sold land — what now?" },
        a: {
          bn: "প্রতারণার অভিযোগসহ দেওয়ানি মামলা এবং প্রয়োজনে ফৌজদারি অভিযোগ করা যায়; দ্রুত আইনজীবীর পরামর্শ নিন।",
          en: "File a civil suit for fraud and, if warranted, a criminal complaint; get legal advice quickly.",
        },
      },
    ],
    lawRefs: ["ভূমি সংস্কার অধ্যাদেশ, ১৯৮৪", "ভূমি সংক্রান্ত অপরাধ দমন আইন, ২০২৪"],
  },
  {
    slug: "labour-wages",
    icon: "🏭",
    group: "labour",
    title: { bn: "শ্রম ও মজুরি দাবি", en: "Labour & Wage Claims" },
    short: {
      bn: "বকেয়া বেতন, ছাঁটাই ক্ষতিপূরণ ও কারখানার নিরাপত্তা — কোথায়, কীভাবে অভিযোগ করবেন।",
      en: "Unpaid wages, retrenchment compensation and factory safety — where and how to complain.",
    },
    intro: {
      bn: "শ্রম আইন, ২০০৬ অনুযায়ী বেতন-ভাতা, ওভারটাইম, ছুটি ও ছাঁটাই ক্ষতিপূরণের অধিকার নিশ্চিত। বকেয়া আদায়ে শ্রম আদালতে মামলা এবং নিরাপত্তা সমস্যায় প্রধান পরিদর্শকের কাছে অভিযোগ করা যায়।",
      en: "The Labour Act 2006 guarantees wages, overtime, leave and retrenchment compensation. File in the Labour Court for arrears and complain to the Chief Inspector for safety issues.",
    },
    steps: [
      {
        title: { bn: "১. প্রমাণ সংগ্রহ", en: "1. Gather evidence" },
        body: {
          bn: "নিয়োগপত্র, বেতন শিট/স্লিপ, অ্যাটেনডেন্স কার্ড, ID — যা আছে সব সংরক্ষণ করুন; না থাকলে সহকর্মীর বিবরণও কাজে লাগে।",
          en: "Keep appointment letters, pay slips, attendance records and ID; if absent, co-worker statements help.",
        },
      },
      {
        title: { bn: "২. লিখিত দাবি জানান", en: "2. Make a written demand" },
        body: {
          bn: "ব্যবস্থাপক/মালিকের কাছে লিখিত (SMS/ইমেইলও চলে) দাবি জানান এবং গ্রহণকৃত কপি রাখুন।",
          en: "Send a written demand (SMS/email works) to the manager/owner and keep the delivered copy.",
        },
      },
      {
        title: { bn: "৩. শ্রম আদালতে মামলা", en: "3. File in the Labour Court" },
        body: {
          bn: "দাবি অগ্রাহ্য হলে শ্রম আদালতে মামলা করুন — সাধারণত বকেয়ার সঙ্গে ক্ষতিপূরণ আদায়ের বিধান আছে।",
          en: "If ignored, file in the Labour Court — the Act provides compensation in addition to arrears.",
        },
      },
      {
        title: { bn: "৪. নিরাপত্তা/অগ্নিকাণ্ড ঝুঁকি", en: "4. Safety/fire hazards" },
        body: {
          bn: "পরিদর্শকের কাছে অভিযোগ করুন; কারখানা বন্ধ/কর্মহীন হলে আইনে বেতনসহ ছাঁটাই ক্ষতিপূরণের অধিকার আছে।",
          en: "Complain to the factory inspector; if the factory closes, the law entitles you to retrenchment compensation including wages.",
        },
      },
    ],
    docs: [
      { name: { bn: "নিয়োগপত্র (থাকলে)", en: "Appointment letter (if any)" }, required: false },
      { name: { bn: "বেতন শিট/ব্যাংক স্টেটমেন্ট", en: "Pay slips / bank statement" }, required: true },
      { name: { bn: "কর্মপরিচয়পত্র / এন্ট্রি কার্ড", en: "Work ID / entry card" }, required: false },
      { name: { bn: "সহকর্মীর লিখিত বিবরণ", en: "Co-worker written statement" }, required: false },
    ],
    faq: [
      {
        q: { bn: "নিয়োগপত্র নেই, মামলা করা যাবে?", en: "No appointment letter — can I still file?" },
        a: {
          bn: "হ্যাঁ; অ্যাটেনডেন্স, বায়োমেট্রিক, রসিদ, সহকর্মীর সাক্ষ্য দিয়ে কর্মসম্পর্ক প্রমাণ করা যায়।",
          en: "Yes; attendance records, biometrics, receipts or co-worker testimony can prove employment.",
        },
      },
      {
        q: { bn: "কোথায় মামলা করব?", en: "Where do I file?" },
        a: {
          bn: "আপনার এলাকার শ্রম আদালত (ঢাকা, গাজীপুর, চট্টগ্রাম, খুলনাসহ প্রধান শিল্প জেলায় আছে)।",
          en: "The Labour Court of your area (in Dhaka, Gazipur, Chattogram, Khulna and other industrial districts).",
        },
      },
    ],
    lawRefs: ["শ্রম আইন, ২০০৬", "শ্রম আদালত অধ্যাদেশ, ২০০৬"],
  },
  {
    slug: "harassment-violence",
    icon: "🛡️",
    group: "violence",
    title: { bn: "নিপীড়ন ও নারী-শিশু নিরাপত্তা", en: "Harassment & Women-Child Safety" },
    short: {
      bn: "যৌন হয়রানি, পারিবারিক সহিংসতা ও হুমকির প্রেক্ষাপটে জরুরি পদক্ষেপ ও আইনি সুরক্ষা।",
      en: "Immediate steps and legal protection against sexual harassment, domestic violence and threats.",
    },
    intro: {
      bn: "যৌন হয়রানির অভিযোগে শিক্ষাপ্রতিষ্ঠান/কর্মস্থলে অভিযোগ কমিটি বাধ্যতামূলক; পারিবারিক সহিংসতায় আদালত থেকে আদেশ, বাসস্থান ও সুরক্ষা চাওয়া যায়। ৯৯৯-এ জরুরি সাহায্য পাওয়া যায়।",
      en: "Every institution/workplace must have a harassment complaint committee; courts can order protection and residence in domestic violence cases. Call 999 for emergencies.",
    },
    steps: [
      {
        title: { bn: "১. নিরাপত্তা নিশ্চিত করুন", en: "1. Ensure immediate safety" },
        body: {
          bn: "বিপদে হলে ৯৯৯; আশার জায়গায় যান; বিশ্বস্ত ব্যক্তিকে জানান।",
          en: "Call 999 in danger, move to a safe place and inform a trusted person.",
        },
      },
      {
        title: { bn: "২. প্রমাণ সংরক্ষণ", en: "2. Preserve evidence" },
        body: {
          bn: "মেসেজ, কল রেকর্ড, ছবি, চিকিৎসা রিপোর্ট — তারিখসহ সংরক্ষণ করুন; কিছু মুছে ফেলবেন না।",
          en: "Keep messages, call records, photos and medical reports with dates; delete nothing.",
        },
      },
      {
        title: { bn: "৩. সংশ্লিষ্ট কমিটি/কর্তৃপক্ষে অভিযোগ", en: "3. Complain to the committee/authority" },
        body: {
          bn: "শিক্ষাপ্রতিষ্ঠান/কর্মস্থলের যৌন হয়রানি প্রতিরোধ কমিটিতে লিখিত অভিযোগ করুন; বাংলাদেশ ব্যাংক অনুমোদিত নীতিমালা অনুসরণ করুন।",
          en: "File a written complaint with the sexual harassment prevention committee of your institution/workplace following the applicable policy.",
        },
      },
      {
        title: { bn: "৪. আদালত/থানা রুট", en: "4. Court/police route" },
        body: {
          bn: "পারিবারিক সহিংসতা (অধ্যাদেশ ২০১০) মামলা, নিরাপত্তা আদেশ বা ম্যাজিস্ট্রেটের আদালতে অভিযোগ করুন; প্রয়োজনে ডিএলএও-র প্যানেল আইনজীবী নিন।",
          en: "File under the Domestic Violence Ordinance 2010, seek protection orders, or complain to the Magistrate court; use a DLAO panel lawyer if needed.",
        },
      },
    ],
    docs: [
      { name: { bn: "অভিযোগের লিখিত বিবরণ (তারিখসহ)", en: "Written complaint with dates" }, required: true },
      { name: { bn: "প্রমাণ: মেসেজ/ছবি/মেডিকেল রিপোর্ট", en: "Evidence: messages/photos/medical report" }, required: true },
      { name: { bn: "সাক্ষীর তালিকা", en: "Witness list" }, required: false },
    ],
    faq: [
      {
        q: { bn: "অভিযোগ করলে চাকরি যাবে?", en: "Will I lose my job for complaining?" },
        a: {
          bn: "ভুক্তভোগীর বিরুদ্ধে প্রতিশোধমূলক ব্যবস্থা নিষিদ্ধ; প্রতিশোধ হলে সেটিও অভিযোগযোগ্য।",
          en: "Retaliation against a complainant is prohibited; retaliatory action is itself complainable.",
        },
      },
      {
        q: { bn: "মামলা ছাড়া কি সুরক্ষা পাওয়া যায়?", en: "Can I get protection without a case?" },
        a: {
          bn: "হ্যাঁ, হটলাইন (৯৯৯, ১৬৬৯৯) এবং অভিযোগ কমিটির মাধ্যমে সুরক্ষা ও মীমাংসার পথ আছে।",
          en: "Yes — hotlines (999, 16699) and complaint committees offer protection and settlement routes.",
        },
      },
    ],
    lawRefs: ["নারী ও শিশু নির্যাতন দমন আইন, ২০০০", "পারিবারিক সহিংসতা (অধ্যাদেশ) আইন, ২০১০"],
  },
  {
    slug: "consumer-rights",
    icon: "🛒",
    group: "consumer",
    title: { bn: "ভোক্তা অধিকার", en: "Consumer Rights" },
    short: {
      bn: "ভেজাল/জাল পণ্য, অতিরিক্ত মূল্য ও সেবা অভিযোগ — হটলাইন ১৬১২১ ও কর্তৃপক্ষের রুট।",
      en: "Adulterated/fake goods, overpricing and service complaints — hotline 16121 and authority routes.",
    },
    intro: {
      bn: "ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯ অনুযায়ী ভেজাল, মিথ্যা বিজ্ঞাপন, অতিরিক্ত মূল্য ও ওজনে প্রতারণায় অভিযোগ করা যায় — হটলাইন ১৬১২১ অথবা জেলা কার্যালয়ে।",
      en: "Under the Consumer Rights Protection Act 2009 you can complain about adulteration, false advertising, overpricing and cheating in weight — via hotline 16121 or the district office.",
    },
    steps: [
      {
        title: { bn: "১. ক্রয়ের প্রমাণ রাখুন", en: "1. Keep proof of purchase" },
        body: { bn: "রসিদ, প্যাকেট, ছবি ও তারিখ সংরক্ষণ করুন।", en: "Keep receipts, packaging, photos and dates." },
      },
      {
        title: { bn: "২. বিক্রেতার কাছে দাবি", en: "2. Demand from the seller" },
        body: { bn: "প্রথমে বিক্রেতার কাছে লিখিত/ভেরিফায়েবলভাবে বদলি/ফেরত দাবি করুন।", en: "First demand replacement/refund from the seller in a verifiable way." },
      },
      {
        title: { bn: "৩. ডিএনসিআরপি-তে অভিযোগ", en: "3. Complain to DNCRP" },
        body: {
          bn: "হটলাইন ১৬১২১, ওয়েব বা জেলা কার্যালয়ে লিখিত অভিযোগ করুন; অভিযোগে পণ্য, তারিখ, দাম ও ক্ষতির বিবরণ দিন।",
          en: "Use hotline 16121, the web portal or the district office; describe product, date, price and loss.",
        },
      },
      {
        title: { bn: "৪. ক্ষতিপূরণ ও শাস্তি", en: "4. Compensation and penalty" },
        body: { bn: "কর্তৃপক্ষ জরিমানা করতে পারে এবং ক্ষতিপূরণের নির্দেশ দিতে পারে।", en: "The authority can fine and order compensation." },
      },
    ],
    docs: [
      { name: { bn: "রসিদ/চালান", en: "Receipt/invoice" }, required: false },
      { name: { bn: "পণ্যের ছবি/নমুনা", en: "Product photo/sample" }, required: true },
      { name: { bn: "লিখিত অভিযোগ", en: "Written complaint" }, required: true },
    ],
    faq: [
      {
        q: { bn: "অভিযোগ করতে টাকা লাগে?", en: "Does it cost to complain?" },
        a: { bn: "না; হটলাইন ও লিখিত অভিযোগ বিনামূল্যে।", en: "No; hotline and written complaints are free." },
      },
      {
        q: { bn: "অনলাইন কেনাকাটায় প্রতারিত হলে?", en: "Cheated in online shopping?" },
        a: {
          bn: "ডিএনসিআরপি এবং প্রয়োজনে সাইবার আইনেও অভিযোগ করা যায়; অর্ডার ও পেমেন্ট প্রমাণ রাখুন।",
          en: "Complain to DNCRP and, if needed, under cyber law; keep order and payment proofs.",
        },
      },
    ],
    lawRefs: ["ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯"],
  },
  {
    slug: "cyber-harassment",
    icon: "📱",
    group: "cyber",
    title: { bn: "সাইবার হয়রানি ও অনলাইন নিরাপত্তা", en: "Cyber Harassment & Online Safety" },
    short: {
      bn: "ছবি দিয়ে ব্ল্যাকমেইল, ফেক আইডি ও অপমানজনক পোস্ট — প্রমাণ সংরক্ষণ ও অভিযোগের পথ।",
      en: "Photo blackmail, fake IDs and defamatory posts — preserve evidence and complain.",
    },
    intro: {
      bn: "ডিজিটাল নিরাপত্তা আইনে মানহানিকর তথ্য ছড়ানো, ভয় দেখানো ও পরিচয় প্রতারণা অপরাধ। ব্ল্যাকমেইলে টাকা না দিয়ে দ্রুত প্রমাণ সংরক্ষণ ও অভিযোগ করুন।",
      en: "Digital security law criminalises spreading defamatory content, intimidation and identity fraud. In blackmail, do not pay — preserve evidence and complain quickly.",
    },
    steps: [
      {
        title: { bn: "১. প্রমাণ সংরক্ষণ", en: "1. Preserve evidence" },
        body: {
          bn: "প্রোফাইল লিংক, স্ক্রিনশট (তারিখ-সময়সহ), URL, নম্বর — সব সংরক্ষণ করুন; ব্লক/ডিলিট করবেন না।",
          en: "Save profile links, timestamped screenshots, URLs and numbers; do not block or delete yet.",
        },
      },
      {
        title: { bn: "২. প্ল্যাটফর্ম রিপোর্ট", en: "2. Report to the platform" },
        body: { bn: "ফেসবুক/ইউটিউবে রিপোর্ট করে কনটেন্ট সরানোর চেষ্টা করুন এবং রিপোর্ট রেফারেন্স রাখুন।", en: "Report on the platform to remove content and keep the report reference." },
      },
      {
        title: { bn: "৩. সাইবার পুলিশ/থানায় অভিযোগ", en: "3. Complain to cyber police/police" },
        body: {
          bn: "CID সাইবার পুলিশ কেন্দ্র বা নিকটস্থ থানায় লিখিত অভিযোগ; জরুরি হলে দ্রুত পদক্ষেপ চান।",
          en: "File a written complaint at the CID Cyber Police Centre or nearest police station; request urgent action if urgent.",
        },
      },
      {
        title: { bn: "৪. সাইবার ট্রাইব্যুনাল", en: "4. Cyber Tribunal" },
        body: { bn: "মামলা গঠন প্রয়োজনে সাইবার ট্রাইব্যুনালে চলে; আইনজীবীর পরামর্শ নিন।", en: "The case proceeds in the Cyber Tribunal; take legal advice." },
      },
    ],
    docs: [
      { name: { bn: "স্ক্রিনশট ও লিংক (তারিখসহ)", en: "Screenshots and links (timestamped)" }, required: true },
      { name: { bn: "NID ও যোগাযোগ", en: "NID and contact" }, required: true },
      { name: { bn: "প্ল্যাটফর্ম রিপোর্ট রেফারেন্স", en: "Platform report reference" }, required: false },
    ],
    faq: [
      {
        q: { bn: "ব্ল্যাকমেইলার টাকা চাইছে, দেব?", en: "The blackmailer wants money — should I pay?" },
        a: {
          bn: "না; টাকা দিলে চাহিদা বাড়ে। প্রমাণ রেখে দ্রুত সাইবার পুলিশে অভিযোগ করুন।",
          en: "No; payment increases demands. Preserve evidence and complain to cyber police immediately.",
        },
      },
      {
        q: { bn: "আমার পরিচয় ফাঁস হবে?", en: "Will my identity be exposed?" },
        a: {
          bn: "অভিযোগে গোপনীয়তার অনুরোধ করতে পারেন; নারী ভুক্তভোগীদের জন্য মহিলা ও শিশু প্রতিযোগিতা প্রতিরোধ সেল আছে।",
          en: "You may request confidentiality in the complaint; women victims can use the Women & Children prevention cells.",
        },
      },
    ],
    lawRefs: ["ডিজিটাল নিরাপত্তা আইন, ২০১৮ (নবায়নিত কাঠামো)", "নারী ও শিশু নির্যাতন দমন আইন, ২০০০"],
  },
  {
    slug: "helpline-16699",
    icon: "📞",
    group: "money",
    title: { bn: "আইনি সহায়তা হেল্পলাইন ১৬৬৯৯", en: "Legal Aid Helpline 16699" },
    short: {
      bn: "ফোনেই আইনি পরামর্শ, আবেদনের স্ট্যাটাস ও নিকটস্থ অফিসের তথ্য — বিনামূল্যে।",
      en: "Free legal advice, application status and nearest office info over the phone.",
    },
    intro: {
      bn: "১৬৬৯৯ হেল্পলাইনে কল করে আইনি পরামর্শ, আবেদন স্ট্যাটাস ও জেলা আইনি সহায়তা অফিসের তথ্য পাওয়া যায়। কল দিতে না পারলে উসিডি/এসএমএস রুটও আছে।",
      en: "Call 16699 for legal advice, application status and District Legal Aid Office information. USSD/SMS routes exist if you cannot call.",
    },
    steps: [
      {
        title: { bn: "১. ১৬৬৯৯ নম্বরে কল করুন", en: "1. Call 16699" },
        body: { bn: "সকাল ৯টা–বিকেল ৫টা (শুক্রবার ছুটি)। ভয়েসে নিজের সমস্যা বলুন।", en: "9am–5pm (Friday closed). Describe your problem by voice." },
      },
      {
        title: { bn: "২. এজেন্ট আবেদন খুলবে", en: "2. Agent opens the application" },
        body: { bn: "আপনার নাম, জেলা ও সমস্যার ধরন নিয়ে সিস্টেমে আবেদন আইডি তৈরি হবে — নম্বরটি লিখে রাখুন।", en: "The agent creates an Application ID with your name, district and issue type — write it down." },
      },
      {
        title: { bn: "৩. স্ট্যাটাস জানতে আবার কল", en: "3. Call back for status" },
        body: { bn: "আবেদন আইডি বললে বর্তমান অবস্থা ও পরের ধাপ জানা যাবে — অফিসে যাওয়ার আগে।", en: "Quote the Application ID to learn current status and next step before traveling." },
      },
    ],
    docs: [{ name: { bn: "কোনো কাগজ লাগে না — শুধু ফোন", en: "No papers needed — just a phone" }, required: false }],
    faq: [
      {
        q: { bn: "কল করতে টাকা লাগে?", en: "Does calling cost?" },
        a: { bn: "সাধারণ কল রেট; আইনি সহায়তা বিনামূল্যে।", en: "Normal call rate; legal aid itself is free." },
      },
      {
        q: { bn: "আমি পড়তে পারি না — কীভাবে স্ট্যাটাস জানব?", en: "I cannot read — how do I get status?" },
        a: { bn: "ভয়েসেই সব জানা যায়; এজেন্ট পড়ে শোনাবে।", en: "Everything is voice-based; the agent reads it out for you." },
      },
    ],
    lawRefs: ["জাতীয় আইনি সহায়তা আইন, ২০০০"],
  },
];

export const TOPIC_GROUP_OF = (slug: string) => TOPICS.find((t) => t.slug === slug)?.group;
