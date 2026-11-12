import {
  Locale,
  ModerationStatus,
  OrderState,
  QuotationStatus,
  RfqStatus,
  VerificationStatus,
} from "./types";

export { commercialCopy } from "./i18n-commercial";

export { SERVICE_COPY } from "./i18n-services";
export { ANALYTICS_COPY } from "./i18n-analytics";
export { GUIDE_COPY, marketplaceGuides } from "./marketplace-guides";
export { INVENTORY_COPY } from "./i18n-inventory";
export { VERIFICATION_COPY } from "./i18n-verification";
export { VISUALIZER_COPY, COMPARISON_COPY } from "./i18n-visualizer";

export function formatBdt(amount: number, locale: Locale = "en"): string {
  const rounded = Math.round(amount || 0);
  const formattedNumber = rounded.toLocaleString("en-IN");
  return locale === "bn" ? `৳ ${formattedNumber}` : `BDT ${formattedNumber}`;
}

export function getOrderStateLabel(state: OrderState, locale: Locale): string {
  const labels: Record<OrderState, { en: string; bn: string }> = {
    PENDING_CONFIRMATION: {
      en: "Pending Seller Confirmation",
      bn: "ডিলার কনফার্মেশনের অপেক্ষায়",
    },
    CONFIRMED: {
      en: "Confirmed by Showroom",
      bn: "শোরুম কর্তৃক নিশ্চিতকৃত",
    },
    PROCESSING: {
      en: "Preparing & Batching",
      bn: "পণ্য প্রস্তুত ও প্যাকিং চলছে",
    },
    READY_FOR_DISPATCH: {
      en: "Ready for Dispatch",
      bn: "ডিসপ্যাচের জন্য প্রস্তুত",
    },
    DISPATCHED: {
      en: "Dispatched in Transit",
      bn: "গাড়িতে ডেলিভারির পথে",
    },
    DELIVERED: {
      en: "Delivered at Site",
      bn: "সাইটে পৌঁছেছে",
    },
    COMPLETED: {
      en: "Completed & Verified",
      bn: "সফলভাবে সম্পন্ন",
    },
    CANCELLED: {
      en: "Cancelled",
      bn: "বাতিলকৃত",
    },
    DISPUTED: {
      en: "Disputed (Under Review)",
      bn: "অভিযোগ পর্যালোচনাধীন",
    },
  };
  return labels[state]?.[locale] || state;
}

export function getVerificationLabel(
  status: VerificationStatus,
  locale: Locale
): string {
  const labels: Record<VerificationStatus, { en: string; bn: string }> = {
    DRAFT: { en: "Draft Profile", bn: "খসড়া প্রোফাইল" },
    SUBMITTED: { en: "Submitted for Review", bn: "যাচাইয়ের জন্য জমা দেওয়া হয়েছে" },
    UNDER_REVIEW: { en: "Under Admin Review", bn: "অ্যাডমিন যাচাই করছেন" },
    VERIFIED: { en: "Verified Showroom", bn: "ভেরিফায়েড শোরুম" },
    REJECTED: { en: "Verification Rejected", bn: "ভেরিফিকেশন বাতিল" },
    SUSPENDED: { en: "Account Suspended", bn: "সাময়িক স্থগিত" },
    EXPIRED: { en: "Credentials Expired", bn: "মেয়াদোত্তীর্ণ" },
  };
  return labels[status]?.[locale] || status;
}

export function getModerationLabel(
  status: ModerationStatus,
  locale: Locale
): string {
  const labels: Record<ModerationStatus, { en: string; bn: string }> = {
    PENDING_MODERATION: { en: "Pending Approval", bn: "অনুমোদনের অপেক্ষায়" },
    APPROVED: { en: "Approved & Public", bn: "অনুমোদিত ও প্রকাশিত" },
    REJECTED: { en: "Rejected", bn: "বাতিলকৃত" },
  };
  return labels[status]?.[locale] || status;
}

export function getRfqStatusLabel(status: RfqStatus, locale: Locale): string {
  const labels: Record<RfqStatus, { en: string; bn: string }> = {
    OPEN: { en: "Awaiting Dealer Quote", bn: "কোটেশনের অপেক্ষায়" },
    QUOTED: { en: "Quotation Received", bn: "কোটেশন পাওয়া গেছে" },
    ACCEPTED: { en: "Converted to Order", bn: "অর্ডারে রূপান্তরিত" },
    CONVERTED: { en: "Converted to Order", bn: "অর্ডারে রূপান্তরিত" },
    CANCELLED: { en: "Cancelled", bn: "বাতিল" },
  };
  return labels[status]?.[locale] || status;
}

export function getQuotationStatusLabel(
  status: QuotationStatus,
  locale: Locale
): string {
  const labels: Record<QuotationStatus, { en: string; bn: string }> = {
    SENT: { en: "Active Offer (Immutable)", bn: "সক্রিয় কোটেশন" },
    ACCEPTED: { en: "Accepted & Ordered", bn: "গৃহীত ও অর্ডারকৃত" },
    SUPERSEDED: { en: "Superseded by Newer Version", bn: "নতুন ভার্সন দ্বারা প্রতিস্থাপিত" },
    DECLINED: { en: "Declined After Another Quote Was Accepted", bn: "অন্য কোটেশন গৃহীত হওয়ায় বাতিল" },
    EXPIRED: { en: "Validity Expired", bn: "মেয়াদ শেষ" },
    REJECTED: { en: "Declined", bn: "প্রত্যাখ্যাত" },
  };
  return labels[status]?.[locale] || status;
}

export const UI_COPY = {
  nav: {
    brandTagline: { en: "Tiles and construction services in Bangladesh", bn: "বাংলাদেশের টাইলস ও নির্মাণসেবা" },
    marketplace: { en: "Marketplace", bn: "মার্কেটপ্লেস" },
    assistant: { en: "Catalogue assistant", bn: "ক্যাটালগ সহকারী" },
    customerWorkspace: { en: "Buyer Workspace", bn: "ক্রেতা ড্যাশবোর্ড" },
    dealerWorkspace: { en: "Dealer Portal", bn: "ডিলার পোর্টাল" },
    adminWorkspace: { en: "Admin Console", bn: "অ্যাডমিন প্যানেল" },
    signIn: { en: "Sign In", bn: "সাইন-ইন" },
    signOut: { en: "Sign Out", bn: "লগআউট" },
    notifications: { en: "Notifications", bn: "নোটিফিকেশন" },
    switchRole: { en: "Active Workspace", bn: "সক্রিয় রোল" },
  },
};
