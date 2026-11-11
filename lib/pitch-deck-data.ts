export interface PitchStep {
  title: { bn: string; en: string };
  desc: { bn: string; en: string };
  metric?: string;
  badge?: { bn: string; en: string };
  iconName: string;
}

export interface PitchSlide {
  id: number;
  slug: string;
  transitionType:
    | "curtain"
    | "book"
    | "cube"
    | "portal"
    | "hinge"
    | "carousel"
    | "vault"
    | "blueprint"
    | "horizon"
    | "parallax"
    | "gallery"
    | "ascent";
  category: { bn: string; en: string };
  title: { bn: string; en: string };
  subtitle: { bn: string; en: string };
  speech: { bn: string; en: string };
  steps: PitchStep[];
  modalTrigger?: "modules" | "liveProduct" | "financials" | "leadership";
}

export const PITCH_DECK_SLIDES: PitchSlide[] = [
  {
    id: 1,
    slug: "cover",
    transitionType: "curtain",
    category: {
      bn: "এক্সিকিউটিভ প্রপোজাল ২০২৬",
      en: "Executive Proposal 2026",
    },
    title: {
      bn: "ডিজিটাইলস: বাংলাদেশের কনস্ট্রাকশন কমার্স ও সার্ভিসেস ইকোসিস্টেম",
      en: "DigiTiles: The Connected Construction Commerce Ecosystem",
    },
    subtitle: {
      bn: "টাইলস ও নির্মাণসামগ্রীর সনাতন কেনাকাটাকে একটি স্বচ্ছ, যাচাইকৃত এবং প্রযুক্তিচালিত ডিজিটাল প্ল্যাটফর্মে রূপান্তর।",
      en: "Transforming traditional material procurement into a transparent, verified, and technology-driven digital ecosystem for Bangladesh.",
    },
    speech: {
      bn: "সম্মানিত বিনিয়োগকারী এবং সহযোগীগণ, আমি খলিফা আহম্মেদ আল-আমিন, ডিজিটাইলসের প্রতিষ্ঠাতা ও প্রধান সিস্টেম আর্কিটেক্ট। বাংলাদেশে নির্মাণ খাতের বাজার ৩.২ বিলিয়ন ডলারের বেশি। অথচ এই বিশাল শিল্পের টাইলস ও স্যানিটারি সামগ্রী কেনাকাটার পুরো প্রক্রিয়াটি এখনো সনাতন, বিচ্ছিন্ন এবং অস্বচ্ছ। একজন ক্রেতাকে দোকানে দোকানে ঘুরে দাম জানতে হয়, মিস্ত্রির ওপর নির্ভর করতে হয়, আর ডিলাররা কোনো আধুনিক ডিজিটাল টুল পান না। এই পরিবর্তনের মুহূর্তে আমরা নিয়ে এসেছি ডিজিটাইলস। এটি কেবল একটি অনলাইন মার্কেটপ্লেস নয়; এটি ক্রেতা, যাচাইকৃত শোরুম ডিলার, পরিবহন এবং দক্ষ কারিগরদের এক সুসংগঠিত প্ল্যাটফর্মে যুক্ত করার একটি সমন্বিত ইকোসিস্টেম।",
      en: "Respected investors and partners, I am Kholipha Ahmmad Al-Amin, Founder and Lead Systems Architect of DigiTiles. In Bangladesh, the construction materials sector exceeds $3.2B annually. Yet procurement remains fragmented, manual, and opaque. Buyers visit multiple physical showrooms, rely on word of mouth for installers, and dealers lack structured digital tools. We are introducing DigiTiles: a connected digital ecosystem bringing together project buyers, verified showroom dealers, transport operators, and installation professionals on a single trusted platform.",
    },
    steps: [
      {
        title: {
          bn: "সফটওয়্যার-চালিত রূপান্তর",
          en: "Software-Driven Transformation",
        },
        desc: {
          bn: "অস্বচ্ছ অফলাইন মার্কেট থেকে স্ট্রাকচার্ড ডিজিটাল ক্যাটালগ ও স্টেট-মেশিন অর্ডারিং।",
          en: "Moving from unrecorded showroom deals to structured digital catalogues and state-machine order governance.",
        },
        metric: "100%",
        badge: { bn: "প্রোডাকশন-রেডি", en: "Production Ready" },
        iconName: "Layers",
      },
      {
        title: {
          bn: "জনমিতিক বিপ্লব ও বাজার প্রস্তুতি",
          en: "Demographic Shift & Market Readiness",
        },
        desc: {
          bn: "জনসংখ্যার ৬৬% কর্মক্ষম (১৫-৬৪ বছর), গড় বয়স ২৬ এবং ৭২.৪% স্মার্টফোন ব্যবহারকারী।",
          en: "66% working-age population (15-64), median age 26, and 72.4% smartphone adoption (UNFPA & BBS 2025).",
        },
        metric: "72.4%",
        badge: { bn: "ডিজিটাল চাহিদা", en: "Digital Demand" },
        iconName: "TrendingUp",
      },
      {
        title: {
          bn: "৩ স্তরের সমন্বিত ইকোসিস্টেম",
          en: "3-Pillar Unified Architecture",
        },
        desc: {
          bn: "যাচাইকৃত ক্যাটালগ, আনচেঞ্জেবল আরএফকিউ কোটেশন এবং ট্র্যাকড সাইট ডেলিভারি।",
          en: "Verified showroom discovery, immutable multi-dealer RFQs, and tracked site delivery fulfillment.",
        },
        metric: "3 Pillars",
        badge: { bn: "কোর আর্কিটেকচার", en: "Core Architecture" },
        iconName: "ShieldCheck",
      },
      {
        title: {
          bn: "ফাউন্ডার ও লিডারশিপ ট্র্যাক রেকর্ড",
          en: "Founder & Leadership Track Record",
        },
        desc: {
          bn: "খলিফা আহম্মেদ আল-আমিনের নেতৃত্বে হাই-পারফরম্যান্স এন্টারপ্রাইজ সিস্টেম ও প্রফেশনাল এক্সিকিউশন।",
          en: "Led by Kholipha Ahmmad Al-Amin with enterprise engineering precision and local market insight.",
        },
        metric: "Enterprise",
        badge: { bn: "ইকুইসাস বিডি", en: "EquiSaaS BD" },
        iconName: "Award",
      },
    ],
  },
  {
    id: 2,
    slug: "problem-opportunity",
    transitionType: "book",
    category: {
      bn: "বাজারের সমস্যা ও সুযোগ",
      en: "Problem & Market Opportunity",
    },
    title: {
      bn: "কেন সনাতন পদ্ধতি ভেঙে পড়ছে এবং কেন এখনই সঠিক সময়",
      en: "Why Traditional Procurement Is Failing & The Massive Opportunity",
    },
    subtitle: {
      bn: "বাংলাদেশের তরুণ প্রজন্ম এখন সবকিছু দ্রুত ও মোবাইলে চায়, কিন্তু নির্মাণ খাতের সাপ্লাই চেইন এখনো সনাতন যুগে আটকে রয়েছে।",
      en: "Bangladesh's young population demands transparent, mobile-first solutions, while construction commerce remains stuck in manual friction.",
    },
    speech: {
      bn: "বর্তমানে বাংলাদেশে একজন বাড়িওয়ালা বা ইঞ্জিনিয়ার যখন টাইলস কিনতে চান, তাকে হাতিরপুল বা বাংলামোটরের মতো জনাকীর্ণ বাজারে দিনের পর দিন ঘুরতে হয়। একেক দোকান একেক দাম চায়, কোনো লিখিত বা টেকনিক্যাল স্পেসিফিকেশন থাকে না, স্কয়ার ফিট থেকে কার্টুন হিসাব করতে অপচয় হয়, আর পণ্য পৌঁছানোর পর ভাঙা বা শেড পার্থক্যের কোনো প্রতিকার থাকে না। অন্যদিকে ডিলারদের হাজার হাজার ফলোয়ার সমৃদ্ধ ফেসবুক পেজ থাকলেও তাদের কোনো অটোমেটেড আরএফকিউ বা ইনভেন্টরি ম্যানেজমেন্ট টুল নেই। জাতিসংঘ জনসংখ্যা তহবিল (UNFPA) ও বাংলাদেশ পরিসংখ্যান ব্যুরোর (BBS) ২০২৫ সালের তথ্য অনুযায়ী, দেশের ৬৬% মানুষ কর্মক্ষম এবং ৭২.৪% ঘরে স্মার্টফোন রয়েছে। এই তরুণ প্রজন্ম আর মধ্যস্বত্বভোগীর ওপর নির্ভর করতে চায় না। ডিজিটাইলস এই সমস্যার একটি নিখুঁত প্রযুক্তিগত সমাধান এনেছে।",
      en: "Today, when a homeowner, architect, or contractor procures tiles in Bangladesh, they endure days navigating congested physical hubs like Hatirpool or Banglamotor. Prices vary arbitrarily without written quotes, calculating square feet into carton boxes results in costly wastage, and delivery damages offer zero recourse. Conversely, dealers with popular social pages have no automated RFQ or inventory tooling. Per UNFPA and BBS 2025 statistics, 66% of our population is working-age (median age 26) with 72.4% smartphone adoption. They demand transparent digital solutions. DigiTiles captures this massive economic inflection point.",
    },
    steps: [
      {
        title: {
          bn: "অস্বচ্ছ দাম ও স্পেক যাচাইয়ের ভোগান্তি",
          en: "Opaque Pricing & Spec Verification Friction",
        },
        desc: {
          bn: "কাগজের চিরকুট বা মুখে মুখে দাম বলায় ক্রেতা ঠকে যান; ওয়াটার অ্যাবসর্পশন বা পিইআই রেটিং বোঝার উপায় নেই।",
          en: "Verbal or scrap-paper quotes leave buyers vulnerable with zero verified water absorption or slip metrics.",
        },
        metric: "Zero Spec",
        badge: { bn: "বাস্তব সমস্যা", en: "Friction Point" },
        iconName: "AlertTriangle",
      },
      {
        title: {
          bn: "হিসাবের জটিলতা ও উপাদানের অপচয়",
          en: "Complex Calculations & Material Wastage",
        },
        desc: {
          bn: "রুমের মাপ থেকে কার্টুন ও ওয়েস্টেজ সঠিক হিসাব না করায় ১০% থেকে ১৫% অতিরিক্ত উপাদান অপচয় হয়।",
          en: "Inaccurate conversion from room area to carton boxes causes 10% to 15% material loss and rework.",
        },
        metric: "15% Waste",
        badge: { bn: "আর্থিক ক্ষতি", en: "Financial Loss" },
        iconName: "Percent",
      },
      {
        title: {
          bn: "ডিলারদের আধুনিক সফটওয়্যার সরঞ্জামের অভাব",
          en: "Dealers Lack Dedicated Enterprise Tools",
        },
        desc: {
          bn: "শোরুমগুলো সামাজিক মাধ্যমে ইনকোয়ারি পেলেও স্ট্রাকচার্ড কোটেশন ও ইনভেন্টরি পরিচালনা করতে পারে না।",
          en: "Showrooms receive buyer leads on social pages but lack structured quotation builders and batch tracking.",
        },
        metric: "Manual",
        badge: { bn: "সাপ্লাই সংকট", en: "Supply Bottleneck" },
        iconName: "Store",
      },
      {
        title: {
          bn: "তরুণ প্রজন্মের ডিজিটালাইজেশন চাহিদা",
          en: "The Demographic Digital Wave",
        },
        desc: {
          bn: "গড় বয়স ২৬ এবং ৭২.৪% স্মার্টফোন পরিবার সরাসরি মোবাইলেই তুলনা করে কিনতে চায়।",
          en: "Median age 26 and 72.4% smartphone penetration ready for instant comparison and digital checkout.",
        },
        metric: "66% Youth",
        badge: { bn: "বাজার সুযোগ", en: "Market Catalyst" },
        iconName: "Smartphone",
      },
    ],
  },
  {
    id: 3,
    slug: "core-solution",
    transitionType: "cube",
    category: {
      bn: "মূল সমাধান ও আর্কিটেকচার",
      en: "Core Solution & Architecture",
    },
    title: {
      bn: "৩টি শক্তিশালী স্তম্ভে গড়ে ওঠা ডিজিটাইলস আর্কিটেকচার",
      en: "The 3-Pillar Unified Solution Architecture",
    },
    subtitle: {
      bn: "মার্কেটপ্লেস ডিসকভারি, অপরিবর্তনীয় আরএফকিউ কোটেশন ইঞ্জিন এবং নিয়ন্ত্রিত ডেলিভারি স্টেট মেশিন।",
      en: "Marketplace discovery, immutable RFQ quotation engine, and state-machine-governed order fulfillment.",
    },
    speech: {
      bn: "ডিজিটাইলস সমাধানটিকে আমরা ৩টি শক্তিশালী স্তম্ভের ওপর দাঁড় করিয়েছি। প্রথম স্তম্ভ হলো যাচাইকৃত ক্যাটালগ ও রিয়েল-টাইম ভিজ্যুয়ালাইজার। যেখানে ক্রেতা আরএকে, আকিজ, শেলটেকসহ অনুমোদিত শোরুমের টাইলস টেকনিক্যাল স্পেসিফিকেশনসহ দেখতে পারেন এবং রুম ভিজ্যুয়ালাইজারে লে-আউট প্রিভিউ করতে পারেন। দ্বিতীয় স্তম্ভ হলো আমাদের মাল্টি-ডিলার আরএফকিউ ইঞ্জিন। এখানে মাত্র এক ক্লিকে ক্রেতা সঠিক কার্টুন সংখ্যা ও অপচয় হিসাব করে কোটেশন চাইতে পারেন এবং ডিলাররা আইটেমাইজড অপরিবর্তনীয় বিডিটি কোটেশন জমা দেন। তৃতীয় স্তম্ভ হলো সুরক্ষিত অর্ডার ও ডেলিভারি সমন্বয়। এখানে কোটেশন গৃহীত হওয়া মাত্র সিস্টেম স্বয়ংক্রিয়ভাবে একটি ফ্রোজেন বাণিজ্যিক স্ন্যাপশট তৈরি করে এবং ৮-ধাপের স্টেট মেশিনে ডেলিভারি সম্পন্ন করে।",
      en: "Our solution is anchored on three foundational pillars. Pillar 1: Verified Showroom Discovery and Real-time Surface Visualizer, allowing buyers to inspect certified listings from top brands with technical specifications. Pillar 2: Multi-Dealer RFQ and Immutable Quotation Engine, where buyers convert room dimensions into carton quantities with wastage tolerance and receive binding itemized BDT quotes. Pillar 3: Guaranteed Order Lifecycle and Delivery Coordination, creating a frozen commercial price snapshot upon quote acceptance and governing dispatch through an 8-state machine with dispute safety.",
    },
    steps: [
      {
        title: {
          bn: "স্তম্ভ ১: যাচাইকৃত ক্যাটালগ ও প্রসিডিউরাল সোয়াচ",
          en: "Pillar 1: Verified Showroom & Swatch Discovery",
        },
        desc: {
          bn: "ট্রেড লাইসেন্স ও টিআইএন যাচাইকৃত শোরুমের সঠিক স্পেসিফিকেশন, ফিনিশ ও পিইআই রেটিং।",
          en: "Verified showroom catalogue with technical specs, procedural swatches, and PEI wear ratings.",
        },
        metric: "Verified",
        badge: { bn: "বিশ্বাসযোগ্যতা", en: "Trust Engine" },
        iconName: "CheckCircle2",
      },
      {
        title: {
          bn: "স্তম্ভ ২: আরএফকিউ ও অপরিবর্তনীয় কোটেশন",
          en: "Pillar 2: Immutable RFQ & Quotation Engine",
        },
        desc: {
          bn: "রুম এরিয়া ও কার্টুন হিসাবের পর ডিলারদের আইটেমাইজড কোটেশন পাশাপাশি তুলনা ও গ্রহণ।",
          en: "Itemized multi-dealer BDT quotations compared side-by-side with atomic acceptance.",
        },
        metric: "Atomic",
        badge: { bn: "স্বচ্ছ মূল্য", en: "Price Lock" },
        iconName: "FileSpreadsheet",
      },
      {
        title: {
          bn: "স্তম্ভ ৩: সুরক্ষিত ডেলিভারি স্টেট মেশিন",
          en: "Pillar 3: Guarded 8-State Order Lifecycle",
        },
        desc: {
          bn: "পেন্ডিং থেকে কনফার্মড, ওয়্যারহাউস প্রিপারেশন, পিকআপ ও সাইট ডেলিভারির সুরক্ষিত ট্র্যাকিং।",
          en: "Tracked from confirmation to warehouse prep, vehicle dispatch, site delivery, and completion.",
        },
        metric: "8 States",
        badge: { bn: "ফুলফিলমেন্ট", en: "Fulfillment" },
        iconName: "Truck",
      },
      {
        title: {
          bn: "অ্যাডমিন সুপারভিশন ও অডিট ট্রেইল",
          en: "Platform Governance & Audit Trail",
        },
        desc: {
          bn: "প্রতিটি কোটেশন ও অর্ডারের জন্য অপরিবর্তনীয় অডিট লগ এবং সক্রিয় বিরোধ নিষ্পত্তি ব্যবস্থা।",
          en: "Every transaction, moderation action, and status change is logged into an immutable audit trail.",
        },
        metric: "Audited",
        badge: { bn: "সুশাসন", en: "Governance" },
        iconName: "Lock",
      },
    ],
  },
  {
    id: 4,
    slug: "modules-deep-dive",
    transitionType: "portal",
    category: {
      bn: "প্ল্যাটফর্ম মডিউলসমূহ",
      en: "Platform Modules Deep-Dive",
    },
    title: {
      bn: "১৫টি স্বয়ংসম্পূর্ণ মডিউল ও কার্যকর ওয়ার্কস্পেস",
      en: "15 Enterprise Modules & Dedicated Role Workspaces",
    },
    subtitle: {
      bn: "ক্রেতা, ডিলার ও অ্যাডমিন প্রত্যেকের জন্য রোল-বেসড নিয়ন্ত্রিত ইন্টারফেস এবং এন্টারপ্রাইজ লজিক।",
      en: "Role-scoped interfaces and enterprise business logic tailored for Customers, Dealers, and Platform Administrators.",
    },
    speech: {
      bn: "ডিজিটাইলসের প্রতিটি ফিচার আমরা সুনির্দিষ্ট ১৫টি ফাংশনাল রিকোয়ারমেন্টস (Core Standard থেকে Core Standard) এবং ১৫টি ইউজার স্ক্রিনে সাজিয়েছি। ক্রেতারা তাদের সেভ করা সাইট অ্যাড্রেস ম্যানেজ করতে পারেন এবং যে কোনো টাইলসের জন্য অপচয়সহ সঠিক কার্টুন হিসাব বের করতে পারেন। ডিলাররা তাদের মাল্টি-ব্রাঞ্চ শোরুম পরিচালনা করেন, সেলস স্টাফদের নির্দিষ্ট রোল বরাদ্দ করেন, এবং আগত আরএফকিউতে স্বচ্ছ ডেলিভারি চার্জসহ বিডিটি কোটেশন পাঠান। অ্যাডমিন প্যানেলে রয়েছে ডিলার ভেরিফিকেশন কিউ এবং ক্যাটালগ মডারেশন গেট। প্রতিটি মডিউল একে অপরের সাথে মডুলার মনোলিথ আর্কিটেকচারে যুক্ত, যা সর্বোচ্চ পারফরম্যান্স এবং ডেটা সিকিউরিটি নিশ্চিত করে।",
      en: "Every DigiTiles capability is mapped into 15 Functional Requirements (Full B2B2C Workflow) across 15 dedicated screens. Customers manage construction site delivery addresses and calculate accurate carton requirements with wastage. Dealers manage multi-branch showrooms, assign role-scoped staff permissions, and submit itemized BDT quotes with transport fees. The Platform Admin oversees dealer verification queues, listing moderation, and dispute resolution. Each module runs on a modular monolith with strict tenant isolation and zero data leakage.",
    },
    steps: [
      {
        title: {
          bn: "ক্রেতা ওয়ার্কস্পেস (Live Module to 07)",
          en: "Customer Hub (Live Module to 07)",
        },
        desc: {
          bn: "আরএফকিউ জমা, একাধিক শোরুমের কোটেশন তুলনা, অর্ডার ট্র্যাকিং ও বিরোধ উত্থাপন।",
          en: "Submit RFQs, compare showroom offers, track order milestones, and file resolution requests.",
        },
        metric: "SCR 05-07",
        badge: { bn: "ক্রেতা সুবিধা", en: "Customer UI" },
        iconName: "User",
      },
      {
        title: {
          bn: "ডিলার পোর্টাল (Live Module to 12)",
          en: "Dealer Portal (Live Module to 12)",
        },
        desc: {
          bn: "মাল্টি-ব্রাঞ্চ শোরুম, স্টাফ আরবিক, ক্যাটালগ সিআরইউডি, কোটেশন বিল্ডার ও ডেলিভারি লগ।",
          en: "Multi-branch setup, staff RBAC, catalogue inventory, quotation builder, and dispatch.",
        },
        metric: "SCR 08-12",
        badge: { bn: "ডিলার টুলস", en: "Dealer Hub" },
        iconName: "Building2",
      },
      {
        title: {
          bn: "অ্যাডমিন গভর্ন্যান্স কনসোল (Live Module to 15)",
          en: "Admin Console (Live Module to 15)",
        },
        desc: {
          bn: "ট্রেড লাইসেন্স ভেরিফিকেশন, ক্যাটালগ অনুমোদন, অর্ডার মনিটরিং ও অপরিবর্তনীয় অডিট লগ।",
          en: "Trade credential verification, catalogue moderation, dispute resolution, and audit logs.",
        },
        metric: "SCR 13-15",
        badge: { bn: "নিরাপত্তা", en: "Oversight" },
        iconName: "ShieldAlert",
      },
      {
        title: {
          bn: "সার্ভিসেস ও ট্রান্সপোর্ট ডিরেক্টরি",
          en: "Services & Transport Directory",
        },
        desc: {
          bn: "ভেরিফায়েড টাইলস মিস্ত্রি টিম নির্বাচন এবং ১-টন থেকে ৭-টন ট্রাক ট্রান্সপোর্ট প্রাক্কলন।",
          en: "Verified tile installation crews and transparent truck transport fare estimation by district.",
        },
        metric: "Ecosystem",
        badge: { bn: "কানেক্টেড ভ্যালু", en: "Services Hub" },
        iconName: "Truck",
      },
    ],
    modalTrigger: "modules",
  },
  {
    id: 5,
    slug: "live-showcase",
    transitionType: "hinge",
    category: {
      bn: "সচল সফটওয়্যার ও বাস্তব প্রমাণ",
      en: "Live Product & Proof of Work",
    },
    title: {
      bn: "সম্পূর্ণ কার্যক্ষম লাইভ প্ল্যাটফর্ম ও টেকনিক্যাল পারফরম্যান্স",
      en: "Production-Ready Live Product & Technical Validation",
    },
    subtitle: {
      bn: "কাগজের পরিকল্পনা নয়; নেক্সট.জেএস ১৪, টাইপস্ক্রিপ্ট এবং প্লেরাইট অডিট সম্পন্ন সচল প্ল্যাটফর্ম।",
      en: "Not a prototype concept, but a live, tested Next.js 14 full-stack platform verified with Playwright & Axe-core.",
    },
    speech: {
      bn: "আমরা কোনো ধারণামূলক প্রেজেন্টেশন দেখাচ্ছি না; আমাদের সম্পূর্ণ সফটওয়্যারটি বর্তমানে লাইভ এবং সম্পূর্ণ সচল। আপনারা সরাসরি ডিজিটাইলসে প্রবেশ করে যে কোনো টাইলসের বিস্তারিত স্পেসিফিকেশন দেখতে পারেন, আমাদের ইন্টারেক্টিভ রুম ভিজ্যুয়ালাইজারে বিভিন্ন লেইং প্যাটার্নে ও গ্রাউট রঙে প্রিভিউ করতে পারেন এবং এক ক্লিকে আরএফকিউ কোটেশন তৈরি করতে পারেন। সিস্টেমটিতে ফোন ওটিপি লগইনের পাশাপাশি ডেমো রোল সুইচার যুক্ত রয়েছে, যার ফলে বিনিয়োগকারী বা জাজেসগণ তাৎক্ষণিকভাবে ক্রেতা, ভেরিফায়েড ডিলার বা প্ল্যাটফর্ম অ্যাডমিন হিসেবে সমস্ত কার্যপদ্ধতি পরখ করতে পারেন। আমাদের কোডবেস ডার্ক ও লাইট উভয় মোডে WCAG 2.1 AA অ্যাক্সেসিবিলিটি মানদণ্ডে শতভাগ উত্তীর্ণ।",
      en: "We are presenting a fully functional, production-ready software system. You can explore DigiTiles live today: test faceted catalogue filtering, preview tiles in our interactive 2D/3D Room Visualizer across multiple laying patterns and grout joints, calculate exact box quantities with wastage tolerances, and simulate quote submissions. With our Instant Pilot Role Switcher, investors and evaluators can immediately test the platform as a Customer, a Verified Dealer, or a Platform Administrator. Our codebase passes automated Playwright E2E suites and WCAG 2.1 AA accessibility audits with zero violations in both Light and Dark modes.",
    },
    steps: [
      {
        title: {
          bn: "ইন্টারেক্টিভ রুম ও সারফেস ভিজ্যুয়ালাইজার",
          en: "Interactive Room & Surface Visualizer",
        },
        desc: {
          bn: "লিভিং রুম, বাথরুম বা কিচেনে স্ট্রেইট গ্রিড, হেরিংবোন বা ব্রিক প্যাটার্নে লাইভ প্রিভিউ।",
          en: "Real-time layout simulation across straight grid, brick bond, herringbone, and custom grout colors.",
        },
        metric: "Live 3D",
        badge: { bn: "ইনোভেশন", en: "Visualizer" },
        iconName: "Box",
      },
      {
        title: {
          bn: "অটোমেটেড এরিয়া ও কার্টুন ক্যালকুলেটর",
          en: "Automated Box & Area Calculator",
        },
        desc: {
          bn: "দৈর্ঘ্য ও প্রস্থ ইনপুট করলেই ওয়েস্টেজ সহ মোট টাইলস, কার্টুন ও আনুমানিক বিডিটি মূল্য প্রস্তুত।",
          en: "Converts room dimensions and wastage percentage into carton counts and landed BDT costs.",
        },
        metric: "Precision",
        badge: { bn: "স্মার্ট ইউটিলিটি", en: "Calculator" },
        iconName: "Calculator",
      },
      {
        title: {
          bn: "ইনস্ট্যান্ট পাইলট রোল সুইচার",
          en: "Instant Pilot Role Switcher",
        },
        desc: {
          bn: "কোনো পাসওয়ার্ডের ঝামেলা ছাড়াই এক ক্লিকে তানভীর, মাহমুদুল হাসান বা অ্যাডমিন রোলে সুইচ।",
          en: "One-click switching between Customer, Verified Dealer, and Admin personas for live demos.",
        },
        metric: "Instant",
        badge: { bn: "টেস্টিং টুল", en: "Persona Engine" },
        iconName: "UserCheck",
      },
      {
        title: {
          bn: "প্লেরাইট ও অ্যাক্সেসিবিলিটি অডিট উত্তীর্ণ",
          en: "Playwright E2E & WCAG 2.1 AA Certified",
        },
        desc: {
          bn: "লাইট ও ডার্ক মোডে সম্পূর্ণ কনসোল এরর-মুক্ত এবং নিখুঁত কনট্রাস্ট রেশিও নিশ্চিত।",
          en: "Passed all end-to-end integration tests and Axe-core WCAG 2.1 AA contrast audits.",
        },
        metric: "100% Pass",
        badge: { bn: "কোয়ালিটি গেট", en: "Verified Code" },
        iconName: "CheckCircle",
      },
    ],
    modalTrigger: "liveProduct",
  },
  {
    id: 6,
    slug: "business-model",
    transitionType: "carousel",
    category: {
      bn: "বিজনেস মডেল ও প্রবৃদ্ধি",
      en: "Business Model & Financials",
    },
    title: {
      bn: "সুনির্দিষ্ট আয়ের উৎস ও ৩টি টেকসই প্রবৃদ্ধি সিনারিও",
      en: "Clear Revenue Streams & 3 Scalable Financial Scenarios",
    },
    subtitle: {
      bn: "ট্রানজ্যাকশন টেক-রেট, ডিলার প্রিমিয়াম সাবস্ক্রিপশন এবং পরিবহন সার্ভিস সমন্বয় ফি।",
      en: "Diversified revenue anchored on transaction commissions, verified showroom SaaS, and logistics coordination.",
    },
    speech: {
      bn: "ডিজিটাইলসের বিজনেস মডেল অত্যন্ত বাস্তবমুখী এবং বহুস্তরীয়। আমাদের প্রথম আয়ের উৎস হলো সফলভাবে ডেলিভারি সম্পন্ন অর্ডারের ওপর ১.৫% থেকে ৩% প্ল্যাটফর্ম ট্রানজ্যাকশন কমিশন। গড়ে প্রতিটি মাঝারি নির্মাণ অর্ডারে ৫০ হাজার থেকে ৩ লাখ টাকার টাইলস প্রয়োজন হয়, যা থেকে তাৎক্ষণিক মার্জিন তৈরি হয়। দ্বিতীয়ত, ভেরিফায়েড শোরুমগুলোর জন্য আমাদের রয়েছে 'ডিজিটাইলস প্রো' সাবস্ক্রিপশন, যার ফি মাসিক ৪,৫০০ টাকা। এর মাধ্যমে ডিলাররা লিড ম্যানেজমেন্ট, ব্যাচ-শেড ইনভেন্টরি ট্র্যাকিং এবং প্রায়োরিটি আরএফকিউ অ্যাক্সেস পান। তৃতীয়ত, ট্রান্সপোর্ট সমন্বয় থেকে বুকিং প্রতি ২৫০ থেকে ৫০০ টাকা রাজস্ব আসে। প্রথম ৩ বছরে কনজারভেটিভ মডেলে ১৪.৮ মিলিয়ন টাকা, রিয়ালিস্টিক মডেলে ৫৪.২ মিলিয়ন টাকা এবং অ্যাগ্রেসিভ মডেলে ১৭৮ মিলিয়ন টাকা গ্রস রেভিনিউ লক্ষ্যমাত্রা নির্ধারণ করা হয়েছে।",
      en: "Our business model is high-margin, multi-tiered, and backed by strong unit economics. Stream 1: A 1.5% to 3.0% transaction commission on fulfilled construction orders. Average residential tile orders range from BDT 50,000 to BDT 300,000, generating strong transactional gross margins. Stream 2: DigiTiles Pro Showroom Subscription at BDT 4,500/month per branch, providing priority RFQ routing, batch/shade inventory ledgers, and analytics. Stream 3: Logistics coordination commissions of BDT 250 to 500 per transport booking. Over 36 months, our financial scenarios project BDT 14.8M (Conservative), BDT 54.2M (Realistic), and BDT 178M (Aggressive) in annual gross platform revenue.",
    },
    steps: [
      {
        title: {
          bn: "ট্রানজ্যাকশন টেক-রেট কমিশন",
          en: "Transaction Take-Rate Commission",
        },
        desc: {
          bn: "সফলভাবে ডেলিভারি সম্পন্ন প্রতিটি অর্ডারের মোট মূল্যের ওপর ১.৫% থেকে ৩% প্ল্যাটফর্ম ফি।",
          en: "1.5% to 3.0% platform fee charged on successfully fulfilled commercial material orders.",
        },
        metric: "1.5-3.0%",
        badge: { bn: "মার্কেটপ্লেস ফি", en: "Core GMV" },
        iconName: "Receipt",
      },
      {
        title: {
          bn: "ডিজিটাইলস প্রো ডিলার সাবস্ক্রিপশন",
          en: "DigiTiles Pro Showroom Subscription",
        },
        desc: {
          bn: "প্রতি ব্রাঞ্চে মাসিক ৪,৫০০ টাকা ফিতে ভেরিফায়েড ব্যাজ, প্রায়োরিটি লিড ও স্টক অ্যানালিটিক্স।",
          en: "BDT 4,500/month per branch for verified trust badge, advanced analytics, and priority RFQs.",
        },
        metric: "BDT 4.5K",
        badge: { bn: "সাস আয়", en: "SaaS MRR" },
        iconName: "TrendingUp",
      },
      {
        title: {
          bn: "লজিস্টিকস ও পরিবহন সমন্বয় ফি",
          en: "Logistics Coordination Fee",
        },
        desc: {
          bn: "ডেলিভারি ট্রাক বা পিকআপের সাথে ডিলার ও ক্রেতার সংযোগে ২৫০ থেকে ৫০০ টাকা সমন্বয় ফি।",
          en: "BDT 250 to 500 per dispatch booking connecting verified transport fleets with site deliveries.",
        },
        metric: "BDT 250+",
        badge: { bn: "সার্ভিস ফি", en: "Logistics" },
        iconName: "Truck",
      },
      {
        title: {
          bn: "বাস্তবসম্মত প্রবৃদ্ধি লক্ষ্যমাত্রা (Yr 2)",
          en: "Realistic Growth Projection (Year 2)",
        },
        desc: {
          bn: "৪৫০টি ভেরিফায়েড শোরুম ও ১৬,৫০০ অর্ডারে বার্ষিক ৫৪.২ মিলিয়ন বিডিটি রাজস্ব পূর্বাভাস।",
          en: "450 verified dealers and 16,500 orders generating BDT 54.2M in annual revenue.",
        },
        metric: "BDT 54.2M",
        badge: { bn: "স্কেলিং টার্গেট", en: "Forecast" },
        iconName: "BarChart3",
      },
    ],
    modalTrigger: "financials",
  },
  {
    id: 7,
    slug: "strategic-ask",
    transitionType: "vault",
    category: {
      bn: "কৌশলগত প্রস্তাব ও তহবিল",
      en: "Strategic Ask & Capital Proposal",
    },
    title: {
      bn: "২৫ মিলিয়ন বিডিটি সীড পার্টনারশিপ ও তহবিল বরাদ্দ পরিকল্পনা",
      en: "BDT 25M Strategic Seed Partnership & Capital Allocation",
    },
    subtitle: {
      bn: "পরবর্তী ১৮ মাসের মধ্যে ঢাকা, চট্টগ্রাম ও সিলেটের মূল বাণিজ্যিক হাবগুলোতে দ্রুত বিস্তার ও প্রবৃদ্ধি।",
      en: "Accelerating dealer onboarding, 3D visualizer R&D, and logistics infrastructure across major commercial divisions.",
    },
    speech: {
      bn: "আমরা কৌশলগত বিনিয়োগকারী এবং ইন্ডাস্ট্রি পার্টনারদের কাছ থেকে ২৫ মিলিয়ন বাংলাদেশি টাকা (প্রায় ২ লাখ ২৫ হাজার মার্কিন ডলার) সীড ক্যাপিটাল বা সমমূল্যের স্ট্র্যাটেজিক পার্টনারশিপ আহ্বান করছি। এই তহবিল অত্যন্ত হিসাবি এবং সুনির্দিষ্ট চারটি খাতে বরাদ্দ থাকবে। ৪২% অর্থ যাবে ইঞ্জিনিয়ারিং ও ৩ডি অগমেন্টেড রিয়েলিটি ভিজ্যুয়ালাইজারের উন্নয়নে, যাতে গ্রাহকরা মোবাইলের ক্যামেরা দিয়ে তাদের নিজের ঘরের মেঝেতে টাইলস দেখতে পারেন। ২৮% অর্থ ব্যয় হবে হাতিরপুল, উত্তরা এবং চট্টগ্রামের আগ্রাবাদে ফিল্ড অনবোর্ডিং ও শোরুম ভেরিফিকেশন হাব স্থাপনে। ১৮% ব্যয় হবে পরিবহন ও কারিগর নেটওয়ার্কের সমন্বয়ে এবং অবশিষ্ট ১২% অর্থ রেগুলেটরি কমপ্লায়েন্স ও রিজার্ভ ফান্ড হিসেবে রাখা হবে।",
      en: "We are seeking BDT 25,000,000 (approximately $225,000 USD) in strategic seed capital or equivalent institutional partnership to fund our 18-month expansion. Capital allocation is strictly disciplined across four operational buckets: 42% dedicated to Engineering and 3D Augmented Reality R&D, enabling camera-based room surface visualizers; 28% for Field Dealer Onboarding Hubs in Hatirpool, Uttara, and Chittagong; 18% for Logistics Fleet Integrations and Contractor Network Operations; and 12% for Legal Compliance, Working Capital, and Contingency Reserves.",
    },
    steps: [
      {
        title: {
          bn: "ইঞ্জিনিয়ারিং ও ৩ডি এআর আরঅ্যান্ডডি (৪২%)",
          en: "Engineering & 3D AR Visualizer R&D (42%)",
        },
        desc: {
          bn: "রিয়েল-টাইম মোবাইল ক্যামেরা সারফেস ট্র্যাকিং, নেটিভ অ্যাপ ও এআই ড্রাইভেন সাজেস্ট ইঞ্জিন।",
          en: "Camera-based AR surface projection, native iOS/Android engines, and automated spec matching.",
        },
        metric: "BDT 10.5M",
        badge: { bn: "প্রযুক্তি উন্নয়ন", en: "Tech R&D" },
        iconName: "Cpu",
      },
      {
        title: {
          bn: "শোরুম অনবোর্ডিং ও ভেরিফিকেশন হাব (২৮%)",
          en: "Dealer Onboarding & Verification Hubs (28%)",
        },
        desc: {
          bn: "হাতিরপুল, উত্তরা ও আগ্রাবাদে অন-সাইট যাচাইকরণ টিম ও শোরুম ট্রেনিং প্রোগ্রাম।",
          en: "Physical onboarding operations in Hatirpool, Uttara, and Agrabad with KYC audits.",
        },
        metric: "BDT 7.0M",
        badge: { bn: "ফিল্ড অপারেশন", en: "Showrooms" },
        iconName: "Store",
      },
      {
        title: {
          bn: "পরিবহন ও মিস্ত্রি নেটওয়ার্ক সমন্বয় (১৮%)",
          en: "Transport & Installer Coordination (18%)",
        },
        desc: {
          bn: "পিকআপ/ট্রাক ড্রাইভার পার্টনারশিপ, ফিক্সড রেট চার্ট ও মিস্ত্রি সার্টিফিকেশন পলিসি।",
          en: "Dedicated vehicle dispatch coordination, fixed transparent tariff grids, and installer vetting.",
        },
        metric: "BDT 4.5M",
        badge: { bn: "সাপ্লাই চেইন", en: "Logistics" },
        iconName: "Truck",
      },
      {
        title: {
          bn: "কমপ্লায়েন্স, ওয়ার্কিং ক্যাপিটাল ও রিজার্ভ (১২%)",
          en: "Compliance, Working Capital & Reserves (12%)",
        },
        desc: {
          bn: "আইনি পরামর্শ, পেমেন্ট এসক্রো ইন্টিগ্রেশন এবং আপৎকালীন অপারেশনাল রিজার্ভ।",
          en: "Corporate compliance, legal escrow framework, operational security, and contingency.",
        },
        metric: "BDT 3.0M",
        badge: { bn: "নিরাপত্তা তহবিল", en: "Reserves" },
        iconName: "ShieldCheck",
      },
    ],
  },
  {
    id: 8,
    slug: "execution-plan",
    transitionType: "blueprint",
    category: {
      bn: "বাস্তবায়ন ও অবকাঠামো",
      en: "Execution & Infrastructure Plan",
    },
    title: {
      bn: "স্কেলেবল প্রযুক্তি অবকাঠামো ও মাঠপর্যায়ের বাস্তবায়ন রূপরেখা",
      en: "Scalable Tech Architecture & Operational Execution",
    },
    subtitle: {
      bn: "মডুলার মনোলিথ, ট্রানজ্যাকশনাল স্টোর ইঞ্জিন এবং ঢাকা-চট্টগ্রামের পাইপলাইন পাইলট।",
      en: "Modular monolith design, transactional store engine, and disciplined field deployment across key construction hubs.",
    },
    speech: {
      bn: "আমাদের বাস্তবায়ন কৌশল প্রযুক্তি এবং মাঠপর্যায়ের অপারেশনস, উভয় দিকেই সমান ভারসাম্যপূর্ণ। টেকনিক্যাল দিক থেকে আমরা একটি মডুলার মনোলিথ আর্কিটেকচার বেছে নিয়েছি, যা মাইক্রোসার্ভিসের অতিরিক্ত জটিলতা এড়িয়ে অত্যন্ত দ্রুত রিলিজ এবং নিখুঁত ডেটা কনসিস্টেন্সি নিশ্চিত করে। আমাদের ডেটাবেসে রয়েছে কঠোর টেন্যান্ট আইসোলেশন, যাতে ডিলার ক কখনোই ডিলার খ-এর কোটেশন বা ব্যবসায়িক তথ্য দেখতে না পারেন। মাঠপর্যায়ে আমরা শুরু করছি ঢাকার প্রধান দুটি টাইলস মার্কেট: হাতিরপুল এবং উত্তরা দিয়ে। এরপর খুব দ্রুত চট্টগ্রামের আগ্রাবাদ এবং সিলেটের আম্বরখানায় আমাদের ভেরিফিকেশন টিম কাজ শুরু করবে। প্রতিটি শোরুমকে অনবোর্ডিং করার সময় তাদের ট্রেড লাইসেন্স ও শোরুমের অস্তিত্ব স্বয়ং সরেজমিনে যাচাই করা হবে।",
      en: "Our execution model balances robust software architecture with agile field execution. Architecturally, we implemented a modular monolith that avoids the premature latency and operational costs of microservices while enforcing clean domain separation. Multi-tenant data isolation strictly prevents competitor dealers from viewing each other's quotes or buyer inquiries. Operationally, execution kicks off across Dhaka's two highest-density tile hubs: Hatirpool and Uttara, quickly expanding to Agrabad, Chattogram and Amberkhana, Sylhet. Every dealer onboarding includes on-site KYC validation of physical premises and trade credentials.",
    },
    steps: [
      {
        title: {
          bn: "মডুলার মনোলিথ টেকনিক্যাল স্ট্যাক",
          en: "Modular Monolith Tech Stack",
        },
        desc: {
          bn: "নেক্সট.জেএস ১৪ অ্যাপ রাউটার, টাইপস্ক্রিপ্ট, প্রিজমা স্কিমা ও এজ ক্যাশিং।",
          en: "Next.js 14 App Router, TypeScript, Prisma Schema, Edge routing, and zero overhead.",
        },
        metric: "Sub-50ms",
        badge: { bn: "হাই স্পিড", en: "Edge Architecture" },
        iconName: "Server",
      },
      {
        title: {
          bn: "কঠোর টেন্যান্ট ও ডেটা আইসোলেশন",
          en: "Strict Multi-Tenant Isolation",
        },
        desc: {
          bn: "কোনো ডিলার অন্য প্রতিদ্বন্দ্বী ডিলারের আরএফকিউ, দাম বা ক্রেতার তথ্য দেখতে পায় না।",
          en: "No cross-tenant data leakage between competing showrooms, quotations, or customer sites.",
        },
        metric: "100% Isolated",
        badge: { bn: "নিরাপত্তা", en: "Data Guard" },
        iconName: "Shield",
      },
      {
        title: {
          bn: "হাতিরপুল ও উত্তরা পাইলট ফুটপ্রিন্ট",
          en: "Hatirpool & Uttara Pilot Hubs",
        },
        desc: {
          bn: "প্রথম ৬০ দিনে ৫০টি ফ্ল্যাগশিপ শোরুম ও ২০০ জন সক্রিয় ক্রেতাকে যুক্ত করার টার্গেট।",
          en: "Targeting 50 flagship showrooms and 200 active project buyers in the first 60 days.",
        },
        metric: "50 Showrooms",
        badge: { bn: "পাইলট হাব", en: "Local Hubs" },
        iconName: "MapPin",
      },
      {
        title: {
          bn: "কোয়ালিটি নিশ্চয়তা ও অটোমেটেড টেস্ট",
          en: "Continuous Automated Verification",
        },
        desc: {
          bn: "প্রতিটি ডেপ্লয়মেন্টের আগে অটোমেটেড প্লেরাইট টেস্ট এবং বিল্ড ভেরিফিকেশন গেট।",
          en: "Automated Playwright CI verification and zero-downtime single-commit deployment pipeline.",
        },
        metric: "Zero Defect",
        badge: { bn: "টেস্টিং", en: "CI/CD Pipeline" },
        iconName: "Terminal",
      },
    ],
  },
  {
    id: 9,
    slug: "milestones-roadmap",
    transitionType: "horizon",
    category: {
      bn: "১২ মাসের রোডম্যাপ",
      en: "12-Month Milestone Roadmap",
    },
    title: {
      bn: "পরবর্তী ৪টি কোয়ার্টারের সুনির্দিষ্ট মাইলস্টোন ও ডেলিভারেবলস",
      en: "12-Month Roadmap Across 4 Disciplined Quarters",
    },
    subtitle: {
      bn: "পাইলট ভ্যালিডেশন থেকে শুরু করে লজিস্টিকস ইন্টিগ্রেশন, দেশব্যাপী বিস্তার ও এন্টারপ্রাইজ স্কেলিং।",
      en: "From Dhaka metro pilot validation to integrated transport, national rollout, and enterprise contractor suites.",
    },
    speech: {
      bn: "আমাদের আগামী ১২ মাসের রোডম্যাপটি অত্যন্ত সুশৃঙ্খল এবং পরিমাপযোগ্য মাইলস্টোনে বিভক্ত। প্রথম কোয়ার্টারে (Q1) আমাদের লক্ষ্য ঢাকা মেট্রো অঞ্চলে ৫০টি ভেরিফায়েড শোরুম অনবোর্ড করা এবং প্রথম ৫০০টি বাণিজ্যিক আরএফকিউ সফলভাবে সম্পন্ন করা। দ্বিতীয় কোয়ার্টারে (Q2) আমরা যুক্ত করব সার্টিফায়েড মিস্ত্রি ও পরিবহন সেবা, যেখানে গ্রাহকরা টাইলস কেনার সাথে সাথেই পরিবহন বুক করতে পারবেন। তৃতীয় কোয়ার্টারে (Q3) আমরা চট্টগ্রাম, সিলেট ও রাজশাহীতে বিস্তার করব এবং ৩০০টির বেশি শোরুমকে নেটওয়ার্কে নিয়ে আসব। চতুর্থ কোয়ার্টারে (Q4) আমাদের মোবাইল অ্যাপ এবং ৩ডি অগমেন্টেড রিয়েলিটি ভিজ্যুয়ালাইজারের পূর্ণাঙ্গ রিলিজের মাধ্যমে মাসিক লেনদেন ৫ কোটিতে উন্নীত করার লক্ষ্য রয়েছে।",
      en: "Our 12-month execution roadmap follows four disciplined quarterly phases. Q1 focuses on validating the Dhaka Metro pilot with 50 verified showrooms and fulfilling our first 500 digital RFQs. Q2 integrates our verified installation and transport directory, enabling one-click vehicle booking. Q3 scales the ecosystem to Chattogram, Sylhet, and Rajshahi, onboarding 300+ showrooms. Q4 delivers our production mobile apps and 3D Augmented Reality Room Visualizer, scaling monthly gross platform transactions past BDT 50 million.",
    },
    steps: [
      {
        title: {
          bn: "কোয়ার্টার ১: ঢাকা পাইলট ও কোটেশন ইঞ্জিন",
          en: "Quarter 1: Dhaka Metro Pilot & RFQ Engine",
        },
        desc: {
          bn: "হাতিরপুল ও উত্তরায় ৫০টি শোরুম অনবোর্ডিং এবং ৫০০টি সফল আরএফকিউ ট্রানজ্যাকশন।",
          en: "Onboard 50 flagship showrooms and validate 500 completed RFQ quotation lifecycles.",
        },
        metric: "Q1 Milestone",
        badge: { bn: "পাইলট", en: "Dhaka Launch" },
        iconName: "Target",
      },
      {
        title: {
          bn: "কোয়ার্টার ২: ট্রান্সপোর্ট ও মিস্ত্রি ডিরেক্টরি",
          en: "Quarter 2: Logistics & Mistri Integration",
        },
        desc: {
          bn: "১০০ জন সার্টিফায়েড কারিগর এবং ১৫০টি পিকআপ/ট্রাকের রেট-কার্ড যুক্তকরণ।",
          en: "Deploy verified installer directory and transparent transport fare booking across Dhaka.",
        },
        metric: "Q2 Milestone",
        badge: { bn: "সার্ভিস লেয়ার", en: "Services Expansion" },
        iconName: "Truck",
      },
      {
        title: {
          bn: "কোয়ার্টার ৩: দেশব্যাপী আঞ্চলিক বিস্তার",
          en: "Quarter 3: Divisional Nationwide Rollout",
        },
        desc: {
          bn: "চট্টগ্রাম, সিলেট ও রাজশাহীতে হাব স্থাপন এবং ৩০০টি ভেরিফায়েড শোরুমের নেটওয়ার্ক।",
          en: "Establish regional hubs in Chattogram and Sylhet, reaching 300+ verified showrooms.",
        },
        metric: "Q3 Milestone",
        badge: { bn: "স্কেলিং", en: "Divisional Expansion" },
        iconName: "Globe",
      },
      {
        title: {
          bn: "কোয়ার্টার ৪: ৩ডি এআর ইঞ্জিন ও মোবাইল অ্যাপস",
          en: "Quarter 4: 3D AR Engine & Native Apps",
        },
        desc: {
          bn: "অ্যান্ড্রয়েড ও আইওএস অ্যাপ স্টোর রিলিজ এবং ক্যামেরা-বেসড এআর ফ্লোর প্রিভিউ।",
          en: "Release native Android/iOS mobile apps and production AR camera room layout visualization.",
        },
        metric: "Q4 Milestone",
        badge: { bn: "পরবর্তী পর্যায়", en: "Native & AR" },
        iconName: "Smartphone",
      },
    ],
  },
  {
    id: 10,
    slug: "governance-security",
    transitionType: "parallax",
    category: {
      bn: "সুশাসন ও নিরাপত্তা",
      en: "Governance, Security & Accountability",
    },
    title: {
      bn: "স্বচ্ছতা, কমপ্লায়েন্স এবং প্রাতিষ্ঠানিক জবাবদিহিতা",
      en: "Transparency, Compliance & Institutional Safeguards",
    },
    subtitle: {
      bn: "ট্রেড লাইসেন্স স্ক্রিনিং, ফ্রোজেন প্রাইস কন্ট্রাক্ট এবং সক্রিয় বিরোধ নিষ্পত্তি ব্যবস্থা।",
      en: "Rigorous trade license KYC, frozen commercial price contracts, and structured customer dispute resolution.",
    },
    speech: {
      bn: "নির্মাণ সামগ্রীর বাজারে আস্থা অর্জনই সবচেয়ে বড় মূলধন। তাই ডিজিটাইলসে কোনো ভূয়া শোরুম বা অপ্রমাণিত মূল্য তালিকা প্রদর্শনের কোনো সুযোগ রাখা হয়নি। প্রতিটি শোরুমকে পাবলিক ক্যাটালগে আসার আগে ট্রেড লাইসেন্স, টিআইএন এবং মালিকের জাতীয় পরিচয়পত্র জমা দিতে হয়, যা আমাদের অ্যাডমিন দল যাচাই করে অনুমোদন দেয়। যখন একজন ক্রেতা কোনো কোটেশন গ্রহণ করেন, তাৎক্ষণিকভাবে সেই চুক্তি ও দাম ফ্রোজেন স্ন্যাপশট হিসেবে সংরক্ষণ করা হয়। পরবর্তীতে ডিলার ক্যাটালগে দাম পরিবর্তন করলেও ক্রেতার অর্ডারের দামে কোনো হেরফের হতে পারে না। কোনো কারণে পণ্য ডেলিভারিতে ভাঙচুর বা অমিল দেখা দিলে আমাদের সক্রিয় ডিসপিউট রেজোলিউশন ডেস্ক ৩ কার্যদিবসের মধ্যে সমাধান নিশ্চিত করে।",
      en: "Trust is the foundational asset in construction commerce. At DigiTiles, unverified storefronts and fabricated prices are systematically barred. Every dealer must pass strict KYC verification (Trade License, TIN, Owner NID) before listings become publicly discoverable. When a buyer accepts a quote, the pricing terms are permanently captured in a frozen commercial snapshot, immunizing the buyer from subsequent catalogue price fluctuations. If transit damage or material mismatch occurs, our dedicated dispute desk resolves claims within 3 business days, maintaining complete institutional transparency.",
    },
    steps: [
      {
        title: {
          bn: "৭-ধাপের ডিলার ভেরিফিকেশন সাইকেল",
          en: "7-Stage Showroom Verification Cycle",
        },
        desc: {
          bn: "ড্রাফট থেকে সাবমিটেড, রিভিউ এবং ট্রেড লাইসেন্স অনুমোদনের পর মাত্র লাইভ প্রদর্শন।",
          en: "Rigorous review from Draft to Submitted and Verified; unverified dealers remain hidden.",
        },
        metric: "7 States",
        badge: { bn: "কেওয়াইসি গেট", en: "KYC Gate" },
        iconName: "ShieldCheck",
      },
      {
        title: {
          bn: "অপরিবর্তনীয় ফ্রোজেন প্রাইস স্ন্যাপশট",
          en: "Immutable Commercial Price Snapshots",
        },
        desc: {
          bn: "কোটেশন গ্রহণের সময় নির্ধারিত মূল্য অর্ডার রেকর্ডে স্থায়ীভাবে লক হয়ে যায়।",
          en: "Once accepted, commercial line items and agreed BDT rates are frozen permanently.",
        },
        metric: "Price Lock",
        badge: { bn: "চুক্তি সুরক্ষা", en: "Contract Lock" },
        iconName: "Lock",
      },
      {
        title: {
          bn: "স্বচ্ছ বিরোধ নিষ্পত্তি ডেস্ক",
          en: "Structured Dispute Resolution Desk",
        },
        desc: {
          bn: "ভাঙা টাইলস বা ভিন্ন শেডের পণ্য সরবরাহের ক্ষেত্রে অ্যাডমিন মধ্যস্থতায় দ্রুত প্রতিকার।",
          en: "Rapid dispute arbitration protecting buyers against transit breakage or grade discrepancy.",
        },
        metric: "3-Day SLA",
        badge: { bn: "গ্রাহক সুরক্ষা", en: "Dispute Desk" },
        iconName: "Scale",
      },
      {
        title: {
          bn: "ক্রিপ্টোগ্রাফিক অডিট ও ট্রানজ্যাকশন লগ",
          en: "Cryptographic Audit & Event Logging",
        },
        desc: {
          bn: "প্রতিটি কোটেশন তৈরি, গ্রহণ, স্ট্যাটাস পরিবর্তন ও মডারেশন অ্যাকশনের পূর্ণ ইতিহাস।",
          en: "Tamper-evident logging of every quotation submission, acceptance, and state transition.",
        },
        metric: "Tamper Proof",
        badge: { bn: "সম্পূর্ণ অডিট", en: "Audit Trail" },
        iconName: "FileText",
      },
    ],
  },
  {
    id: 11,
    slug: "leadership-team",
    transitionType: "gallery",
    category: {
      bn: "ফাউন্ডার ও লিডারশিপ টিম",
      en: "Founder & Leadership Team",
    },
    title: {
      bn: "অভিজ্ঞ প্রযুক্তি স্থপতি ও নিবেদিত এক্সিকিউশন টিম",
      en: "Experienced Systems Architect & Execution Leadership",
    },
    subtitle: {
      bn: "প্রতিষ্ঠাতা খলিফা আহম্মেদ আল-আমিনের নেতৃত্বে প্রযুক্তি ও নির্মাণ বাণিজ্যের বাস্তব অভিজ্ঞতার মেলবন্ধন।",
      en: "Combining deep software engineering rigor with on-the-ground construction supply chain expertise.",
    },
    speech: {
      bn: "একটি উচ্চাভিলাষী রূপকল্প বাস্তবায়নের জন্য প্রয়োজন দক্ষ ও নিবেদিত নেতৃত্ব। আমি খলিফা আহম্মেদ আল-আমিন, সফটওয়্যার আর্কিটেকচার, ফুল-স্ট্যাক এন্টারপ্রাইজ সিস্টেম এবং প্রযুক্তিভিত্তিক পণ্য নির্মাণে দীর্ঘ অভিজ্ঞতাসম্পন্ন। আমার পরিচালনায় রয়েছে ইকুইসাস বিডি এবং ইকুইসাস এজেন্সি। ডিজিটাইলসের প্রতিটি আর্কিটেকচারাল সিদ্ধান্ত, পারফরম্যান্স অপ্টিমাইজেশন এবং ডেপ্লয়মেন্ট অটোমেশন আমি নিজে সরাসরি ডিজাইন ও পরিচালনা করেছি। আমাদের সাথে যুক্ত আছেন নির্মাণ শিল্পের অভিজ্ঞ উপদেষ্টা, ডিলার অনবোর্ডিং প্রধান এবং কোয়ালিটি নিশ্চয়তা দল। আমরা কেবল একটি সফটওয়্যার বানাচ্ছি না; আমরা নির্মাণ সামগ্রী শিল্পে বাংলাদেশের সবচেয়ে নির্ভরযোগ্য ডিজিটাল ইকোসিস্টেম তৈরি করছি।",
      en: "Executing an ambitious vision requires proven, hands-on leadership. I am Kholipha Ahmmad Al-Amin, Founder and Systems Architect, with deep expertise in enterprise software architectures, robust API systems, and mission-critical product design, leading EquiSaaS BD and EquiSaaS Agency. Every architectural decision, performance optimization, and deployment pipeline in DigiTiles has been crafted with rigorous engineering discipline. Backed by industry advisors, showroom onboarding specialists, and full-stack engineers, our team possesses the operational stamina to lead this national digital transformation.",
    },
    steps: [
      {
        title: {
          bn: "খলিফা আহম্মেদ আল-আমিন",
          en: "Kholipha Ahmmad Al-Amin",
        },
        desc: {
          bn: "ফাউন্ডার ও লিড সিস্টেম আর্কিটেক্ট। ইকুইসাস বিডি ও এজেন্সির প্রতিষ্ঠাতা; এন্টারপ্রাইজ সফটওয়্যার ডিজাইনার।",
          en: "Founder & Lead Systems Architect. Founder of EquiSaaS BD; specialist in enterprise cloud architectures.",
        },
        metric: "Founder",
        badge: { bn: "প্রধান স্থপতি", en: "Lead Architect" },
        iconName: "Award",
      },
      {
        title: {
          bn: "মাঠপর্যায়ের ডিলার রিলেশনস ও অনবোর্ডিং",
          en: "Dealer Relations & Field Operations",
        },
        desc: {
          bn: "হাতিরপুল ও উত্তরা অঞ্চলের সিরামিক ট্রেডার্স অ্যাসোসিয়েশনের সাথে সরাসরি যোগাযোগ ও কেওয়াইসি।",
          en: "Direct engagement with ceramic traders associations in Hatirpool and Uttara with KYC audits.",
        },
        metric: "Field Lead",
        badge: { bn: "ডিলার সম্পর্ক", en: "Operations" },
        iconName: "Users",
      },
      {
        title: {
          bn: "ফুল-স্ট্যাক ইঞ্জিনিয়ারিং ও পারফরম্যান্স টিম",
          en: "Full-Stack Engineering & QA Team",
        },
        desc: {
          bn: "নেক্সট.জেএস, টাইপস্ক্রিপ্ট, এজ কম্পিউটিং এবং প্লেরাইট অটোমেশনে দক্ষ প্রযুক্তি দল।",
          en: "Engineers specializing in Next.js 14, edge compute, state machines, and Playwright automation.",
        },
        metric: "Core Tech",
        badge: { bn: "প্রযুক্তি দল", en: "Engineering" },
        iconName: "Code",
      },
      {
        title: {
          bn: "নির্মাণ শিল্প ও সাপ্লাই চেইন উপদেষ্টা",
          en: "Industry & Supply Chain Advisory",
        },
        desc: {
          bn: "টাইলস কারখানা, আমদানিকারক ও আর্কিটেকচারাল কনসালট্যান্টদের পরামর্শে ব্যবসায়িক কৌশল নির্ধারণ।",
          en: "Advisors from leading ceramic manufacturers and architectural firms guiding go-to-market.",
        },
        metric: "Advisory",
        badge: { bn: "ইন্ডাস্ট্রি মেন্টর", en: "Advisory Board" },
        iconName: "Compass",
      },
    ],
    modalTrigger: "leadership",
  },
  {
    id: 12,
    slug: "closing-vision",
    transitionType: "ascent",
    category: {
      bn: "সমাপনী রূপকল্প ও আহ্বান",
      en: "Closing Vision & Call to Action",
    },
    title: {
      bn: "আসুন একসাথে বাংলাদেশের নির্মাণ সামগ্রী খাতকে ডিজিটাল করি",
      en: "Join Us in Building the Digital Future of Construction",
    },
    subtitle: {
      bn: "স্বচ্ছতা, গতি এবং প্রযুক্তির মেলবন্ধনে গড়ে উঠুক একটি আধুনিক ও নির্ভরযোগ্য ইকোসিস্টেম।",
      en: "Partner with DigiTiles to build the most trusted, transparent, and scalable construction marketplace in Bangladesh.",
    },
    speech: {
      bn: "উপসংহারে বলতে চাই, বাংলাদেশের নির্মাণ খাত আর পেছনের যুগে থাকবে না। বিশ্ব যখন এআই, ৩ডি ভিজ্যুয়ালাইজেশন এবং ডিজিটাল সাপ্লাই চেইনে এগিয়ে যাচ্ছে, বাংলাদেশের বিশাল তরুণ প্রজন্মও সেই আধুনিক সুবিধার দাবিদার। ডিজিটাইলস ইতিমধ্যেই তার কার্যক্ষমতা প্রমাণ করেছে। আমাদের প্ল্যাটফর্ম লাইভ, আমাদের রোডম্যাপ স্পষ্ট এবং আমাদের লক্ষ্য সুনির্দিষ্ট। আমরা বিনিয়োগকারী, প্রাতিষ্ঠানিক সহযোগী এবং শীর্ষস্থানীয় শোরুম মালিকদের আমন্ত্রণ জানাচ্ছি: আসুন, আমরা একসাথে এই রূপান্তরের অংশীদার হই। যেকোনো তথ্য বা পার্টনারশিপ আলোচনার জন্য আমরা সরাসরি প্রস্তুত। ধন্যবাদ।",
      en: "In conclusion, Bangladesh's construction commerce will no longer lag behind. As global procurement shifts toward 3D visualization and automated digital supply chains, our young demographic demands nothing less. DigiTiles is operational, proven, and built with enduring engineering rigor. We invite forward-thinking investors, strategic partners, and leading manufacturers to join us in defining the standard for construction commerce in Bangladesh. Thank you.",
    },
    steps: [
      {
        title: {
          bn: "কৌশলগত বিনিয়োগ ও অংশীদারিত্ব",
          en: "Strategic Investment & Partnerships",
        },
        desc: {
          bn: "সীড রাউন্ডে অংশগ্রহণ ও প্ল্যাটফর্মের প্রবৃদ্ধিতে সক্রিয় কৌশলগত অবদান।",
          en: "Participate in our seed equity round or strategic ecosystem partnership.",
        },
        metric: "Seed Round",
        badge: { bn: "ইনভেস্টমেন্ট", en: "Partnership" },
        iconName: "Target",
      },
      {
        title: {
          bn: "ফ্ল্যাগশিপ শোরুম অনবোর্ডিং",
          en: "Flagship Showroom Onboarding",
        },
        desc: {
          bn: "প্রথম ১০০টি ভেরিফায়েড ডিলার হিসেবে বিশেষ অগ্রাধিকার ও শূন্য কমিশন পাইলট সুবিধা।",
          en: "Special launch incentives and priority verification for founding showrooms.",
        },
        metric: "Zero Fee Pilot",
        badge: { bn: "ডিলারদের জন্য", en: "Showroom Tier" },
        iconName: "Store",
      },
      {
        title: {
          bn: "সরাসরি যোগাযোগ ও অফিস ভিজিট",
          en: "Direct Founder Contact & Office",
        },
        desc: {
          bn: "খিলগাঁও, ঢাকা। ইমেইল: kholipha@equisaas-bd.com | ওয়েবসাইট: digitiles.equisaas-bd.com",
          en: "Khilgaon, Dhaka. Email: kholipha@equisaas-bd.com | Web: digitiles.equisaas-bd.com",
        },
        metric: "Dhaka Hub",
        badge: { bn: "সরাসরি সংযোগ", en: "Get in Touch" },
        iconName: "Mail",
      },
      {
        title: {
          bn: "লাইভ ডেমো ও সিস্টেম এক্সপ্লোরেশন",
          en: "Explore the Live Ecosystem Today",
        },
        desc: {
          bn: "সরাসরি মার্কেটপ্লেস ব্রাউজ করুন এবং আপনার ডিভাইসে লাইভ ভিজ্যুয়ালাইজার পরীক্ষা করুন।",
          en: "Browse verified listings, calculate box coverage, and test all roles in real time.",
        },
        metric: "Live Now",
        badge: { bn: "সরাসরি দেখুন", en: "Live Platform" },
        iconName: "ExternalLink",
      },
    ],
  },
];
