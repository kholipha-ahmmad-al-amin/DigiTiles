export const VERIFICATION_COPY = {
  actions: {
    UNDER_REVIEW: { en: "Start review", bn: "পর্যালোচনা শুরু করুন" },
    VERIFIED: { en: "Verify", bn: "যাচাই সম্পন্ন করুন" },
    REJECTED: { en: "Reject", bn: "প্রত্যাখ্যান করুন" },
    SUSPENDED: { en: "Suspend", bn: "স্থগিত করুন" },
    EXPIRED: { en: "Mark expired", bn: "মেয়াদোত্তীর্ণ চিহ্নিত করুন" },
  },
  reason: { en: "Decision reason", bn: "সিদ্ধান্তের কারণ" },
  queue: { en: "Dealer verification queue", bn: "ডিলার যাচাইয়ের তালিকা" },
  failed: { en: "The decision could not be saved. Review the current status and reason, then try again.", bn: "সিদ্ধান্ত সংরক্ষণ করা যায়নি। বর্তমান অবস্থা ও কারণ যাচাই করে আবার চেষ্টা করুন।" },
  saved: { en: "Decision recorded in the audit log.", bn: "সিদ্ধান্ত অডিট লগে সংরক্ষিত হয়েছে।" },
  locked: {
    en: "Only the owner can change these details when verification is in draft, rejected, or expired.",
    bn: "যাচাইয়ের অবস্থা খসড়া, প্রত্যাখ্যাত বা মেয়াদোত্তীর্ণ হলে শুধু মালিক এই তথ্য পরিবর্তন করতে পারবেন।",
  },
  tradeLicense: { en: "Trade license number", bn: "ট্রেড লাইসেন্স নম্বর" },
  tin: { en: "TIN / BIN number", bn: "টিআইএন / বিআইএন নম্বর" },
  nid: { en: "Owner NID", bn: "মালিকের জাতীয় পরিচয়পত্র নম্বর" },
  section: { en: "Verification credentials", bn: "যাচাইয়ের নথির তথ্য" },
  approveListing: { en: "Approve", bn: "অনুমোদন করুন" },
  listingApprovedReason: { en: "Specifications and pricing approved for the marketplace.", bn: "মার্কেটপ্লেসের জন্য পণ্যের বিবরণ ও মূল্য অনুমোদন করা হয়েছে।" },
  listingRejectedReason: { en: "Listing failed moderation review.", bn: "পণ্যের তালিকা যাচাইয়ে উত্তীর্ণ হয়নি।" },
} as const;
