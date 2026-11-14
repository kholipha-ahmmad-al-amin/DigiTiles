import fs from "fs";
import path from "path";
import {
  AuditLog,
  DealerListing,
  DeliveryCoordination,
  GlobalRole,
  Notification,
  Order,
  OrderState,
  Organization,
  OrganizationMembership,
  OrgMemberRole,
  Quotation,
  QuotationItem,
  Rfq,
  RfqItem,
  RuntimeDatabase,
  SwatchPattern,
  User,
} from "./types";
import { createInitialSeedDatabase } from "./seed-data";
import { randomUUID } from "crypto";
import { releaseOrderStock, reserveOrderStock, setStockLot } from "./inventory";
import { availableVerificationDecisions, canSubmitVerification } from "./verification";
import { getVerificationLabel } from "./i18n";
import { getCommercialBranch, snapshotQuotation } from "./commercial";

let memoryDatabase: RuntimeDatabase | null = null;

function getStorageFilePath(): string {
  if (process.env.DIGITILES_TEST_DB_PATH && !process.env.VERCEL) {
    return process.env.DIGITILES_TEST_DB_PATH;
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join("/tmp", "digitiles-runtime-db.json");
  }
  return path.join(process.cwd(), "data", "digitiles-runtime-db.json");
}

function rememberDatabase(db: RuntimeDatabase): RuntimeDatabase {
  memoryDatabase = db;
  return db;
}

function retainBackgroundWork(work: Promise<unknown>) {
  const agent = (globalThis as { navigator?: { userAgent?: string } }).navigator?.userAgent;
  if (agent !== "Cloudflare-Workers") return;
  try {
    const loadWorkers = new Function("return import('cloudflare:workers')") as () => Promise<{
      waitUntil?: (promise: Promise<unknown>) => void;
    }>;
    void loadWorkers()
      .then((mod) => mod.waitUntil?.(work))
      .catch(() => undefined);
  } catch {
    // Workers rejects code compiled from a string. The request still awaits the D1 sync.
  }
}

export function loadDatabase(): RuntimeDatabase {
  if (memoryDatabase) return memoryDatabase;
  const filePath = getStorageFilePath();
  try {
    return rememberDatabase(JSON.parse(fs.readFileSync(filePath, "utf-8")) as RuntimeDatabase);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code && code !== "ENOENT" && code !== "ENOTDIR" && code !== "EPERM" && code !== "EROFS") throw error;
  }

  const seeded = createInitialSeedDatabase();
  for (const quote of seeded.quotations) {
    const rfq = seeded.rfqs.find((entry) => entry.id === quote.rfqId);
    const organization = seeded.organizations.find((entry) => entry.id === quote.organizationId);
    if (rfq && organization) {
      quote.commercialSnapshot = snapshotQuotation(quote, rfq, organization, getCommercialBranch(seeded.branches, organization.id));
    }
  }
  for (const order of seeded.orders) {
    const quote = seeded.quotations.find((entry) => entry.id === order.quotationId);
    if (quote?.commercialSnapshot) order.commercialSnapshot = quote.commercialSnapshot;
  }
  return seeded;
}

export const CLOUDFLARE_D1_API_URL =
  process.env.CLOUDFLARE_D1_API_URL || "https://api.digitiles.equisaas-bd.com";
const CLOUDFLARE_SYNC_KEY =
  process.env.CLOUDFLARE_SYNC_KEY || "dgt_cf_d1_sync_2026_equisaas_bd";

