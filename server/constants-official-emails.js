// ============================================================================
// DLAS — অফিসিয়াল স্টাফ ইমেইল রোস্টার (dbla.gov.bd)
// SS2 স্ক্রিনের অটোকমপ্লিট ড্রপডাউন + সিড ব্যাকফিল — একই উৎস, তাই কখনো গরমিল হয় না।
// লগইন ডেমো পিন: 1234
// ============================================================================
'use strict';

const OFFICIAL_STAFF_EMAILS = [
  {
    username: 'officer.joypurhat',
    email: 'netrokona.dlao@dbla.gov.bd',
    label: 'রহিমা খাতুন — DLAO কর্মকর্তা (জয়পুরহাট)',
    office: 'জেলা আইনি সহায়তা কার্যালয়, জয়পুরহাট',
    role: 'DLAO_OFFICER',
  },
  {
    username: 'officer.jhenaidah',
    email: 'jhenaidah.dlao@dbla.gov.bd',
    label: 'মাহমুদুল হাসান — DLAO কর্মকর্তা (ঝিনাইদহ)',
    office: 'জেলা আইনি সহায়তা কার্যালয়, ঝিনাইদহ',
    role: 'DLAO_OFFICER',
  },
  {
    username: 'officer.barguna',
    email: 'barguna.dlao@dbla.gov.bd',
    label: 'আরিফ চৌধুরী — DLAO কর্মকর্তা (বরগুনা)',
    office: 'জেলা আইনি সহায়তা কার্যালয়, বরগুনা',
    role: 'DLAO_OFFICER',
  },
  {
    username: 'mediator.joypurhat',
    email: 'joypurhat.dmed@dbla.gov.bd',
    label: 'নাসরিন সুলতানা — মধ্যস্থতাকারী (ADR)',
    office: 'জেলা আইনি সহায়তা কার্যালয়, জয়পুরহাট',
    role: 'MEDIATOR',
  },
  {
    username: 'helpline.agent1',
    email: 'agent1.16699@dbla.gov.bd',
    label: 'ফরিদ মিয়া — ১৬৬৯৯ হেল্পলাইন এজেন্ট',
    office: '১৬৬৯৯ জাতীয় হেল্পলাইন',
    role: 'HELPLINE',
  },
  {
    username: 'udc.khagrachari',
    email: 'khagrachhari.udc@dbla.gov.bd',
    label: 'জয়ন্ত চাকমা — UDC উদ্যোক্তা',
    office: 'ইউনিয়ন ডিজিটাল সেন্টার, খাগড়াছড়ি',
    role: 'UDC',
  },
  {
    username: 'lawyer.shahana',
    email: 'shahana.lawyer@dbla.gov.bd',
    label: 'অ্যাডভোকেট শাহানা আক্তার — প্যানেল আইনজীবী',
    office: 'জয়পুরহাট জেলা আদালত',
    role: 'LAWYER',
  },
  {
    username: 'lawyer.kabir',
    email: 'kabir.lawyer@dbla.gov.bd',
    label: 'অ্যাডভোকেট কবির হোসেন — প্যানেল আইনজীবী',
    office: 'বরগুনা জেলা আদালত',
    role: 'LAWYER',
  },
  {
    username: 'receiving.dhaka',
    email: 'receiving.dhaka@dbla.gov.bd',
    label: 'তানভীর আহমেদ — গ্রহণকারী DLAO (ঢাকা)',
    office: 'জেলা আইনি সহায়তা কার্যালয়, ঢাকা',
    role: 'RECEIVING_DLAO',
  },
  {
    username: 'support.staff1',
    email: 'support.joypurhat@dbla.gov.bd',
    label: 'সালমা পারভীন — কেস সাপোর্ট',
    office: 'জেলা আইনি সহায়তা কার্যালয়, জয়পুরহাট',
    role: 'CASE_SUPPORT',
  },
  {
    username: 'admin',
    email: 'admin@dbla.gov.bd',
    label: 'সিস্টেম প্রশাসক (Admin)',
    office: 'ডিবিএলএ সদর দপ্তর',
    role: 'ADMIN',
  },
  {
    username: 'ripon.rep',
    email: 'ripon.rep@dbla.gov.bd',
    label: 'রিপন আক্তার — প্রতিনিধি (ময়ূরীর ভাই)',
    office: 'জয়পুরহাট',
    role: 'REPRESENTATIVE',
  },
];

// username -> email ম্যাপ (সিড ব্যাকফিলের জন্য)
const BACKFILL_EMAILS = Object.fromEntries(OFFICIAL_STAFF_EMAILS.map((s) => [s.username, s.email]));

module.exports = { OFFICIAL_STAFF_EMAILS, BACKFILL_EMAILS };
