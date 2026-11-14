import {
  DocsSiteConfig,
  DocsTeamMember,
  RuntimeDatabase,
} from "./types";

export type DocsPublicState =
  | "open"
  | "before_window"
  | "after_window"
  | "disabled";

export interface DocsAccessResolution {
  publicState: DocsPublicState;
  publiclyVisible: boolean;
  opensAt?: string;
  closesAt?: string;
}

export const DEFAULT_DOCS_TEAM_NAME = "DigiTiles Core Team";

export const DEFAULT_DOCS_CONFIG: DocsSiteConfig = {
  enabled: true,
  scheduleMode: "always",
  startsAt: null,
  endsAt: null,
  teamName: DEFAULT_DOCS_TEAM_NAME,
  teamMembers: [
    {
      id: "tm_founder",
      name: "Kholipha Ahmmad Al-Amin",
      role: "Founder & Chief Architect",
      email: "kholifaahmadalamin@gmail.com",
    },
  ],
  sectionOverrides: {},
  version: 1,
};

export function getDocsConfig(db: RuntimeDatabase): DocsSiteConfig {
  const stored = db.docsSite;
  if (!stored) return { ...DEFAULT_DOCS_CONFIG };
  return {
    ...DEFAULT_DOCS_CONFIG,
    ...stored,
    teamMembers: Array.isArray(stored.teamMembers)
      ? stored.teamMembers
      : DEFAULT_DOCS_CONFIG.teamMembers,
    sectionOverrides:
      stored.sectionOverrides && typeof stored.sectionOverrides === "object"
        ? stored.sectionOverrides
        : {},
  };
}

function parseWindowBound(value?: string | null): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

export function resolveDocsAccess(
  config: DocsSiteConfig,
  now: Date = new Date()
): DocsAccessResolution {
  if (!config.enabled) {
    return { publicState: "disabled", publiclyVisible: false };
  }

  const startsAt = parseWindowBound(config.startsAt);
  const endsAt = parseWindowBound(config.endsAt);
  const nowMs = now.getTime();

  if (config.scheduleMode === "window") {
    if (startsAt !== null && nowMs < startsAt) {
      return {
        publicState: "before_window",
        publiclyVisible: false,
        opensAt: config.startsAt || undefined,
      };
    }
    if (endsAt !== null && nowMs > endsAt) {
      return {
        publicState: "after_window",
        publiclyVisible: false,
        closesAt: config.endsAt || undefined,
      };
    }
  }

  return {
    publicState: "open",
    publiclyVisible: true,
    opensAt: config.startsAt || undefined,
    closesAt: config.endsAt || undefined,
  };
}

export interface DocsLiveMetrics {
  totalUsers: number;
  verifiedOrganizations: number;
  pendingOrganizations: number;
  totalListings: number;
  publicListings: number;
  totalCategories: number;
  totalBranches: number;
  totalRfqs: number;
  totalQuotations: number;
  totalOrders: number;
  completedOrders: number;
  disputedOrders: number;
  totalNotifications: number;
  totalAuditLogs: number;
  orderStateCounts: Record<string, number>;
  verifiedDistricts: string[];
}

export function buildDocsLiveMetrics(db: RuntimeDatabase): DocsLiveMetrics {
  const verifiedOrgs = db.organizations.filter(
    (o) => o.verificationStatus === "VERIFIED"
  );
  const verifiedOrgIds = new Set(verifiedOrgs.map((o) => o.id));
  const publicListings = db.listings.filter(
    (l) =>
      l.visibilityStatus === "ACTIVE" &&
      l.moderationStatus === "APPROVED" &&
      verifiedOrgIds.has(l.organizationId)
  );
  const orderStateCounts: Record<string, number> = {};
  for (const order of db.orders) {
    orderStateCounts[order.state] = (orderStateCounts[order.state] || 0) + 1;
  }
  const verifiedDistricts = Array.from(
    new Set(
      verifiedOrgs
        .map((o) => o.primaryDistrict)
        .filter((d): d is string => Boolean(d))
    )
  );

  return {
    totalUsers: db.users.length,
    verifiedOrganizations: verifiedOrgs.length,
    pendingOrganizations: db.organizations.filter(
      (o) => o.verificationStatus === "SUBMITTED" || o.verificationStatus === "UNDER_REVIEW"
    ).length,
    totalListings: db.listings.length,
    publicListings: publicListings.length,
    totalCategories: db.categories.length,
    totalBranches: db.branches.length,
    totalRfqs: db.rfqs.length,
    totalQuotations: db.quotations.length,
    totalOrders: db.orders.length,
    completedOrders: db.orders.filter((o) => o.state === "COMPLETED").length,
    disputedOrders: db.orders.filter((o) => o.state === "DISPUTED").length,
    totalNotifications: db.notifications.length,
    totalAuditLogs: db.auditLogs.length,
    orderStateCounts,
    verifiedDistricts,
  };
}