export async function syncDatabaseToCloudflareD1(
  db: RuntimeDatabase
): Promise<boolean> {
  if (process.env.DIGITILES_TEST_DB_PATH) return false;
  try {
    const res = await fetch(`${CLOUDFLARE_D1_API_URL}/api/state`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Digitiles-Sync-Key": CLOUDFLARE_SYNC_KEY,
      },
      body: JSON.stringify({ state: db }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function hydrateDatabaseFromCloudflareD1(): Promise<RuntimeDatabase> {
  if (process.env.DIGITILES_TEST_DB_PATH) return loadDatabase();
  try {
    const res = await fetch(`${CLOUDFLARE_D1_API_URL}/api/state`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const state = data?.state;
      const usable = data?.found && state && Array.isArray(state.listings) && state.listings.length > 0 && Array.isArray(state.organizations);
      if (usable) {
        rememberDatabase(state as RuntimeDatabase);
        try {
          const filePath = getStorageFilePath();
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
        } catch {
          // Workers have no durable disk. The in-memory copy and D1 remain.
        }
        return state as RuntimeDatabase;
      }
    }
  } catch {
    // Fallback to local snapshot if edge network is unreachable
  }
  return loadDatabase();
}

export function saveDatabase(db: RuntimeDatabase): void {
  rememberDatabase(db);
  const filePath = getStorageFilePath();
  const temporaryFile = `${filePath}.${randomUUID()}.tmp`;
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(temporaryFile, JSON.stringify(db, null, 2), { encoding: "utf-8", flag: "wx" });
    fs.renameSync(temporaryFile, filePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    try {
      fs.rmSync(temporaryFile, { force: true });
    } catch {
      // The disk write is optional when D1 is the record.
    }
    if (code === "EEXIST") throw error;
  }
  const sync = syncDatabaseToCloudflareD1(db);
  retainBackgroundWork(sync);
  void sync;
}

export function normalizeBangladeshPhone(input: string): string {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.startsWith("8801") && digits.length === 13) {
    return `+${digits}`;
  }
  if (digits.startsWith("01") && digits.length === 11) {
    return `+88${digits}`;
  }
  if (digits.startsWith("1") && digits.length === 10) {
    return `+880${digits}`;
  }
  return input.trim();
}

export function isValidBangladeshPhone(phone: string): boolean {
  const normalized = normalizeBangladeshPhone(phone);
  return /^\+8801[3-9]\d{8}$/.test(normalized);
}

// Business Rule 8: Tenant lookup & isolation helper
export function getUserMembershipForOrg(
  db: RuntimeDatabase,
  userId: string,
  organizationId?: string
): OrganizationMembership | undefined {
  return db.memberships.find(
    (m) =>
      m.userId === userId &&
      m.isActive &&
      (organizationId ? m.organizationId === organizationId : true)
  );
}

export function getUserOrganization(
  db: RuntimeDatabase,
  userId: string
): { organization: Organization; membership: OrganizationMembership } | null {
  const membership = getUserMembershipForOrg(db, userId);
  if (!membership) return null;
  const organization = db.organizations.find(
    (o) => o.id === membership.organizationId
  );
  if (!organization) return null;
  return { organization, membership };
}

// Business Rule 3: Only ACTIVE + APPROVED listings from a VERIFIED organization are publicly discoverable
export interface DiscoveryFilterParams {
  q?: string;
  categoryId?: string;
  district?: string;
  finish?: string;
  dimensions?: string;
  minPriceSqft?: number;
  maxPriceSqft?: number;
  organizationId?: string;
  sort?: "price_asc" | "price_desc" | "newest";
  page?: number;
  pageSize?: number;
}

export function isPublicListing(listing: DealerListing, organization?: Organization) {
  return listing.visibilityStatus === "ACTIVE" &&
    listing.moderationStatus === "APPROVED" &&
    organization?.verificationStatus === "VERIFIED";
}

export function publicShowroom(organization: Organization) {
  const { id, slug, tradeNameEn, tradeNameBn, descriptionEn, descriptionBn,
    primaryDistrict, contactPhone, verificationStatus, verifiedAt } = organization;
  return { id, slug, tradeNameEn, tradeNameBn, descriptionEn, descriptionBn,
    primaryDistrict, contactPhone, verificationStatus, verifiedAt };
}

export function queryDiscoverableListings(params: DiscoveryFilterParams = {}) {
  const db = loadDatabase();
  const organizations = new Map(db.organizations.map((org) => [org.id, org]));

  let results = db.listings.filter(
    (item) => isPublicListing(item, organizations.get(item.organizationId))
  );

  if (params.q && params.q.trim()) {
    const q = params.q.trim().toLowerCase();
    results = results.filter(
      (item) =>
        item.titleEn.toLowerCase().includes(q) ||
        item.titleBn.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.materialType.toLowerCase().includes(q) ||
        item.dimensionsMm.toLowerCase().includes(q)
    );
  }

  if (params.categoryId && params.categoryId !== "ALL") {
    results = results.filter(
      (item) =>
        item.categoryId === params.categoryId ||
        db.categories.find((c) => c.slug === params.categoryId)?.id ===
          item.categoryId
    );
  }

  if (params.district && params.district !== "ALL") {
    results = results.filter((item) =>
      item.servicingDistricts.includes(params.district!)
    );
  }

  if (params.finish && params.finish !== "ALL") {
    const f = params.finish.toLowerCase();
    results = results.filter((item) =>
      item.surfaceFinish.toLowerCase().includes(f)
    );
  }

  if (params.dimensions && params.dimensions !== "ALL") {
    const d = params.dimensions.toLowerCase();
    results = results.filter((item) =>
      item.dimensionsMm.toLowerCase().includes(d)
    );
  }

  if (typeof params.minPriceSqft === "number" && !isNaN(params.minPriceSqft)) {
    results = results.filter(
      (item) => item.pricePerSqftBdt >= params.minPriceSqft!
    );
  }

  if (typeof params.maxPriceSqft === "number" && !isNaN(params.maxPriceSqft)) {
    results = results.filter(
      (item) => item.pricePerSqftBdt <= params.maxPriceSqft!
    );
  }

  if (params.organizationId && params.organizationId !== "ALL") {
    results = results.filter(
      (item) => item.organizationId === params.organizationId
    );
  }

  if (params.sort === "price_asc") {
    results.sort((a, b) => a.pricePerSqftBdt - b.pricePerSqftBdt);
  } else if (params.sort === "price_desc") {
    results.sort((a, b) => b.pricePerSqftBdt - a.pricePerSqftBdt);
  } else {
    results.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  const totalCount = results.length;
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(50, params.pageSize || 12));
  const items = results.slice((page - 1) * pageSize, page * pageSize);

  const enrichedItems = items.map((listing) => {
    const organization = db.organizations.find(
      (o) => o.id === listing.organizationId
    );
    const branch = db.branches.find((b) => b.id === listing.branchId);
    const category = db.categories.find((c) => c.id === listing.categoryId);
    return {
      ...listing,
      organization: organization && publicShowroom(organization),
      branch,
      category,
    };
  });

  return {
    items: enrichedItems,
    totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

// FR-02: Activate or switch role under one canonical identity
export function switchOrActivateUserRole(
  userId: string,
  targetRole: GlobalRole,
  organizationTradeName?: string,
  primaryDistrict?: string
): User {
  const db = loadDatabase();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    throw new Error("User account not found.");
  }

  if (targetRole === "ADMIN" && !user.roles.includes("ADMIN")) {
    throw new Error("Admin role requires platform authorization.");
  }
  if (targetRole !== "ADMIN" && targetRole !== "DEALER" && targetRole !== "CUSTOMER") {
    throw new Error("Unknown workspace role.");
  }

  if (!user.roles.includes(targetRole)) {
    user.roles.push(targetRole);
  }
  user.activeRole = targetRole;

  // If activating DEALER and user has no organization membership yet, create a draft Organization
  if (targetRole === "DEALER") {
    const existingOrg = getUserOrganization(db, user.id);
    if (!existingOrg) {
      const now = new Date().toISOString();
      const orgId = `org_${Date.now()}`;
      const tradeName =
        organizationTradeName?.trim() || `${user.fullName} Ceramic Showroom`;
      const district = primaryDistrict || "Dhaka";
      const newOrg: Organization = {
        id: orgId,
        slug: tradeName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        tradeNameEn: tradeName,
        tradeNameBn: tradeName,
        descriptionEn: "Registered tile and construction material showroom.",
        descriptionBn: "নিবন্ধিত টাইলস ও নির্মাণসামগ্রী শোরুম।",
        primaryDistrict: district,
        contactPhone: user.phone,
        verificationStatus: "DRAFT",
        tradeLicenseNo: "",
        tinNumber: "",
        ownerNid: "",
        createdAt: now,
        updatedAt: now,
      };
      const newBranch = {
        id: `brn_${Date.now()}`,
        organizationId: orgId,
        nameEn: `${district} Main Showroom`,
        nameBn: `${district} মেইন শোরুম`,
        district,
        addressEn: `${district} Commercial Area`,
        addressBn: `${district} বাণিজ্যিক এলাকা`,
        contactPhone: user.phone,
        isMainBranch: true,
      };
      const newMembership: OrganizationMembership = {
        id: `mem_${Date.now()}`,
        organizationId: orgId,
        userId: user.id,
        userPhone: user.phone,
        userName: user.fullName,
        memberRole: "OWNER",
        isActive: true,
        createdAt: now,
      };
      db.organizations.push(newOrg);
      db.branches.push(newBranch);
      db.memberships.push(newMembership);
    }
  }

  saveDatabase(db);
  return user;
}

// FR-08: Create RFQ
export function createCustomerRfq(params: {
  customerUserId: string;
  items: { listingId: string; requestedBoxes: number }[];
  deliveryDistrict: string;
  deliveryAddress: string;
  preferredWindow: string;
  projectNotes: string;
}): Rfq {
  const db = loadDatabase();
  const customer = db.users.find((u) => u.id === params.customerUserId);
  if (!customer?.roles.includes("CUSTOMER")) {
    throw new Error("Forbidden: Customer access required.");
  }

  if (!params.items || params.items.length === 0) {
    throw new Error("At least one product listing is required to submit an RFQ.");
  }

  const firstListing = db.listings.find(
    (l) => l.id === params.items[0].listingId
  );
  if (!firstListing) {
    throw new Error("Selected product listing does not exist.");
  }

  const org = db.organizations.find(
    (o) => o.id === firstListing.organizationId
  );
  if (!org || org.verificationStatus !== "VERIFIED") {
    throw new Error("Quotations can only be requested from verified dealers.");
  }

  const rfqItems: RfqItem[] = params.items.map((entry) => {
    const listing = db.listings.find((l) => l.id === entry.listingId);
    if (!listing || listing.organizationId !== org.id || !isPublicListing(listing, org)) {
      throw new Error("All requested items must be publicly available from the same showroom.");
    }
    if (!Number.isSafeInteger(entry.requestedBoxes) || entry.requestedBoxes < 1) {
      throw new Error("Requested boxes must be a positive whole number.");
    }
    const boxes = Math.max(listing.minOrderBoxes || 1, Math.round(entry.requestedBoxes));
    return {
      listingId: listing.id,
      categoryId: listing.categoryId,
      sku: listing.sku,
      titleEn: listing.titleEn,
      titleBn: listing.titleBn,
      dimensionsMm: listing.dimensionsMm,
      surfaceFinish: listing.surfaceFinish,
      requestedBoxes: boxes,
      sqftPerBox: listing.sqftPerBox,
      totalSqft: Number((boxes * listing.sqftPerBox).toFixed(2)),
      indicativePricePerBoxBdt: listing.pricePerBoxBdt,
      indicativePricePerSqftBdt: listing.pricePerSqftBdt,
    };
  });

  const now = new Date().toISOString();
  const rfqNumber = `RFQ-2026-${1000 + db.rfqs.length + 1}`;
  const newRfq: Rfq = {
    id: `rfq_${Date.now()}`,
    rfqNumber,
    customerUserId: customer.id,
    customerName: customer.fullName,
    customerPhone: customer.phone,
    organizationId: org.id,
    organizationNameEn: org.tradeNameEn,
    organizationNameBn: org.tradeNameBn,
    deliveryDistrict: params.deliveryDistrict.trim() || "Dhaka",
    deliveryAddress: params.deliveryAddress.trim(),
    preferredWindow: params.preferredWindow.trim() || "Standard 3-5 days",
    projectNotes: params.projectNotes.trim(),
    status: "OPEN",
    items: rfqItems,
    createdAt: now,
    updatedAt: now,
  };

  db.rfqs.unshift(newRfq);

  // Notify dealer members (FR-13)
  const dealerMembers = db.memberships.filter(
    (m) => m.organizationId === org.id && m.isActive
  );
  for (const member of dealerMembers) {
    db.notifications.unshift({
      id: `ntf_${Date.now()}_${member.userId}`,
      userId: member.userId,
      category: "RFQ",
      titleEn: `New RFQ Received (${rfqNumber})`,
      titleBn: `নতুন কোটেশন রিকোয়েস্ট (${rfqNumber})`,
      bodyEn: `${customer.fullName} requested a quote for ${rfqItems.length} item(s) to ${newRfq.deliveryDistrict}.`,
      bodyBn: `${customer.fullName} ${newRfq.deliveryDistrict} ডেলিভারির জন্য কোটেশন চেয়েছেন।`,
      linkPath: "/workspace/dealer/rfqs",
      isRead: false,
      createdAt: now,
    });
  }

  saveDatabase(db);
  return newRfq;
}

// FR-09 & Business Rule 4: Issue immutable, versioned Quotation
export function issueDealerQuotation(params: {
  actorUserId: string;
  rfqId: string;
  itemPrices: { listingId: string; quotedBoxes: number; unitPricePerBoxBdt: number }[];
  deliveryFeeBdt: number;
  discountBdt: number;
  vatBdt?: number;
  validUntil: string;
  paymentTerms: string;
  deliveryTerms: string;
}): Quotation {
  const db = loadDatabase();
  const rfq = db.rfqs.find((r) => r.id === params.rfqId);
  if (!rfq) {
    throw new Error("Target RFQ not found.");
  }
  if (rfq.status === "ACCEPTED" || rfq.status === "CONVERTED" || rfq.status === "CANCELLED") {
    throw new Error("Cannot issue quotation for a converted or cancelled RFQ.");
  }

  // Business Rule 8: Tenant isolation check
  const membership = getUserMembershipForOrg(
    db,
    params.actorUserId,
    rfq.organizationId
  );
  if (!membership) {
    throw new Error("Forbidden: You do not belong to the target showroom organization.");
  }

  const org = db.organizations.find((o) => o.id === rfq.organizationId);
  if (!org || org.verificationStatus !== "VERIFIED") {
    throw new Error("Organization must be VERIFIED by Admin before sending quotations.");
  }

  const actor = db.users.find((u) => u.id === params.actorUserId);

  const existingQuotes = db.quotations.filter((q) => q.rfqId === rfq.id);
  const nextVersion = Math.max(0, ...existingQuotes.map((quote) => quote.versionNumber)) + 1;
  if (params.itemPrices.some((price) => !price || !Number.isSafeInteger(price.quotedBoxes)
    || price.quotedBoxes < 1 || !Number.isFinite(price.unitPricePerBoxBdt) || price.unitPricePerBoxBdt < 1)) {
    throw new Error("Quote lines must have a positive box quantity and unit price.");
  }
  const quoteItems: QuotationItem[] = rfq.items.map((rfqItem) => {
    const override = params.itemPrices.find(
      (p) => p.listingId === rfqItem.listingId
    );
    const quotedBoxes = override
      ? Math.max(1, Math.round(override.quotedBoxes))
      : rfqItem.requestedBoxes;
    const unitPricePerBoxBdt = override
      ? Math.max(1, Number(override.unitPricePerBoxBdt))
      : rfqItem.indicativePricePerBoxBdt;
    const unitPricePerSqftBdt = Number(
      (unitPricePerBoxBdt / (rfqItem.sqftPerBox || 1)).toFixed(2)
    );
    const lineTotalBdt = Math.round(quotedBoxes * unitPricePerBoxBdt);

    return {
      listingId: rfqItem.listingId,
      categoryId: rfqItem.categoryId,
      sku: rfqItem.sku,
      titleEn: rfqItem.titleEn,
      titleBn: rfqItem.titleBn,
      dimensionsMm: rfqItem.dimensionsMm,
      surfaceFinish: rfqItem.surfaceFinish,
      quotedBoxes,
      sqftPerBox: rfqItem.sqftPerBox,
      totalSqft: Number((quotedBoxes * rfqItem.sqftPerBox).toFixed(2)),
      unitPricePerBoxBdt,
      unitPricePerSqftBdt,
      lineTotalBdt,
    };
  });

  const subtotalBdt = quoteItems.reduce((acc, i) => acc + i.lineTotalBdt, 0);
  const deliveryFeeBdt = Math.round(params.deliveryFeeBdt);
  const discountBdt = Math.round(params.discountBdt);
  const vatBdt = Math.round(params.vatBdt ?? 0);
  if (![deliveryFeeBdt, discountBdt, vatBdt].every((amount) => Number.isSafeInteger(amount) && amount >= 0)) {
    throw new Error("Transport, VAT and discount must be nonnegative BDT amounts.");
  }
  const totalAmountBdt = subtotalBdt + deliveryFeeBdt + vatBdt - discountBdt;
  if (!Number.isSafeInteger(totalAmountBdt) || totalAmountBdt < 0) {
    throw new Error("Net payable must be a valid nonnegative BDT amount.");
  }

  const validUntil = params.validUntil
    ? new Date(params.validUntil)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  if (!Number.isFinite(validUntil.getTime()) || validUntil.getTime() <= Date.now()) {
    throw new Error("Quote validity must be a future date.");
  }

  const now = new Date().toISOString();
  const quoteNumber = `QT-2026-${5000 + db.quotations.length + 1}-V${nextVersion}`;

  const quotation: Quotation = {
    id: `quo_${randomUUID()}`,
    quoteNumber,
    rfqId: rfq.id,
    organizationId: org.id,
    organizationNameEn: org.tradeNameEn,
    organizationNameBn: org.tradeNameBn,
    issuedByUserId: params.actorUserId,
    issuedByName: actor?.fullName || "Showroom Representative",
    versionNumber: nextVersion,
    items: quoteItems,
    subtotalBdt,
    deliveryFeeBdt,
    discountBdt,
    vatBdt,
    totalAmountBdt,
    validUntil: validUntil.toISOString(),
    paymentTerms:
      params.paymentTerms.trim() ||
      "30% booking advance, 70% upon site delivery before unloading.",
    deliveryTerms:
      params.deliveryTerms.trim() ||
      "Covered pickup dispatch from showroom warehouse within 3-5 working days.",
    status: "SENT",
    createdAt: now,
  };
  quotation.commercialSnapshot = snapshotQuotation(quotation, rfq, org, getCommercialBranch(db.branches, org.id));

  for (const previous of existingQuotes) {
    if (previous.status === "SENT") previous.status = "SUPERSEDED";
  }

  rfq.status = "QUOTED";
  rfq.updatedAt = now;
  db.quotations.unshift(quotation);

  // Notify customer (FR-13)
  db.notifications.unshift({
    id: `ntf_${Date.now()}_${rfq.customerUserId}`,
    userId: rfq.customerUserId,
    category: "QUOTE",
    titleEn: `Quotation Received (${quoteNumber})`,
    titleBn: `কোটেশন পাওয়া গেছে (${quoteNumber})`,
    bodyEn: `${org.tradeNameEn} issued quotation ${quoteNumber} for BDT ${totalAmountBdt.toLocaleString("en-IN")}.`,
    bodyBn: `${org.tradeNameBn} আপনার রিকোয়েস্টের জন্য ${totalAmountBdt.toLocaleString("en-IN")} টাকার কোটেশন পাঠিয়েছে।`,
    linkPath: "/workspace/customer/rfqs",
    isRead: false,
    createdAt: now,
  });

  saveDatabase(db);
  return quotation;
}

// FR-10, Business Rules 5 & 6: Atomic and Idempotent Quote Acceptance -> Order Creation with Snapshots
export function acceptQuotationAndCreateOrder(params: {
  customerUserId: string;
  quotationId: string;
}): { order: Order; idempotentHit: boolean } {
  const db = loadDatabase();
  const quotation = db.quotations.find((q) => q.id === params.quotationId);
  if (!quotation) {
    throw new Error("Quotation not found.");
  }

  const rfq = db.rfqs.find((r) => r.id === quotation.rfqId);
  if (!rfq) {
    throw new Error("Associated RFQ not found.");
  }

  const customer = db.users.find((u) => u.id === params.customerUserId);
  if (!customer?.roles.includes("CUSTOMER") || rfq.customerUserId !== customer.id) {
    throw new Error("Forbidden: Only the customer who submitted the RFQ can accept its quotation.");
  }

  const existingOrder = db.orders.find((o) => o.quotationId === quotation.id);
  if (existingOrder) {
    return { order: existingOrder, idempotentHit: true };
  }
  if (rfq.status === "ACCEPTED" || rfq.status === "CONVERTED" || rfq.status === "CANCELLED"
    || db.orders.some((order) => order.rfqId === rfq.id)) {
    throw new Error("The RFQ is already closed.");
  }

  if (quotation.status !== "SENT") {
    throw new Error(`Quotation cannot be accepted in status ${quotation.status}.`);
  }

  if (!(Date.parse(quotation.validUntil) > Date.now())) {
    quotation.status = "EXPIRED";
    saveDatabase(db);
    throw new Error("Quotation validity period has expired.");
  }

  const organization = db.organizations.find(
    (o) => o.id === quotation.organizationId
  );
  if (!organization) {
    throw new Error("Seller organization missing.");
  }

  const mainBranch = getCommercialBranch(db.branches, organization.id);
  const commercialSnapshot = quotation.commercialSnapshot ?? snapshotQuotation(quotation, rfq, organization, mainBranch);
  const { seller } = commercialSnapshot;

  const now = new Date().toISOString();
  const orderNumber = `ORD-2026-${9000 + db.orders.length + 1}`;
  const orderId = `ord_${randomUUID()}`;

  // Business Rule 6: Self-contained immutable snapshots
  const newOrder: Order = {
    id: orderId,
    orderNumber,
    rfqId: rfq.id,
    quotationId: quotation.id,
    customerUserId: customer.id,
    organizationId: organization.id,
    state: "PENDING_CONFIRMATION",
    currency: "BDT",
    buyerSnapshot: {
      userId: customer.id,
      fullName: customer.fullName,
      phone: customer.phone,
      deliveryDistrict: rfq.deliveryDistrict,
      deliveryAddress: rfq.deliveryAddress,
    },
    sellerSnapshot: {
      organizationId: organization.id,
      tradeNameEn: seller.legalNameEn,
      tradeNameBn: seller.legalNameBn,
      branchName: seller.branchNameEn || "Main Showroom",
      contactPhone: seller.contactPhone,
      tradeLicenseNo: seller.tradeLicenseNo,
    },
    itemSnapshots: quotation.items.map((item) => ({ ...item })),
    pricingSnapshot: {
      subtotalBdt: quotation.subtotalBdt,
      deliveryFeeBdt: quotation.deliveryFeeBdt,
      vatBdt: quotation.vatBdt ?? 0,
      discountBdt: quotation.discountBdt,
      grandTotalBdt: quotation.totalAmountBdt,
      paymentTerms: quotation.paymentTerms,
      deliveryTerms: quotation.deliveryTerms,
    },
    commercialSnapshot,
    deliveryCoordination: {
      mode: "DEALER_ARRANGED",
      pickupBranchName: mainBranch?.nameEn || "Main Showroom",
      dropDistrict: rfq.deliveryDistrict,
      dropAddress: rfq.deliveryAddress,
      vehicleType: "1.5 Ton Covered Pickup (Pending Assignment)",
      driverName: "Pending Assignment",
      driverPhone: "",
      vehicleRegistration: "",
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      packagingVerified: false,
      unloadingNote: rfq.preferredWindow,
      deliveryProofNote: "",
    },
    stateHistory: [
      {
        id: `tr_${Date.now()}`,
        fromState: "INITIAL",
        toState: "PENDING_CONFIRMATION",
        actorUserId: customer.id,
        actorName: customer.fullName,
        actorRole: "CUSTOMER",
        note: `Order created from accepted Quotation ${quotation.quoteNumber}.`,
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  // Atomic state updates
  quotation.status = "ACCEPTED";
  for (const competing of db.quotations) {
    if (competing.rfqId === rfq.id && competing.status === "SENT") competing.status = "DECLINED";
  }
  rfq.status = "ACCEPTED";
  rfq.convertedOrderId = orderId;
  rfq.updatedAt = now;
  db.orders.unshift(newOrder);

  // Write audit log
  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    actorUserId: customer.id,
    actorName: customer.fullName,
    actorRole: "CUSTOMER",
    action: "QUOTE_ACCEPTED_ORDER_CREATED",
    entityType: "ORDER",
    entityId: orderId,
    summary: `Customer accepted ${quotation.quoteNumber} and created ${orderNumber} (BDT ${quotation.totalAmountBdt}).`,
    createdAt: now,
  });

  // Notify Dealer members
  const dealerMembers = db.memberships.filter(
    (m) => m.organizationId === organization.id && m.isActive
  );
  for (const member of dealerMembers) {
    db.notifications.unshift({
      id: `ntf_${Date.now()}_${member.userId}`,
      userId: member.userId,
      category: "ORDER",
      titleEn: `New Order Created (${orderNumber})`,
      titleBn: `নতুন অর্ডার তৈরি হয়েছে (${orderNumber})`,
      bodyEn: `${customer.fullName} accepted ${quotation.quoteNumber}. Please confirm stock and schedule dispatch.`,
      bodyBn: `${customer.fullName} কোটেশন গ্রহণ করেছেন। অনুগ্রহ করে অর্ডার কনফার্ম করুন।`,
      linkPath: "/workspace/dealer/orders",
      isRead: false,
      createdAt: now,
    });
  }

  saveDatabase(db);
  return { order: newOrder, idempotentHit: false };
}

// Section 7 & Business Rule 7: Enforced Order State Machine & Delivery Coordination
const ALLOWED_ORDER_TRANSITIONS: Record<OrderState, OrderState[]> = {
  PENDING_CONFIRMATION: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED", "DISPUTED"],
  PROCESSING: ["READY_FOR_DISPATCH", "CANCELLED", "DISPUTED"],
  READY_FOR_DISPATCH: ["DISPATCHED", "DISPUTED"],
  DISPATCHED: ["DELIVERED", "DISPUTED"],
  DELIVERED: ["COMPLETED", "DISPUTED"],
  COMPLETED: [],
  CANCELLED: [],
  DISPUTED: ["CONFIRMED", "DELIVERED", "COMPLETED", "CANCELLED"],
};

export function transitionOrderState(params: {
  actorUserId: string;
  actorRole: GlobalRole;
  orderId: string;
  toState?: OrderState;
  note?: string;
  deliveryUpdate?: Partial<DeliveryCoordination>;
  dispatchBranchId?: string;
  disputeReason?: string;
  disputeResolutionNote?: string;
}): Order {
  const db = loadDatabase();
  const order = db.orders.find((o) => o.id === params.orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  const actor = db.users.find((u) => u.id === params.actorUserId);
  if (!actor?.roles.includes(params.actorRole)) {
    throw new Error("Forbidden: The requested role is unavailable.");
  }

  // Tenant & Ownership check
  if (params.actorRole === "CUSTOMER" && order.customerUserId !== actor.id) {
    throw new Error("Forbidden: You do not own this customer order.");
  }
  if (params.actorRole === "DEALER") {
    const membership = getUserMembershipForOrg(
      db,
      actor.id,
      order.organizationId
    );
    if (!membership) {
      throw new Error("Forbidden: Order belongs to another dealer organization.");
    }
  }

  const now = new Date().toISOString();

  if (params.deliveryUpdate && params.actorRole === "CUSTOMER") {
    throw new Error("Forbidden: Customers cannot edit dispatch details.");
  }
  if (params.dispatchBranchId && (params.actorRole !== "DEALER" || params.toState !== "CONFIRMED")) {
    throw new Error("Forbidden: Choose a dispatch branch while confirming as the dealer.");
  }
  if (params.dispatchBranchId && order.stockReservation && order.stockReservation.branch.id !== params.dispatchBranchId) {
    throw new Error("The dispatch branch has already been recorded for this order.");
  }

  if (params.toState && params.toState !== order.state) {
    const allowedNext = ALLOWED_ORDER_TRANSITIONS[order.state] || [];
    if (!allowedNext.includes(params.toState)) {
      throw new Error(
        `Invalid order state transition from ${order.state} to ${params.toState}.`
      );
    }
    if (order.state === "DISPUTED" && params.actorRole !== "ADMIN") {
      throw new Error("Forbidden: Only an admin can resolve a dispute.");
    }
    if (params.toState === "COMPLETED" && params.actorRole === "DEALER") {
      throw new Error("Forbidden: Only the customer or an admin can complete an order.");
    }

    // Role-specific guards per Section 7
    if (
      params.actorRole === "CUSTOMER" &&
      !["COMPLETED", "CANCELLED", "DISPUTED", "DELIVERED"].includes(params.toState)
    ) {
      throw new Error(
        "Customers can only confirm delivery/completion, cancel pending orders, or raise a dispute."
      );
    }

    if (
      params.actorRole === "CUSTOMER" &&
      params.toState === "CANCELLED" &&
      order.state !== "PENDING_CONFIRMATION"
    ) {
      throw new Error(
        "Customers can directly cancel an order only while it is PENDING_CONFIRMATION."
      );
    }

    const previousState = order.state;
    if (previousState === "PENDING_CONFIRMATION" && params.toState === "CONFIRMED") {
      order.stockReservation = reserveOrderStock(db, order, params.dispatchBranchId, now);
      order.deliveryCoordination.pickupBranchName = order.stockReservation.branch.nameEn;
    }
    if (params.toState === "CANCELLED") {
      releaseOrderStock(db, order, now);
    }
    order.state = params.toState;

    if (params.toState === "DISPUTED") {
      order.dispute = {
        raisedByUserId: actor.id,
        raisedByRole: params.actorRole,
        reason: params.disputeReason || "Delivery or material discrepancy",
        description: params.note || "Issue reported for platform investigation.",
        status: "OPEN",
        createdAt: now,
      };
    } else if (previousState === "DISPUTED" && order.dispute) {
      order.dispute.status = "RESOLVED";
      order.dispute.resolutionNote =
        params.disputeResolutionNote || params.note || "Resolved by Admin.";
      order.dispute.resolvedAt = now;
    }

    order.stateHistory.push({
      id: `tr_${Date.now()}`,
      fromState: previousState,
      toState: params.toState,
      actorUserId: actor.id,
      actorName: actor.fullName,
      actorRole: params.actorRole,
      note:
        params.note?.trim() ||
        `Order transitioned from ${previousState} to ${params.toState}.`,
      createdAt: now,
    });

    // Notify counterparty
    const notifyTargetUserId =
      params.actorRole === "CUSTOMER"
        ? db.memberships.find((m) => m.organizationId === order.organizationId)
            ?.userId || order.customerUserId
        : order.customerUserId;

    db.notifications.unshift({
      id: `ntf_${Date.now()}_${notifyTargetUserId}`,
      userId: notifyTargetUserId,
      category: "ORDER",
      titleEn: `Order ${order.orderNumber} Updated: ${params.toState}`,
      titleBn: `অর্ডার ${order.orderNumber} আপডেট: ${params.toState}`,
      bodyEn: `${actor.fullName} updated order ${order.orderNumber} to ${params.toState}.`,
      bodyBn: `${actor.fullName} অর্ডার ${order.orderNumber} এর স্ট্যাটাস ${params.toState}-এ পরিবর্তন করেছেন।`,
      linkPath:
        notifyTargetUserId === order.customerUserId
          ? "/workspace/customer/orders"
          : "/workspace/dealer/orders",
      isRead: false,
      createdAt: now,
    });

    if (params.actorRole === "ADMIN" || params.toState === "DISPUTED" || params.toState === "CANCELLED" || params.toState === "CONFIRMED") {
      db.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorUserId: actor.id,
        actorName: actor.fullName,
        actorRole: params.actorRole,
        action: previousState === "DISPUTED" ? "ORDER_DISPUTE_RESOLVED" : `ORDER_STATE_${params.toState}`,
        entityType: "ORDER",
        entityId: order.id,
        summary: `Order ${order.orderNumber} transitioned ${previousState} -> ${params.toState}. Reason: ${params.disputeResolutionNote || params.disputeReason || params.note || "Order lifecycle request."}`,
        createdAt: now,
      });
    }
  }

  if (params.deliveryUpdate) {
    const fields = ["vehicleType", "driverName", "driverPhone", "vehicleRegistration", "scheduledDate", "unloadingNote", "deliveryProofNote"] as const;
    for (const field of fields) {
      const value = params.deliveryUpdate[field];
      if (typeof value === "string") order.deliveryCoordination[field] = value.trim().slice(0, 500);
    }
    const { mode, packagingVerified } = params.deliveryUpdate;
    if (mode === "DEALER_ARRANGED" || mode === "BUYER_PICKUP") order.deliveryCoordination.mode = mode;
    if (typeof packagingVerified === "boolean") order.deliveryCoordination.packagingVerified = packagingVerified;
  }

  order.updatedAt = now;
  saveDatabase(db);
  return order;
}

// FR-06: Dealer creates or updates a product listing
export function upsertDealerListing(params: {
  actorUserId: string;
  listingId?: string;
  categoryId: string;
  branchId?: string;
  sku: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  brand: string;
  materialType: string;
  dimensionsMm: string;
  surfaceFinish: string;
  grade: string;
  waterAbsorption: string;
  peiRating?: string;
  slipResistance?: string;
  sqftPerBox: number;
  piecesPerBox: number;
  pricePerSqftBdt: number;
  minOrderBoxes: number;
  stockBoxes: number;
  servicingDistricts: string[];
  swatchPattern?: SwatchPattern;
  visibilityStatus?: "DRAFT" | "ACTIVE" | "PAUSED";
}): DealerListing {
  const db = loadDatabase();
  const orgContext = getUserOrganization(db, params.actorUserId);
  if (!orgContext) {
    throw new Error("Forbidden: No dealer organization associated with your user account.");
  }

  const { organization } = orgContext;
  const requestedBranch = db.branches.find(
    (branch) => branch.id === params.branchId && branch.organizationId === organization.id
  );
  if (params.branchId && !requestedBranch) {
    throw new Error("Forbidden: The branch does not belong to this dealer.");
  }
  const now = new Date().toISOString();
  const sqftPerBox = Math.max(1, Number(params.sqftPerBox) || 15.5);
  const pricePerSqftBdt = Math.max(1, Number(params.pricePerSqftBdt) || 85);
  const pricePerBoxBdt = Math.round(sqftPerBox * pricePerSqftBdt);
  if (params.peiRating !== undefined && !/^[0-5]?$/.test(params.peiRating)) {
    throw new Error("PEI rating must be between 0 and 5.");
  }
  if (params.slipResistance !== undefined && !/^(R9|R10|R11|R12)?$/.test(params.slipResistance)) {
    throw new Error("Slip resistance must be rated R9 to R12.");
  }

  if (params.listingId) {
    const existing = db.listings.find((l) => l.id === params.listingId);
    if (!existing) {
      throw new Error("Listing not found.");
    }
    if (existing.organizationId !== organization.id) {
      throw new Error("Forbidden: Cannot modify another organization's listing.");
    }

    existing.categoryId = params.categoryId || existing.categoryId;
    existing.sku = params.sku.trim() || existing.sku;
    existing.titleEn = params.titleEn.trim() || existing.titleEn;
    existing.titleBn = params.titleBn.trim() || existing.titleBn;
    existing.descriptionEn = params.descriptionEn.trim() || existing.descriptionEn;
    existing.descriptionBn = params.descriptionBn.trim() || existing.descriptionBn;
    existing.brand = params.brand.trim() || existing.brand;
    existing.materialType = params.materialType.trim() || existing.materialType;
    existing.dimensionsMm = params.dimensionsMm.trim() || existing.dimensionsMm;
    existing.surfaceFinish = params.surfaceFinish.trim() || existing.surfaceFinish;
    existing.grade = params.grade.trim() || existing.grade;
    existing.waterAbsorption = params.waterAbsorption.trim() || existing.waterAbsorption;
    if (params.peiRating !== undefined) existing.peiRating = params.peiRating || undefined;
    if (params.slipResistance !== undefined) existing.slipResistance = params.slipResistance;
    existing.sqftPerBox = sqftPerBox;
    existing.piecesPerBox = Math.max(1, Number(params.piecesPerBox) || 4);
    existing.pricePerSqftBdt = pricePerSqftBdt;
    existing.pricePerBoxBdt = pricePerBoxBdt;
    existing.minOrderBoxes = Math.max(1, Number(params.minOrderBoxes) || 5);
    if (!db.stockLots?.some((lot) => lot.listingId === existing.id) &&
        orgContext.membership.memberRole !== "STAFF" &&
        Number.isSafeInteger(params.stockBoxes) && params.stockBoxes >= 0) {
      existing.stockBoxes = params.stockBoxes;
    }
    if (params.servicingDistricts?.length) {
      existing.servicingDistricts = params.servicingDistricts;
    }
    if (params.visibilityStatus) {
      existing.visibilityStatus = params.visibilityStatus;
    }
    existing.updatedAt = now;
    saveDatabase(db);
    return existing;
  }

  const branch = requestedBranch || db.branches.find((b) => b.organizationId === organization.id);
  if (!branch) throw new Error("Create a branch before adding a listing.");

  const newListing: DealerListing = {
    id: `lst_${Date.now()}`,
    organizationId: organization.id,
    branchId: branch.id,
    categoryId: params.categoryId || "cat_floor",
    sku: params.sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
    titleEn: params.titleEn.trim(),
    titleBn: params.titleBn.trim() || params.titleEn.trim(),
    descriptionEn:
      params.descriptionEn.trim() ||
      "Architectural grade construction material supplied by verified showroom.",
    descriptionBn:
      params.descriptionBn.trim() ||
      "ভেরিফায়েড শোরুম থেকে সরবরাহকৃত উন্নত মানের নির্মাণসামগ্রী।",
    brand: params.brand.trim() || "RAK Ceramics",
    materialType: params.materialType.trim() || "Glazed Vitrified Porcelain",
    dimensionsMm: params.dimensionsMm.trim() || "600x600 mm",
    surfaceFinish: params.surfaceFinish.trim() || "High Gloss",
    grade: params.grade.trim() || "Grade A Premium",
    waterAbsorption: params.waterAbsorption.trim() || "< 0.05%",
    thicknessMm: "9.8 mm",
    peiRating: params.peiRating || undefined,
    slipResistance: params.slipResistance || "",
    applicationArea: "Residential & Commercial",
    sqftPerBox,
    piecesPerBox: Math.max(1, Number(params.piecesPerBox) || 4),
    pricePerSqftBdt,
    pricePerBoxBdt,
    minOrderBoxes: Math.max(1, Number(params.minOrderBoxes) || 5),
    stockBoxes: orgContext.membership.memberRole !== "STAFF" &&
      Number.isSafeInteger(params.stockBoxes) && params.stockBoxes >= 0 ? params.stockBoxes : 0,
    servicingDistricts:
      params.servicingDistricts?.length > 0
        ? params.servicingDistricts
        : [organization.primaryDistrict],
    swatchPattern: params.swatchPattern || "carrara-marble",
    variants: [],
    visibilityStatus: params.visibilityStatus || "ACTIVE",
    moderationStatus: "PENDING_MODERATION",
    createdAt: now,
    updatedAt: now,
  };

  db.listings.unshift(newListing);
  saveDatabase(db);
  return newListing;
}

export function upsertDealerStockLot(params: Parameters<typeof setStockLot>[2] & { actorUserId: string }): ReturnType<typeof setStockLot> {
  const db = loadDatabase();
  const actor = db.users.find((user) => user.id === params.actorUserId && user.roles.includes("DEALER"));
  const context = actor && getUserOrganization(db, actor.id);
  if (!actor || !context || context.membership.memberRole === "STAFF") {
    throw new Error("Forbidden: Stock allocation requires an owner or manager.");
  }

  const now = new Date().toISOString();
  const lot = setStockLot(db, context.organization.id, params, now);
  db.auditLogs.unshift({
    id: `aud_${randomUUID()}`,
    actorUserId: actor.id,
    actorName: actor.fullName,
    actorRole: "DEALER",
    action: "STOCK_LOT_UPDATED",
    entityType: "LISTING",
    entityId: lot.listingId,
    summary: `Branch ${lot.branchId}, batch ${lot.batchCode}, shade ${lot.shadeCode}, caliber ${lot.caliberMm} mm: ${params.expectedAvailableBoxes ?? 0} -> ${lot.availableBoxes} available boxes.`,
    createdAt: now,
  });
  saveDatabase(db);
  return lot;
}

// FR-03 & FR-04: Update Dealer Organization, Branches, Staff, and Verification Submission
export function updateDealerOrganization(params: {
  actorUserId: string;
  tradeNameEn?: string;
  tradeNameBn?: string;
  descriptionEn?: string;
  descriptionBn?: string;
  primaryDistrict?: string;
  contactPhone?: string;
  tradeLicenseNo?: string;
  tinNumber?: string;
  ownerNid?: string;
  submitForVerification?: boolean;
  newBranch?: {
    nameEn: string;
    nameBn: string;
    district: string;
    addressEn: string;
    addressBn: string;
    contactPhone: string;
  };
  newStaffMember?: {
    phone: string;
    fullName: string;
    memberRole: OrgMemberRole;
  };
}) {
  const db = loadDatabase();
  const orgContext = getUserOrganization(db, params.actorUserId);
  if (!orgContext) {
    throw new Error("No dealer organization found for user.");
  }

  const { organization, membership } = orgContext;
  if (membership.memberRole === "STAFF") {
    throw new Error("Forbidden: Only Organization Owners or Managers can modify organization settings.");
  }
  if (params.newStaffMember && (
    membership.memberRole !== "OWNER" ||
    !["MANAGER", "STAFF"].includes(params.newStaffMember.memberRole)
  )) {
    throw new Error("Forbidden: Only owners can invite managers or staff.");
  }
  if (params.newStaffMember && !isValidBangladeshPhone(params.newStaffMember.phone)) {
    throw new Error("Enter a valid Bangladesh mobile number.");
  }
  const credentialsEditable = membership.memberRole === "OWNER" && canSubmitVerification(organization.verificationStatus);
  const credentialFields = ["tradeNameEn", "tradeNameBn", "tradeLicenseNo", "tinNumber", "ownerNid"] as const;
  for (const field of credentialFields) {
    if (params[field] !== undefined && typeof params[field] !== "string") {
      throw new Error("Verification fields must be text.");
    }
    if (!credentialsEditable && params[field] !== undefined && params[field].trim() !== (organization[field] ?? "").trim()) {
      throw new Error("Forbidden: Credential changes require an owner and an editable verification state.");
    }
  }
  if (params.submitForVerification) {
    if (!credentialsEditable) throw new Error("Forbidden: This organization cannot submit credentials in its current state.");
    if (!(params.tradeLicenseNo ?? organization.tradeLicenseNo).trim() || !(params.tinNumber ?? organization.tinNumber).trim()) {
      throw new Error("Trade License Number and TIN Number are required to submit for verification.");
    }
  }

  const now = new Date().toISOString();

  if (params.tradeNameEn) organization.tradeNameEn = params.tradeNameEn.trim();
  if (params.tradeNameBn) organization.tradeNameBn = params.tradeNameBn.trim();
  if (params.descriptionEn) organization.descriptionEn = params.descriptionEn.trim();
  if (params.descriptionBn) organization.descriptionBn = params.descriptionBn.trim();
  if (params.primaryDistrict) organization.primaryDistrict = params.primaryDistrict.trim();
  if (params.contactPhone) organization.contactPhone = params.contactPhone.trim();
  if (params.tradeLicenseNo !== undefined)
    organization.tradeLicenseNo = params.tradeLicenseNo.trim();
  if (params.tinNumber !== undefined)
    organization.tinNumber = params.tinNumber.trim();
  if (params.ownerNid !== undefined)
    organization.ownerNid = params.ownerNid.trim();

  if (params.submitForVerification) {
    organization.verificationStatus = "SUBMITTED";
    organization.moderationNote = "Submitted by dealer owner for Admin verification.";
  }

  if (params.newBranch && params.newBranch.nameEn.trim()) {
    db.branches.push({
      id: `brn_${Date.now()}`,
      organizationId: organization.id,
      nameEn: params.newBranch.nameEn.trim(),
      nameBn: params.newBranch.nameBn.trim() || params.newBranch.nameEn.trim(),
      district: params.newBranch.district || organization.primaryDistrict,
      addressEn: params.newBranch.addressEn.trim(),
      addressBn:
        params.newBranch.addressBn.trim() || params.newBranch.addressEn.trim(),
      contactPhone:
        params.newBranch.contactPhone.trim() || organization.contactPhone,
      isMainBranch: false,
    });
  }

  if (params.newStaffMember && params.newStaffMember.phone.trim()) {
    const normalizedPhone = normalizeBangladeshPhone(params.newStaffMember.phone);
    let staffUser = db.users.find((u) => u.phone === normalizedPhone);
    if (!staffUser) {
      staffUser = {
        id: `usr_staff_${Date.now()}`,
        phone: normalizedPhone,
        fullName: params.newStaffMember.fullName.trim() || "Showroom Staff",
        roles: ["DEALER"],
        activeRole: "DEALER",
        preferredLocale: "bn",
        createdAt: now,
      };
      db.users.push(staffUser);
    } else if (!staffUser.roles.includes("DEALER")) {
      staffUser.roles.push("DEALER");
    }

    const existingMem = db.memberships.find(
      (m) => m.organizationId === organization.id && m.userId === staffUser!.id
    );
    if (!existingMem) {
      db.memberships.push({
        id: `mem_${Date.now()}`,
        organizationId: organization.id,
        userId: staffUser.id,
        userPhone: staffUser.phone,
        userName: staffUser.fullName,
        memberRole: params.newStaffMember.memberRole || "STAFF",
        isActive: true,
        createdAt: now,
      });
    }
  }

  organization.updatedAt = now;
  saveDatabase(db);
  return {
    organization,
    branches: db.branches.filter((b) => b.organizationId === organization.id),
    memberships: db.memberships.filter(
      (m) => m.organizationId === organization.id
    ),
  };
}

// FR-14 & Business Rule 9: Admin Verification and Listing Moderation with Audit Logging
export function performAdminModeration(params: {
  adminUserId: string;
  targetType: "ORGANIZATION" | "LISTING";
  targetId: string;
  decision: string;
  note?: string;
}): AuditLog {
  const db = loadDatabase();
  const admin = db.users.find((u) => u.id === params.adminUserId);
  if (!admin || !admin.roles.includes("ADMIN")) {
    throw new Error("Forbidden: Admin privileges required.");
  }

  const now = new Date().toISOString();

  if (params.targetType === "ORGANIZATION") {
    const org = db.organizations.find((o) => o.id === params.targetId);
    if (!org) {
      throw new Error("Organization not found.");
    }
    const status = availableVerificationDecisions(org.verificationStatus).find((decision) => decision === params.decision);
    if (!status) throw new Error("Invalid verification transition.");
    const reason = params.note?.trim();
    if (!reason) throw new Error("A verification decision reason is required.");
    if (status === "VERIFIED" && (!org.tradeLicenseNo.trim() || !org.tinNumber.trim())) {
      throw new Error("Trade license and TIN are required before verification.");
    }
    const previousStatus = org.verificationStatus;
    org.verificationStatus = status;
    if (status === "VERIFIED") {
      org.verifiedAt = now;
    }
    org.moderationNote = reason.slice(0, 500);
    org.updatedAt = now;

    // Notify dealer owner
    const ownerMem = db.memberships.find(
      (m) => m.organizationId === org.id && m.memberRole === "OWNER"
    );
    if (ownerMem) {
      db.notifications.unshift({
        id: `ntf_${Date.now()}_${ownerMem.userId}`,
        userId: ownerMem.userId,
        category: "VERIFICATION",
        titleEn: "Showroom verification updated",
        titleBn: "শোরুমের যাচাইয়ের অবস্থা পরিবর্তিত হয়েছে",
        bodyEn: `${org.tradeNameEn}: ${getVerificationLabel(status, "en")}`,
        bodyBn: `${org.tradeNameBn}: ${getVerificationLabel(status, "bn")}`,
        linkPath: "/workspace/dealer/organization",
        isRead: false,
        createdAt: now,
      });
    }

    const auditEntry: AuditLog = {
      id: `aud_${randomUUID()}`,
      actorUserId: admin.id,
      actorName: admin.fullName,
      actorRole: "ADMIN",
      action: `DEALER_VERIFICATION_${status}`,
      entityType: "ORGANIZATION",
      entityId: org.id,
      summary: `Changed ${org.tradeNameEn} (${org.id}) verification from ${previousStatus} to ${status}. Reason: ${org.moderationNote}`,
      createdAt: now,
    };
    db.auditLogs.unshift(auditEntry);
    saveDatabase(db);
    return auditEntry;
  }

  if (params.targetType !== "LISTING" || (params.decision !== "APPROVED" && params.decision !== "REJECTED")) {
    throw new Error("Invalid listing moderation decision.");
  }
  const listing = db.listings.find((l) => l.id === params.targetId);
  if (!listing) {
    throw new Error("Listing not found.");
  }
  const modStatus = params.decision;
  listing.moderationStatus = modStatus;
  listing.moderationNote =
    params.note?.trim().slice(0, 500) || `Listing moderation set to ${modStatus}.`;
  listing.updatedAt = now;

  const auditEntry: AuditLog = {
    id: `aud_${randomUUID()}`,
    actorUserId: admin.id,
    actorName: admin.fullName,
    actorRole: "ADMIN",
    action: `LISTING_MODERATION_${modStatus}`,
    entityType: "LISTING",
    entityId: listing.id,
    summary: `Set listing ${listing.sku} (${listing.titleEn}) moderation status to ${modStatus}. Reason: ${listing.moderationNote}`,
    createdAt: now,
  };
  db.auditLogs.unshift(auditEntry);
  saveDatabase(db);
  return auditEntry;
}
