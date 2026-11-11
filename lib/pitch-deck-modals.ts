export interface ModuleItem {
  id: string;
  name: { bn: string; en: string };
  scope: string;
  desc: { bn: string; en: string };
  route: string;
  badge: string;
}

export interface FinancialScenario {
  title: { bn: string; en: string };
  dealers: string;
  annualOrders: string;
  gmvBdt: string;
  revenueBdt: string;
  netMargin: string;
  notes: { bn: string; en: string };
}

export interface LeadershipMember {
  name: { bn: string; en: string };
  role: { bn: string; en: string };
  experience: { bn: string; en: string };
  bio: { bn: string; en: string };
  focusArea: { bn: string; en: string };
}

export const PITCH_MODULES_LIST: ModuleItem[] = [
  {
    id: "Core Standard",
    name: { bn: "ওটিপি ও আইডেন্টিটি ম্যানেজমেন্ট", en: "Phone OTP Identity & Access" },
    scope: "Live Module /auth",
    desc: {
      bn: "বাংলাদেশের মোবাইল নম্বর দিয়ে নিরাপদ পাসওয়ার্ডলেস ওটিপি লগইন ও সেশন লাইফসাইকেল।",
      en: "Secure passwordless Bangladesh mobile OTP authentication and session tokens.",
    },
    route: "/auth",
    badge: "Core IAM",
  },
  {
    id: "Core Standard",
    name: { bn: "সাইট অ্যাড্রেস ও প্রজেক্ট প্রোফাইল", en: "Customer Construction Site Profiles" },
    scope: "Live Module /workspace/customer",
    desc: {
      bn: "ক্রেতাদের একাধিক কনস্ট্রাকশন সাইট ডেলিভারি ঠিকানা ও ডেলিভারি উইন্ডো সংরক্ষণ।",
      en: "Saved construction site delivery addresses and scheduling preferences.",
    },
    route: "/workspace/customer",
    badge: "Customer",
  },
  {
    id: "Core Standard",
    name: { bn: "ডিলার অর্গানাইজেশন ও মাল্টি-ব্রাঞ্চ", en: "Dealer Organization & Multi-Branch" },
    scope: "Live Module /workspace/dealer/organization",
    desc: {
      bn: "ট্রেড লাইসেন্স, টিআইএন, বিন এবং একাধিক শোরুম ব্রাঞ্চ ঠিকানা পরিচালনা।",
      en: "Legal entity management, Trade License, TIN, and showroom branch network.",
    },
    route: "/workspace/dealer/organization",
    badge: "Dealer",
  },
  {
    id: "Core Standard",
    name: { bn: "ডিলার স্টাফ রোল-বেসড অ্যাক্সেস (RBAC)", en: "Scoped Staff Roles & RBAC" },
    scope: "Live Module /workspace/dealer/organization",
    desc: {
      bn: "মালিক, ম্যানেজার ও সেলস স্টাফদের জন্য কঠোর সার্ভার-সাইড পারমিশন বাউন্ডারি।",
      en: "Owner, Manager, and Staff permission scopes preventing unauthorized actions.",
    },
    route: "/workspace/dealer/organization",
    badge: "Security",
  },
  {
    id: "Core Standard",
    name: { bn: "স্ট্রাকচার্ড ক্যাটালগ ও স্পেসিফিকেশন", en: "Structured Technical Catalogue" },
    scope: "Live Module /workspace/dealer/catalogue",
    desc: {
      bn: "টাইলসের সঠিক সাইজ, সারফেস ফিনিশ, গ্রেড, ওয়াটার অ্যাবসর্পশন ও বিডিটি রেট।",
      en: "Standardized ceramic specifications, dimensions, finish, and indicative pricing.",
    },
    route: "/workspace/dealer/catalogue",
    badge: "Catalogue",
  },
  {
    id: "Core Standard",
    name: { bn: "মার্কেটপ্লেস সার্চ ও মাল্টি-ফ্যাসেট ফিল্টার", en: "Faceted Marketplace Search" },
    scope: "Live Module /marketplace",
    desc: {
      bn: "ক্যাটাগরি, জেলা, ফিনিশ, স্টক এবং মূল্য অনুযায়ী রিয়েল-টাইম সার্চ ও ফিল্টারিং।",
      en: "Multi-parameter filtering by category, finish, district, stock, and price.",
    },
    route: "/marketplace",
    badge: "Discovery",
  },
  {
    id: "Core Standard",
    name: { bn: "টাইল কাভারেজ ও কার্টুন ক্যালকুলেটর", en: "Tile Coverage & Box Calculator" },
    scope: "Live Module /marketplace/[id]",
    desc: {
      bn: "রুমের মাপ ইনপুট করে অপচয়সহ মোট টাইলস, কার্টুন ও সম্ভাব্য খরচ অটো-ক্যালকুলেশন।",
      en: "Accurate conversion of room area into box counts with wastage compensation.",
    },
    route: "/marketplace",
    badge: "Utility",
  },
  {
    id: "Core Standard",
    name: { bn: "মাল্টি-ডিলার আরএফকিউ সাবমিশন", en: "Multi-Dealer RFQ Engine" },
    scope: "Live Module /workspace/customer/rfqs",
    desc: {
      bn: "এক ক্লিকে একাধিক ভেরিফায়েড শোরুমে আইটেমাইজড কোটেশনের জন্য আরএফকিউ পাঠানো।",
      en: "Broadcasting or targeting structured RFQs to certified showroom dealers.",
    },
    route: "/workspace/customer/rfqs",
    badge: "Commercial",
  },
  {
    id: "Core Standard",
    name: { bn: "আইটেমাইজড অপরিবর্তনীয় কোটেশন বিল্ডার", en: "Itemized Immutable Quotation Builder" },
    scope: "Live Module /workspace/dealer/rfqs",
    desc: {
      bn: "ডিলারদের পরিবহন খরচ, ডিসকাউন্ট ও ভ্যাটসহ বাধ্যতামূলক বাইন্ডিং কোটেশন তৈরি।",
      en: "Binding BDT quotation creation with itemized transport, tax, and validity lock.",
    },
    route: "/workspace/dealer/rfqs",
    badge: "Dealer",
  },
  {
    id: "Core Standard",
    name: { bn: "কোটেশন তুলনা ও পারফরম্যান্স মেট্রিক্স", en: "Side-by-Side Quote Comparison" },
    scope: "Live Module /workspace/customer/rfqs",
    desc: {
      bn: "একাধিক শোরুমের অফার পাশাপাশি তুলনা: দাম, মেয়াদ, ডিলার ভেরিফিকেশন ও শর্তাবলী।",
      en: "Side-by-side evaluation of competitor quotes for informed procurement.",
    },
    route: "/workspace/customer/rfqs",
    badge: "Buyer Tool",
  },
  {
    id: "Core Standard",
    name: { bn: "অ্যাটোমিক কোটেশন অ্যাকসেপ্টেন্স ও অর্ডার স্ন্যাপশট", en: "Atomic Quote Acceptance & Order Lock" },
    scope: "Live Module -> Live Module",
    desc: {
      bn: "এক ক্লিকে কোটেশন গ্রহণ মাত্র অন্যসব কোটেশন বাতিল ও ফ্রোজেন কমার্শিয়াল স্ন্যাপশট গঠন।",
      en: "Atomic transaction locking terms and generating immutable order records.",
    },
    route: "/workspace/customer/orders",
    badge: "Engine",
  },
  {
    id: "Core Standard",
    name: { bn: "৮-ধাপের অর্ডার ও ডেলিভারি স্টেট মেশিন", en: "Guarded 8-State Order Lifecycle" },
    scope: "Live Module & Live Module",
    desc: {
      bn: "পেন্ডিং থেকে ওয়্যারহাউস প্রস্তুতি, ভেহিকেল অ্যাসাইনমেন্ট, সাইট আগমন ও সমাপ্তি।",
      en: "Guarded progression across warehouse prep, vehicle dispatch, arrival, and signoff.",
    },
    route: "/workspace/customer/orders",
    badge: "Fulfillment",
  },
  {
    id: "Core Standard",
    name: { bn: "দ্বিভাষিক ইন-অ্যাপ নোটিফিকেশন সিস্টেম", en: "Bilingual Event Notification System" },
    scope: "Header & App Context",
    desc: {
      bn: "আরএফকিউ ব্রডকাস্ট, কোটেশন প্রাপ্তি এবং অর্ডার স্ট্যাটাস আপডেটের তাৎক্ষণিক বার্তা।",
      en: "Instant event notifications for RFQs, quotations, order transitions, and alerts.",
    },
    route: "/workspace/customer",
    badge: "Realtime",
  },
  {
    id: "Core Standard",
    name: { bn: "অ্যাডমিন ভেরিফিকেশন ও অডিট ট্রেইল", en: "Admin Moderation & Audit Trail" },
    scope: "Live Module, 14, 15",
    desc: {
      bn: "ট্রেড লাইসেন্স স্ক্রিনিং, লিস্টিং অনুমোদন, প্ল্যাটফর্ম বিরোধ মীমাংসা ও ক্রিপ্টোগ্রাফিক লগ।",
      en: "KYC verification, listing moderation, dispute resolution desk, and audit logs.",
    },
    route: "/workspace/admin/audit",
    badge: "Governance",
  },
  {
    id: "Core Standard",
    name: { bn: "বিরোধ নিষ্পত্তি ও কাস্টমার সাপোর্ট ডেস্ক", en: "Dispute Arbitration & Resolution Desk" },
    scope: "Live Module & Live Module",
    desc: {
      bn: "ভাঙচুর বা ভুল পণ্যের বিরুদ্ধে কাস্টমার বিরোধ উত্থাপন ও ৩ দিনের মধ্যে অ্যাডমিন নিষ্পত্তি।",
      en: "Customer claims management protecting buyers against transport breakage or grade errors.",
    },
    route: "/workspace/admin/orders",
    badge: "Support",
  },
];

