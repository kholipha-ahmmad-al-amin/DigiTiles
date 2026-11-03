export const guideSlugs = [
  "tile-box-calculator",
  "tile-specifications",
  "buying-tiles-in-bangladesh",
  "tile-installation-and-delivery",
] as const;

export type GuideSlug = typeof guideSlugs[number];
type Translation = { en: string; bn: string };
type Guide = {
  title: Translation;
  intro: Translation;
  steps: Translation[];
  faq: { question: Translation; answer: Translation }[];
  action: { href: string; label: Translation };
};

export const marketplaceGuides: Record<GuideSlug, Guide> = {
  "tile-box-calculator": {
    title: { en: "How to calculate tile boxes and wastage", bn: "টাইলসের বক্স ও অপচয় কীভাবে হিসাব করবেন" },
    intro: {
      en: "Measure the area to cover, add an allowance for cuts and breakage, then divide by the square feet in each box. Round up to the next whole box and check the dealer's minimum order. DigiTiles connects its laying-pattern preview to this calculation so the resulting quantity can be used in a quotation request.",
      bn: "যে জায়গায় টাইলস বসাবেন তার আয়তন মাপুন। কাটাকাটি ও ভাঙার জন্য কিছু বাড়তি টাইলস ধরুন, তারপর প্রতি বক্সের বর্গফুট দিয়ে ভাগ করে পরের পূর্ণ সংখ্যায় নিন। বিক্রেতার ন্যূনতম অর্ডারও দেখে নিন। ডিজিটাইলসের ভিজ্যুয়ালাইজারে বিন্যাস বদলালে এই হিসাব বদলায় এবং সেই পরিমাণ দিয়ে কোটেশন চাইতে পারবেন।",
    },
    steps: [
      { en: "Measure each rectangular section in feet and multiply length by width. Add the sections you intend to tile.", bn: "প্রতিটি আয়তাকার অংশের দৈর্ঘ্য ও প্রস্থ ফুটে মেপে গুণ করুন। যেসব অংশে টাইলস বসাবেন তাদের ক্ষেত্রফল যোগ করুন।" },
      { en: "Start with 5% extra for straight grid, 10% for brick bond, or 15% for diagonal and herringbone. Ask the installer to check the allowance for your layout.", bn: "সোজা সারির জন্য ৫%, অর্ধেক সরানো ইটের বিন্যাসে ১০%, আর তির্যক বা হেরিংবোনে ১৫% বাড়তি ধরে শুরু করুন। আপনার ঘরের জন্য মিস্ত্রিকে হিসাবটি যাচাই করতে বলুন।" },
      { en: "For 150 sq.ft at 10% wastage and 15.5 sq.ft per box, allow 165 sq.ft and order 11 boxes before checking the minimum order.", bn: "১৫০ বর্গফুটে ১০% অপচয় ও প্রতি বক্সে ১৫.৫ বর্গফুট ধরলে প্রয়োজন ১৬৫ বর্গফুট বা ১১ বক্স। এরপর ন্যূনতম অর্ডার দেখে নিন।" },
    ],
    faq: [
      {
        question: { en: "Why does a herringbone layout need more tiles?", bn: "হেরিংবোন বিন্যাসে বেশি টাইলস লাগে কেন?" },
        answer: { en: "More tiles must be cut where angled rows meet walls and openings. Offcuts may be too small or the wrong shape to reuse. Room shape and tile size affect the actual waste.", bn: "তির্যক সারি দেয়াল বা দরজার কাছে শেষ হলে বেশি টাইলস কাটতে হয়। কাটা টুকরা ছোট বা বেমানান হলে আবার ব্যবহার করা যায় না। ঘরের আকার ও টাইলসের মাপেও অপচয় বদলায়।" },
      },
    ],
    action: { href: "/visualizer", label: { en: "Try laying patterns and calculate boxes", bn: "বিন্যাস দেখে বক্সের হিসাব করুন" } },
  },
  "tile-specifications": {
    title: { en: "How to compare tile specifications and landed prices", bn: "টাইলসের বৈশিষ্ট্য ও পরিবহনসহ দাম কীভাবে তুলনা করবেন" },
    intro: {
      en: "Compare water absorption, surface wear rating, slip resistance, tile dimensions, and box coverage before you compare price. Use the same project area for every listing. Box rounding and delivery fees can change the cost per square foot, even when one listing has a lower advertised unit price.",
      bn: "দাম তুলনার আগে পানি শোষণ, পৃষ্ঠের ক্ষয় প্রতিরোধ, পিচ্ছিলতা প্রতিরোধ, টাইলসের মাপ ও প্রতি বক্সের আয়তন দেখুন। সব পণ্যের জন্য একই প্রকল্পের আয়তন ধরুন। পূর্ণ বক্স কিনতে হয় ও পরিবহন খরচ যোগ হয়, তাই কম একক দামেও প্রতি বর্গফুটের মোট খরচ বেশি হতে পারে।",
    },
    steps: [
      { en: "Water absorption describes how much water a tile body absorbs. Check the manufacturer's stated use for wet areas.", bn: "পানি শোষণ বলে টাইলসের মূল অংশ কতটা পানি টানে। ভেজা জায়গার জন্য প্রস্তুতকারকের নির্দেশনা দেখুন।" },
      { en: "The PEI wear rating describes abrasion resistance for rated glazed surfaces. R ratings describe slip resistance under the specified test conditions.", bn: "পিইআই রেটিং দিয়ে নির্দিষ্ট গ্লেজ করা পৃষ্ঠের ঘর্ষণজনিত ক্ষয় প্রতিরোধ বোঝায়। আর রেটিং নির্দিষ্ট পরীক্ষার পরিবেশে পিচ্ছিলতা প্রতিরোধ বোঝায়।" },
      { en: "In the comparison drawer, enter your area and the delivery estimate for each tile. Request a dealer quote for confirmed rates and applicable VAT.", bn: "তুলনা প্যানেলে জায়গার আয়তন ও প্রতিটি টাইলসের আনুমানিক পরিবহন খরচ লিখুন। নিশ্চিত দাম ও প্রযোজ্য ভ্যাট জানতে ডিলারের কোটেশন চান।" },
    ],
    faq: [
      {
        question: { en: "How does DigiTiles estimate landed price per square foot?", bn: "ডিজিটাইলস প্রতি বর্গফুটে পরিবহনসহ দাম কীভাবে বের করে?" },
        answer: { en: "It rounds the project quantity to full boxes, respects the dealer minimum, adds your entered transport estimate, and divides by the project area. A dealer quote supplies the actual terms.", bn: "প্রকল্পের জন্য পূর্ণ বক্সের সংখ্যা বের করে, ডিলারের ন্যূনতম অর্ডার ধরে এবং আপনার দেওয়া পরিবহন খরচ যোগ করে প্রকল্পের আয়তন দিয়ে ভাগ করা হয়। চূড়ান্ত শর্ত ডিলারের কোটেশনে থাকে।" },
      },
    ],
    action: { href: "/marketplace", label: { en: "Compare up to four marketplace listings", bn: "মার্কেটপ্লেসে সর্বোচ্চ চারটি পণ্য তুলনা করুন" } },
  },
  "buying-tiles-in-bangladesh": {
    title: { en: "How to buy tiles from a verified Bangladesh showroom", bn: "বাংলাদেশে যাচাইকৃত শোরুম থেকে টাইলস কেনার ধাপ" },
    intro: {
      en: "Find a public listing from a verified showroom, check the specification and required box count, then request an itemized quote for your delivery district. Review the showroom, site address, validity date, and full BDT payable before accepting. Acceptance creates an order with a frozen copy of the commercial terms.",
      bn: "যাচাইকৃত শোরুমের প্রকাশিত পণ্য বেছে নিন। বৈশিষ্ট্য ও প্রয়োজনীয় বক্সের সংখ্যা দেখে ডেলিভারির জেলার জন্য বিস্তারিত কোটেশন চান। গ্রহণের আগে শোরুম, সাইটের ঠিকানা, মেয়াদ ও মোট প্রদেয় টাকা মিলিয়ে নিন। কোটেশন গ্রহণ করলে চূড়ান্ত শর্তের স্থির কপি নিয়ে অর্ডার তৈরি হয়।",
    },
    steps: [
      { en: "Filter the marketplace by category, finish, price, and district. Open the listing to check dimensions and box coverage.", bn: "পণ্যশ্রেণি, ফিনিশ, দাম ও জেলা দিয়ে মার্কেটপ্লেস ছেঁকে নিন। পণ্য খুলে মাপ ও প্রতি বক্সের আয়তন দেখুন।" },
      { en: "Submit a request for quotation with your box quantity and complete site address. Include unloading and access instructions.", bn: "বক্সের সংখ্যা ও সাইটের পূর্ণ ঠিকানা দিয়ে কোটেশন চান। মাল নামানো ও সাইটে ঢোকার নির্দেশনাও দিন।" },
      { en: "Review material, delivery, VAT and discount lines. Save or print the proforma quotation and check the delivery challan when the order moves to fulfilment.", bn: "পণ্য, পরিবহন, ভ্যাট ও ছাড়ের হিসাব মিলিয়ে নিন। প্রোফর্মা কোটেশন সংরক্ষণ বা প্রিন্ট করুন এবং সরবরাহের সময় ডেলিভারি চালান দেখুন।" },
    ],
    faq: [
      {
        question: { en: "Can a listing price change after I accept a quote?", bn: "কোটেশন গ্রহণের পর পণ্যের তালিকাভুক্ত দাম বদলালে কী হবে?" },
        answer: { en: "A dealer may change the public asking price. Your accepted order retains the quantities, prices and commercial terms recorded when you accepted the quote.", bn: "ডিলার প্রকাশিত দাম বদলাতে পারেন। আপনার গ্রহণ করা অর্ডারে কোটেশন গ্রহণের সময়কার পরিমাণ, দাম ও বাণিজ্যিক শর্তই থাকবে।" },
      },
    ],
    action: { href: "/marketplace", label: { en: "Browse verified showroom listings", bn: "যাচাইকৃত শোরুমের পণ্য দেখুন" } },
  },
  "tile-installation-and-delivery": {
    title: { en: "How to plan tile installation and transport", bn: "টাইলস বসানো ও পরিবহন কীভাবে পরিকল্পনা করবেন" },
    intro: {
      en: "Plan delivery and installation together. Check route distance, vehicle access and unloading space, then look for a crew with the right tile-laying specialty. Ask the dealer which branch will dispatch your order and confirm the batch, shade and caliber before work begins, particularly for large continuous floors.",
      bn: "পরিবহন ও টাইলস বসানোর পরিকল্পনা একসঙ্গে করুন। যাত্রাপথের দূরত্ব, গাড়ি ঢোকার রাস্তা ও মাল নামানোর জায়গা দেখে উপযুক্ত কাজে দক্ষ মিস্ত্রি দল খুঁজুন। কোন শাখা থেকে পণ্য আসবে জেনে নিন। বিশেষ করে বড় একটানা মেঝের কাজ শুরুর আগে ব্যাচ, শেড ও ক্যালিবার মিলিয়ে নিন।",
    },
    steps: [
      { en: "Confirm carton weight and access restrictions before choosing a pickup, covered van, or open truck.", bn: "পিকআপ, কাভার্ড ভ্যান বা খোলা ট্রাক বাছাইয়ের আগে কার্টনের ওজন ও প্রবেশের সীমাবদ্ধতা যাচাই করুন।" },
      { en: "Estimate transport using the district base fare plus distance multiplied by the per-kilometre rate.", bn: "জেলার প্রাথমিক ভাড়ার সঙ্গে দূরত্বকে প্রতি কিলোমিটারের ভাড়া দিয়ে গুণ করে যোগ করুন।" },
      { en: "On an active order, save a preferred crew and check the dealer's dispatch vehicle and driver details when available.", bn: "চালু অর্ডারে পছন্দের মিস্ত্রি দল সংরক্ষণ করুন। ডিলার তথ্য দিলে গাড়ির নিবন্ধন ও চালকের বিবরণ দেখুন।" },
    ],
    faq: [
      {
        question: { en: "Does selecting a crew on an order book the installation?", bn: "অর্ডারে মিস্ত্রি দল বেছে নিলেই কি কাজ বুক হয়?" },
        answer: { en: "The selection saves your preferred crew on the order. Confirm the installation rate, scope and date directly with the provider.", bn: "বাছাই করলে পছন্দের দলটি অর্ডারে সংরক্ষিত হয়। কাজের পরিধি, মজুরি ও তারিখ সেবাদাতার সঙ্গে আলাদাভাবে ঠিক করুন।" },
      },
    ],
    action: { href: "/services", label: { en: "Find crews and estimate material transport", bn: "মিস্ত্রি দল খুঁজুন ও পরিবহন খরচ হিসাব করুন" } },
  },
};

