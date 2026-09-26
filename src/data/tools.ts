import type { Tool } from "@/lib/types";

export const TOOLS: Tool[] = [
  {
    slug: "maintenance-application",
    icon: "🧾",
    title: { bn: "ভরণপোষণের আবেদন তৈরি করুন", en: "Draft a maintenance application" },
    purpose: {
      bn: "পারিবারিক আদালতে দাখিলের জন্য প্রিন্টযোগ্য আবেদন তৈরি করুন — কোনো আইনজীবী ছাড়াই।",
      en: "Generate a printable application for Family Court — no lawyer needed.",
    },
    time: { bn: "১০ মিনিট", en: "10 minutes" },
    feeNote: { bn: "আদালত ফি: শূন্য", en: "Court fee: zero" },
    steps: [
      {
        id: "s1",
        title: { bn: "আবেদনকারীর তথ্য", en: "Applicant information" },
        help: { bn: "আপনার নিজের তথ্য দিন।", en: "Provide your own details." },
        fields: [
          { id: "name", label: { bn: "পূর্ণ নাম", en: "Full name" }, type: "text", required: true },
          { id: "father", label: { bn: "পিতা/স্বামীর নাম", en: "Father's/husband's name" }, type: "text", required: true },
          { id: "nid", label: { bn: "NID নম্বর (না থাকলে জন্মনিবন্ধন)", en: "NID (or birth registration)" }, type: "text" },
          { id: "mobile", label: { bn: "মোবাইল নম্বর", en: "Mobile number" }, type: "tel", required: true, hint: { bn: "নিরাপদ নম্বর দিন", en: "Use a number you control" } },
          { id: "address", label: { bn: "ঠিকানা", en: "Address" }, type: "textarea", required: true },
        ],
      },
      {
        id: "s2",
        title: { bn: "প্রতিবাদীর তথ্য", en: "Respondent information" },
        help: { bn: "যার বিরুদ্ধে দাবি করছেন।", en: "The person the claim is against." },
        fields: [
          { id: "rname", label: { bn: "প্রতিবাদীর নাম", en: "Respondent name" }, type: "text", required: true },
          { id: "raddress", label: { bn: "প্রতিবাদীর ঠিকানা", en: "Respondent address" }, type: "textarea", required: true },
        ],
      },
      {
        id: "s3",
        title: { bn: "দাবির বিবরণ", en: "Claim details" },
        help: { bn: "বকেয়া ও মাসিক চাহিদা।", en: "Arrears and monthly need." },
        fields: [
          { id: "marriageDate", label: { bn: "বিবাহের তারিখ", en: "Date of marriage" }, type: "date" },
          {
            id: "claimType",
            label: { bn: "দাবির ধরন", en: "Claim type" },
            type: "select",
            options: [
              { bn: "স্ত্রীর ভরণপোষণ", en: "Wife's maintenance" },
              { bn: "সন্তানের ভরণপোষণ", en: "Children's maintenance" },
              { bn: "উভয়", en: "Both" },
            ],
          },
          { id: "arrears", label: { bn: "বকেয়ার পরিমাণ (টাকা)", en: "Arrears amount (BDT)" }, type: "text" },
          { id: "monthly", label: { bn: "মাসিক দাবি (টাকা)", en: "Monthly claim (BDT)" }, type: "text" },
          { id: "details", label: { bn: "ঘটনার সংক্ষিপ্ত বিবরণ", en: "Short description of events" }, type: "textarea", required: true },
        ],
      },
      {
        id: "s4",
        title: { bn: "সাক্ষী ও প্রমাণ", en: "Witnesses and evidence" },
        help: { bn: "যা আছে লিখুন; সব বাধ্যতামূলক নয়।", en: "List what you have; none are mandatory." },
        fields: [{ id: "witness", label: { bn: "সাক্ষী/প্রমাণের বিবরণ", en: "Witnesses / evidence" }, type: "textarea" }],
      },
    ],
    where: [
      { bn: "জেলা পারিবারিক আদালত (আবেদনকারীর জেলা)", en: "District Family Court (applicant's district)" },
      { bn: "জেলা আইনি সহায়তা অফিস — ফ্রি প্যানেল আইনজীবীর জন্য", en: "District Legal Aid Office — for a free panel lawyer" },
    ],
    outcome: {
      bn: "তৈরি আবেদন প্রিন্ট/সেভ করে আদালতের ফাইলিং ব্র্যাঞ্চে জমা দিন। আবেদনের কপি ২ সেট রাখুন।",
      en: "Print/save the application and submit at the court filing branch. Keep 2 copies.",
    },
  },
  {
    slug: "divorce-notice",
    icon: "📑",
    title: { bn: "তালাকের নোটিশ প্রস্তুত", en: "Prepare divorce notice" },
    purpose: { bn: "লিখিত তালাক নোটিশ ও চেয়ারম্যানকে জানানোর খসড়া তৈরি করুন।", en: "Draft the written divorce notice and Chairman notification." },
    time: { bn: "৮ মিনিট", en: "8 minutes" },
    feeNote: { bn: "রেজিস্ট্রেশন ফি পরে প্রযোজ্য", en: "Registration fee applies later" },
    steps: [
      {
        id: "s1",
        title: { bn: "পক্ষগুলোর তথ্য", en: "Parties" },
        help: { bn: "কাবিননামা অনুযায়ী তথ্য দিন।", en: "Use kabinnama details." },
        fields: [
          { id: "wife", label: { bn: "স্ত্রীর নাম", en: "Wife's name" }, type: "text", required: true },
          { id: "husband", label: { bn: "স্বামীর নাম", en: "Husband's name" }, type: "text", required: true },
          { id: "kabin", label: { bn: "কাবিননামা নম্বর ও তারিখ", en: "Kabinnama no. and date" }, type: "text", required: true },
        ],
      },
      {
        id: "s2",
        title: { bn: "তালাকের সিদ্ধান্ত", en: "Decision" },
        help: { bn: "কারণ সংক্ষেপে লিখুন।", en: "State reasons briefly." },
        fields: [
          { id: "who", label: { bn: "কে তালাক দিচ্ছেন", en: "Who is giving divorce" }, type: "select", options: [{ bn: "স্বামী", en: "Husband" }, { bn: "স্ত্রী", en: "Wife" }] },
          { id: "reason", label: { bn: "কারণ", en: "Reasons" }, type: "textarea", required: true },
          { id: "date", label: { bn: "নোটিশের তারিখ", en: "Notice date" }, type: "date", required: true },
        ],
      },
      {
        id: "s3",
        title: { bn: "চেয়ারম্যানের তথ্য", en: "Chairman details" },
        help: { bn: "যেখানে বিবাহ নিবন্ধিত সেখানকার চেয়ারম্যান।", en: "Chairman where the marriage is registered." },
        fields: [{ id: "chairman", label: { bn: "ইউনিয়ন/পৌরসভা ও চেয়ারম্যানের নাম", en: "Union/Pourashava and Chairman's name" }, type: "text", required: true }],
      },
    ],
    where: [
      { bn: "সংশ্লিষ্ট চেয়ারম্যান অফিস — নোটিশের কপি", en: "Concerned Chairman office — copy of notice" },
      { bn: "রেজিস্ট্রার (ম্যারেজ অ্যান্ড ডিভোর্স) অফিস — নিবন্ধনের জন্য", en: "Marriage & Divorce Registrar — for registration" },
    ],
    outcome: {
      bn: "৯০ দিন অতিবাহিত হওয়ার আগে তালাক কার্যকর হবে না; রেজিস্ট্রেশন করে সনদ নিন।",
      en: "The divorce is not effective before 90 days elapse; register it and collect the certificate.",
    },
  },
  {
    slug: "land-complaint",
    icon: "🌾",
    title: { bn: "জমি অভিযোগ / নামজারি আবেদন", en: "Land complaint / mutation application" },
    purpose: { bn: "ভূমি অফিসে নামজারি বা দখল অভিযোগের ফরম।", en: "Forms for mutation or possession complaint at the land office." },
    time: { bn: "৭ মিনিট", en: "7 minutes" },
    feeNote: { bn: "সরকারি ফি অফিসে প্রযোজ্য", en: "Government fee applies at office" },
    steps: [
      {
        id: "s1",
        title: { bn: "জমির পরিচয়", en: "Land identity" },
        help: { bn: "দলিল ও খতিয়ান অনুযায়ী।", en: "Per deed and khatian." },
        fields: [
          { id: "district", label: { bn: "জেলা", en: "District" }, type: "text", required: true },
          { id: "upazila", label: { bn: "উপজেলা", en: "Upazila" }, type: "text", required: true },
          { id: "mouza", label: { bn: "মৌজা", en: "Mouza" }, type: "text", required: true },
          { id: "khatian", label: { bn: "খতিয়ান নম্বর", en: "Khatian no." }, type: "text", required: true },
          { id: "dag", label: { bn: "দাগ নম্বর ও জমির পরিমাণ", en: "Dag no. and land size" }, type: "text", required: true },
        ],
      },
      {
        id: "s2",
        title: { bn: "আবেদনের ধরন", en: "Application type" },
        help: { bn: "যা প্রযোজ্য।", en: "As applicable." },
        fields: [
          {
            id: "kind",
            label: { bn: "আবেদন", en: "Application" },
            type: "select",
            options: [{ bn: "নামজারি (মিউটেশন)", en: "Mutation (namjari)" }, { bn: "দখল অভিযোগ", en: "Possession complaint" }, { bn: "উত্তরাধিকার বণ্টন", en: "Inheritance partition" }],
          },
          { id: "owner", label: { bn: "বর্তমান মালিকের নাম", en: "Current owner's name" }, type: "text", required: true },
          { id: "detail", label: { bn: "বিস্তারিত বিবরণ", en: "Details" }, type: "textarea", required: true },
        ],
      },
    ],
    where: [
      { bn: "সহকারী কমিশনার (ভূমি) অফিস", en: "AC (Land) office" },
      { bn: "উপজেলা ভূমি অফিস", en: "Upazila land office" },
    ],
    outcome: { bn: "অনলাইনে আবেদন করলে ট্র্যাকিং নম্বর সংরক্ষণ করুন।", en: "Save the tracking number if applied online." },
  },
  {
    slug: "wage-claim",
    icon: "🏭",
    title: { bn: "বকেয়া বেতনের দাবি-পত্র", en: "Unpaid wage demand letter" },
    purpose: { bn: "মালিক/ব্যবস্থাপকের কাছে লিখিত দাবি এবং শ্রম আদালতের প্রস্তুতি।", en: "Written demand to the owner/manager and Labour Court preparation." },
    time: { bn: "৬ মিনিট", en: "6 minutes" },
    feeNote: { bn: "বিনামূল্যে", en: "Free" },
    steps: [
      {
        id: "s1",
        title: { bn: "শ্রমিকের তথ্য", en: "Worker information" },
        help: { bn: "", en: "" },
        fields: [
          { id: "wname", label: { bn: "নাম", en: "Name" }, type: "text", required: true },
          { id: "wdesig", label: { bn: "পদবি ও বিভাগ", en: "Designation and section" }, type: "text" },
          { id: "wdoj", label: { bn: "যোগদানের তারিখ", en: "Date of joining" }, type: "date" },
        ],
      },
      {
        id: "s2",
        title: { bn: "কারখানার তথ্য", en: "Factory information" },
        help: { bn: "", en: "" },
        fields: [
          { id: "fname", label: { bn: "কারখানার নাম ও ঠিকানা", en: "Factory name and address" }, type: "textarea", required: true },
          { id: "owner", label: { bn: "মালিক/ব্যবস্থাপকের নাম", en: "Owner/manager name" }, type: "text" },
        ],
      },
      {
        id: "s3",
        title: { bn: "বকেয়ার হিসাব", en: "Arrears calculation" },
        help: { bn: "মোটামুটি হলেও লিখুন।", en: "Approximate is fine." },
        fields: [
          { id: "months", label: { bn: "কত মাসের বকেয়া", en: "Months unpaid" }, type: "text", required: true },
          { id: "amount", label: { bn: "আনুমানিক টাকা", en: "Approximate amount" }, type: "text", required: true },
          { id: "ot", label: { bn: "ওভারটাইম বকেয়া আছে?", en: "Overtime due?" }, type: "radio", options: [{ bn: "হ্যাঁ", en: "Yes" }, { bn: "না", en: "No" }] },
        ],
      },
    ],
    where: [
      { bn: "কারখানার ব্যবস্থাপনা — প্রথমে দাবি-পত্র", en: "Factory management — demand letter first" },
      { bn: "শ্রম আদালত / প্রধান শ্রম পরিদর্শক", en: "Labour Court / Chief Inspector of Factories" },
    ],
    outcome: { bn: "দাবি-পত্রের গ্রহণকৃত কপি সংরক্ষণ করুন — আদালতে প্রমাণ।", en: "Keep the delivered copy of the demand letter — evidence in court." },
  },
  {
    slug: "cyber-complaint",
    icon: "📱",
    title: { bn: "সাইবার অপরাধের অভিযোগ", en: "Cyber crime complaint" },
    purpose: { bn: "সাইবার পুলিশ/থানায় জমার জন্য অভিযোগ তৈরি করুন।", en: "Prepare a complaint for cyber police/police station." },
    time: { bn: "৯ মিনিট", en: "9 minutes" },
    feeNote: { bn: "বিনামূল্যে", en: "Free" },
    steps: [
      {
        id: "s1",
        title: { bn: "অভিযোগকারী", en: "Complainant" },
        help: { bn: "", en: "" },
        fields: [
          { id: "name", label: { bn: "নাম", en: "Name" }, type: "text", required: true },
          { id: "contact", label: { bn: "মোবাইল", en: "Mobile" }, type: "tel", required: true },
          { id: "address", label: { bn: "ঠিকানা", en: "Address" }, type: "textarea" },
        ],
      },
      {
        id: "s2",
        title: { bn: "ঘটনা ও প্রমাণ", en: "Incident and evidence" },
        help: { bn: "লিংক ও তারিখ অবশ্যই দিন।", en: "Include links and dates." },
        fields: [
          {
            id: "type",
            label: { bn: "অপরাধের ধরন", en: "Offence type" },
            type: "select",
            options: [{ bn: "ব্ল্যাকমেইল", en: "Blackmail" }, { bn: "ফেক আইডি", en: "Fake ID" }, { bn: "অপমানজনক পোস্ট", en: "Defamatory post" }, { bn: "হ্যাকিং", en: "Hacking" }],
          },
          { id: "links", label: { bn: "প্রোফাইল/পোস্টের লিংক", en: "Profile/post links" }, type: "textarea", required: true },
          { id: "dates", label: { bn: "কখন কী হয়েছে (তারিখসহ)", en: "What happened when (with dates)" }, type: "textarea", required: true },
        ],
      },
    ],
    where: [
      { bn: "CID সাইবার পুলিশ কেন্দ্র, মালিবাগ, ঢাকা / আঞ্চলিক ইউনিট", en: "CID Cyber Police Centre, Malibagh, Dhaka / regional units" },
      { bn: "নিকটস্থ থানা", en: "Nearest police station" },
    ],
    outcome: { bn: "GD নম্বর/অভিযোগ রসিদ সংরক্ষণ করুন।", en: "Keep the GD number/complaint receipt." },
  },
  {
    slug: "consumer-complaint",
    icon: "🛒",
    title: { bn: "ভোক্তা অভিযোগ", en: "Consumer complaint" },
    purpose: { bn: "ডিএনসিআরপি-তে পাঠানোর মতো অভিযোগ তৈরি করুন।", en: "Draft a complaint for DNCRP." },
    time: { bn: "৫ মিনিট", en: "5 minutes" },
    feeNote: { bn: "বিনামূল্যে", en: "Free" },
    steps: [
      {
        id: "s1",
        title: { bn: "আপনার তথ্য", en: "Your information" },
        help: { bn: "", en: "" },
        fields: [
          { id: "name", label: { bn: "নাম", en: "Name" }, type: "text", required: true },
          { id: "phone", label: { bn: "মোবাইল", en: "Mobile" }, type: "tel", required: true },
        ],
      },
      {
        id: "s2",
        title: { bn: "পণ্য/সেবা ও অভিযোগ", en: "Product/service and complaint" },
        help: { bn: "", en: "" },
        fields: [
          { id: "product", label: { bn: "পণ্য/সেবার নাম", en: "Product/service name" }, type: "text", required: true },
          { id: "shop", label: { bn: "দোকান/প্রতিষ্ঠানের নাম ও ঠিকানা", en: "Shop/business name and address" }, type: "textarea", required: true },
          { id: "price", label: { bn: "মূল্য ও ক্রয়ের তারিখ", en: "Price and purchase date" }, type: "text" },
          { id: "issue", label: { bn: "সমস্যার বিবরণ", en: "Problem description" }, type: "textarea", required: true },
        ],
      },
    ],
    where: [
      { bn: "জাতীয় ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর — হটলাইন ১৬১২১", en: "Directorate of National Consumer Rights Protection — hotline 16121" },
    ],
    outcome: { bn: "অভিযোগ নম্বর সংরক্ষণ করুন; প্রয়োজনে রসিদ জমা দিন।", en: "Keep the complaint number; submit receipts if asked." },
  },
];

export const TOOL_OF = (slug: string) => TOOLS.find((t) => t.slug === slug);