export const PITCH_FINANCIAL_SCENARIOS: FinancialScenario[] = [
  {
    title: { bn: "রক্ষণশীল প্রবৃদ্ধি (বছর ১)", en: "Conservative Scenario (Year 1)" },
    dealers: "150 Verified Showrooms",
    annualOrders: "4,200 Orders",
    gmvBdt: "BDT 420M GMV",
    revenueBdt: "BDT 14.8M Revenue",
    netMargin: "28.5%",
    notes: {
      bn: "শুধুমাত্র ঢাকা মেট্রো ও সাভার অঞ্চলের পাইলট। গড় অর্ডার ভ্যালু ১ লাখ টাকা ও ২% ট্রানজ্যাকশন ফি।",
      en: "Focused primarily on Dhaka Metro pilot. Average order BDT 100K with 2.0% transaction fee.",
    },
  },
  {
    title: { bn: "বাস্তবসম্মত প্রবৃদ্ধি (বছর ২)", en: "Realistic Scenario (Year 2)" },
    dealers: "450 Verified Showrooms",
    annualOrders: "16,500 Orders",
    gmvBdt: "BDT 1,815M GMV",
    revenueBdt: "BDT 54.2M Revenue",
    netMargin: "38.2%",
    notes: {
      bn: "ঢাকা, চট্টগ্রাম ও সিলেট বিভাগীয় হাব। সাবস্ক্রিপশন ও ট্রান্সপোর্ট ফি মিলিয়ে রাজস্ব ত্বরান্বিত।",
      en: "Dhaka, Chattogram, and Sylhet hubs active. Subscription SaaS and transport booking scaling.",
    },
  },
  {
    title: { bn: "উচ্চ প্রবৃদ্ধি (বছর ৩)", en: "Aggressive Scenario (Year 3)" },
    dealers: "1,200 Verified Showrooms",
    annualOrders: "52,000 Orders",
    gmvBdt: "BDT 6,240M GMV",
    revenueBdt: "BDT 178.0M Revenue",
    netMargin: "46.0%",
    notes: {
      bn: "দেশব্যাপী ৮টি বিভাগীয় শহরে পূর্ণাঙ্গ বিস্তার, এন্টারপ্রাইজ কন্ট্রাক্টর পোর্টাল ও ৩ডি এআর সাবস্ক্রিপশন।",
      en: "Nationwide presence in all 8 divisions, enterprise contractor suites, and AR premium tiers.",
    },
  },
];