export const GUIDE_COPY = {
  title: { en: "Tile buying and installation guides", bn: "টাইলস কেনা ও বসানোর নির্দেশিকা" },
  intro: { en: "Plan a tile project in Bangladesh from measurement to delivery. Calculate box quantities, understand technical ratings, compare showroom quotes in BDT, and prepare for unloading and installation. Each guide connects to the DigiTiles tool or marketplace screen where you can apply the steps to your project.", bn: "বাংলাদেশে টাইলস প্রকল্পের মাপ নেওয়া থেকে ডেলিভারি পর্যন্ত পরিকল্পনা করুন। বক্সের সংখ্যা হিসাব করুন, টাইলসের রেটিং বুঝুন, টাকায় শোরুমের কোটেশন তুলনা করুন এবং মাল নামানো ও বসানোর প্রস্তুতি নিন। প্রতিটি নির্দেশিকা থেকে সংশ্লিষ্ট ডিজিটাইলস টুলে যেতে পারবেন।" },
  steps: { en: "Project checklist", bn: "প্রকল্পের করণীয়" },
  questions: { en: "Common questions", bn: "সাধারণ প্রশ্ন" },
  related: { en: "Related tile buying guides", bn: "টাইলস কেনার আরও নির্দেশিকা" },
  read: { en: "Read the tile buying guides", bn: "টাইলস কেনার নির্দেশিকা পড়ুন" },
  label: { en: "Buying guides", bn: "কেনাকাটার নির্দেশিকা" },
  home: { en: "Home", bn: "প্রচ্ছদ" },
  visualizer: { en: "Room tile visualizer", bn: "ঘরে টাইলসের বিন্যাস দেখুন" },
  services: { en: "Installation and transport directory", bn: "মিস্ত্রি ও পরিবহন সেবার তালিকা" },
  engineered: { en: "Engineered by", bn: "প্রযুক্তি নির্মাণে" },
  architect: { en: "Lead architect", bn: "প্রধান সফটওয়্যার স্থপতি" },
  visualizerIntro: { en: "Preview a tile in a living room, kitchen, bathroom, or showroom. Change the laying pattern, grout and light, then use the box calculator to carry the quantity into a quotation request.", bn: "বসার ঘর, রান্নাঘর, বাথরুম বা শোরুমে টাইলস কেমন দেখাবে দেখুন। বিন্যাস, গ্রাউট ও আলো বদলে বক্সের পরিমাণ হিসাব করুন এবং সেই পরিমাণ দিয়ে কোটেশন চান।" },
  servicesIntro: { en: "Find tile crews and civil contractors by district and specialty. Estimate a pickup, covered van, or truck fare using the district base rate and the planned distance.", bn: "জেলা ও কাজের ধরন অনুযায়ী টাইলস মিস্ত্রি ও নির্মাণ ঠিকাদার খুঁজুন। জেলার প্রাথমিক ভাড়া ও যাত্রাপথের দূরত্ব দিয়ে পিকআপ, কাভার্ড ভ্যান বা ট্রাকের ভাড়া হিসাব করুন।" },
} as const;