export type DocsSectionGroup = "pitch" | "product" | "engineering" | "company";

export interface DocsSectionMeta {
  id: string;
  group: DocsSectionGroup;
  titleEn: string;
  titleBn: string;
  anchor: string;
}

export const DOCS_SECTION_GROUPS: { id: DocsSectionGroup; labelEn: string; labelBn: string }[] = [
  { id: "pitch", labelEn: "Pitch Deck", labelBn: "পিচ ডেক" },
  { id: "product", labelEn: "Product", labelBn: "প্রোডাক্ট" },
  { id: "engineering", labelEn: "Engineering", labelBn: "ইঞ্জিনিয়ারিং" },
  { id: "company", labelEn: "Company", labelBn: "কোম্পানি" },
];

export const DOCS_SECTIONS: DocsSectionMeta[] = [
  { id: "overview", group: "product", anchor: "overview", titleEn: "Product Overview", titleBn: "প্রোডাক্ট পরিচিতি" },
  { id: "pitch-deck", group: "pitch", anchor: "pitch-deck", titleEn: "Executive Pitch Deck", titleBn: "এক্সিকিউটিভ পিচ ডেক" },
  { id: "features", group: "product", anchor: "features", titleEn: "Feature Matrix", titleBn: "ফিচার ম্যাট্রিক্স" },
  { id: "architecture", group: "engineering", anchor: "architecture", titleEn: "System Architecture", titleBn: "সিস্টেম আর্কিটেকচার" },
  { id: "data-flow", group: "engineering", anchor: "data-flow", titleEn: "Data Flow", titleBn: "ডেটা ফ্লো" },
  { id: "tech-stack", group: "engineering", anchor: "tech-stack", titleEn: "Technology Stack", titleBn: "টেকনোলজি স্ট্যাক" },
  { id: "api", group: "engineering", anchor: "api", titleEn: "API Documentation", titleBn: "এপিআই ডকুমেন্টেশন" },
  { id: "data-layer", group: "engineering", anchor: "data-layer", titleEn: "Data Layer", titleBn: "ডেটা লেয়ার" },
  { id: "ai-layer", group: "engineering", anchor: "ai-layer", titleEn: "AI Layer", titleBn: "এআই লেয়ার" },
  { id: "roadmap", group: "product", anchor: "roadmap", titleEn: "Product Roadmap", titleBn: "প্রোডাক্ট রোডম্যাপ" },
  { id: "performance", group: "engineering", anchor: "performance", titleEn: "Performance & Scalability", titleBn: "পারফরম্যান্স ও স্কেলেবিলিটি" },
  { id: "security", group: "engineering", anchor: "security", titleEn: "Security & Access Control", titleBn: "সিকিউরিটি ও অ্যাক্সেস কন্ট্রোল" },
  { id: "analytics", group: "engineering", anchor: "analytics", titleEn: "Analytics & Live Metrics", titleBn: "অ্যানালিটিক্স ও লাইভ মেট্রিক্স" },
  { id: "team", group: "pitch", anchor: "team", titleEn: "Team & Contributors", titleBn: "টিম ও অবদানকারী" },
  { id: "changelog", group: "company", anchor: "changelog", titleEn: "Changelog", titleBn: "চেঞ্জলগ" },
];

export function getDocsSectionTitle(
  sectionId: string,
  locale: "bn" | "en",
  overrides?: Record<string, { titleEn?: string; titleBn?: string }>
): string {
  const meta = DOCS_SECTIONS.find((s) => s.id === sectionId);
  const override = overrides?.[sectionId];
  const fallback = meta ? (locale === "bn" ? meta.titleBn : meta.titleEn) : sectionId;
  if (!override) return fallback;
  const value = locale === "bn" ? override.titleBn : override.titleEn;
  return value?.trim() || fallback;
}

export interface DocsTeamMemberInput {
  name: string;
  role: string;
  email: string;
  photoUrl?: string;
}

export function sanitizeTeamMembers(input: unknown): DocsTeamMember[] {
  if (!Array.isArray(input)) return [];
  const members: DocsTeamMember[] = [];
  for (const raw of input.slice(0, 24)) {
    if (!raw || typeof raw !== "object") continue;
    const entry = raw as Record<string, unknown>;
    const name = String(entry.name || "").trim().slice(0, 120);
    const role = String(entry.role || "").trim().slice(0, 120);
    const email = String(entry.email || "").trim().slice(0, 160);
    if (!name || !role || !email) continue;
    const photoUrl = String(entry.photoUrl || "").trim().slice(0, 500);
    members.push({
      id: `tm_${members.length}_${Date.now().toString(36)}`,
      name,
      role,
      email,
      ...(photoUrl ? { photoUrl } : {}),
    });
  }
  return members;
}