export const PITCH_LEADERSHIP_TEAM: LeadershipMember[] = [
  {
    name: { bn: "খলিফা আহম্মেদ আল-আমিন", en: "Kholipha Ahmmad Al-Amin" },
    role: { bn: "প্রতিষ্ঠাতা ও প্রধান সিস্টেম আর্কিটেক্ট", en: "Founder & Lead Systems Architect" },
    experience: { bn: "সফটওয়্যার আর্কিটেকচার, ফুল-স্ট্যাক ক্লাউড প্ল্যাটফর্ম ও ইকুইসাস বিডি", en: "Full-Stack Enterprise Architect, Founder of EquiSaaS BD" },
    bio: {
      bn: "ডিজিটাইলসের মূল আর্কিটেকচার, স্টেট মেশিন, হাইজিন কন্ট্রোল ও পারফরম্যান্স ইঞ্জিনিয়ারিং ডিজাইন করেছেন। মিশন-ক্রিটিকাল সফটওয়্যার ও বিজনেস সিস্টেম তৈরিতে সুদীর্ঘ অভিজ্ঞতা রয়েছে।",
      en: "Architected DigiTiles core modular monolith, state engines, and performance framework. Proven track record leading enterprise digital products and business automations.",
    },
    focusArea: { bn: "সিস্টেম আর্কিটেকচার, প্রযুক্তি কৌশল ও প্ল্যাটফর্ম নিরাপত্তা", en: "Systems Architecture, Technology Strategy & Platform Security" },
  },
  {
    name: { bn: "মাঠপর্যায়ের ডিলার রিলেশনস টিম", en: "Field Operations & Dealer KYC" },
    role: { bn: "হেড অব ডিলার অনবোর্ডিং ও পার্টনারশিপ", en: "Head of Dealer Onboarding & Field KYC" },
    experience: { bn: "হাতিরপুল ও বাংলামোটর সিরামিকস ট্রেডার্স অ্যাসোসিয়েশন নেটওয়ার্ক", en: "10+ Years in Bangladesh Building Materials & Ceramic Trading" },
    bio: {
      bn: "অন-সাইট শোরুম ইন্সপেকশন, ট্রেড লাইসেন্স ও টিআইএন যাচাইকরণ এবং ডিলারদের ডিজিটাল ক্যাটালগ আপলোডে সরাসরি সহায়তা প্রদান করে।",
      en: "Coordinates on-site showroom inspection, trade document audits, and hands-on digital onboarding for dealer owners and branch staff.",
    },
    focusArea: { bn: "ডিলার সম্পর্ক, মাঠপর্যায়ের ভেরিফিকেশন ও কমপ্লায়েন্স", en: "Showroom Partnerships, Field KYC Audits & Compliance" },
  },
  {
    name: { bn: "ইঞ্জিনিয়ারিং ও ৩ডি ভিজ্যুয়ালাইজার ল্যাব", en: "Core Engineering & Visualizer Lab" },
    role: { bn: "লিড ফুল-স্ট্যাক ও কম্পিউটার গ্রাফিক্স টিম", en: "Lead Full-Stack & 3D Graphics Engineers" },
    experience: { bn: "নেক্সট.জেএস ১৪, টাইপস্ক্রিপ্ট, ওয়েবজিএল ও প্লেরাইট অটোমেশন", en: "Next.js 14, WebGL, Realtime Graphics, Automated Testing" },
    bio: {
      bn: "রিয়েল-টাইম সারফেস সোয়াচ প্রসিডিউরাল রেন্ডারার, ২ডি/৩ডি রুম ভিজ্যুয়ালাইজার এবং প্লেরাইট ও এক্সে-কোর অটোমেটেড টেস্টিং নিশ্চিত করে।",
      en: "Develops procedural ceramic shaders, interactive 2D/3D room preview engines, and comprehensive Playwright CI/CD test automation.",
    },
    focusArea: { bn: "ওয়েব গ্রাফিক্স, মোবাইল এআর ইন্টিগ্রেশন ও টেস্ট কভারেজ", en: "Web Graphics, Mobile AR Integration & Test Rigor" },
  },
  {
    name: { bn: "ইন্ডাস্ট্রি ও সাপ্লাই চেইন অ্যাডভাইজরি", en: "Industry & Supply Chain Advisory Board" },
    role: { bn: "কৌশলগত সিনিয়র উপদেষ্টা পরিষদ", en: "Senior Industry Advisory Board" },
    experience: { bn: "শীর্ষস্থানীয় সিরামিক ম্যানুফ্যাকচারার ও রিয়েল এস্টেট প্রকিউরমেন্ট", en: "Senior Executives from Ceramic Manufacturing & Real Estate Procurement" },
    bio: {
      bn: "বাংলাদেশের প্রধান প্রধান টাইলস উৎপাদনকারী ব্র্যান্ড ও আর্কিটেকচারাল ফার্মগুলোর সাথে স্ট্র্যাটেজিক টাই-আপ ও বিটুবি পলিসি নির্ধারণে দিকনির্দেশনা প্রদান করে।",
      en: "Provides strategic counsel on manufacturer integrations, wholesale pricing mechanisms, and large-scale contractor procurement.",
    },
    focusArea: { bn: "বিটুবি পলিসি, কর্পোরেট পার্টনারশিপ ও গ্রোথ স্ট্র্যাটেজি", en: "B2B Policy, Manufacturer Tie-Ups & Growth Roadmap" },
  },
];
