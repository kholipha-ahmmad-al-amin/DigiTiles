import type { PreferredCrew, ServiceDirectory } from "./service-directory";

export type Locale = "bn" | "en";

export type GlobalRole = "CUSTOMER" | "DEALER" | "ADMIN";

export type OrgMemberRole = "OWNER" | "MANAGER" | "STAFF";

export type VerificationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED"
  | "EXPIRED";

export type ListingVisibility = "DRAFT" | "ACTIVE" | "PAUSED";

export type ModerationStatus = "PENDING_MODERATION" | "APPROVED" | "REJECTED";

export type RfqStatus = "OPEN" | "QUOTED" | "ACCEPTED" | "CONVERTED" | "CANCELLED";

export type QuotationStatus =
  | "SENT"
  | "ACCEPTED"
  | "SUPERSEDED"
  | "DECLINED"
  | "EXPIRED"
  | "REJECTED";

export type OrderState =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY_FOR_DISPATCH"
  | "DISPATCHED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export type SwatchPattern =
  | "carrara-marble"
  | "concrete-matt"
  | "terracotta-rustic"
  | "travertine-warm"
  | "onyx-gloss"
  | "wood-oak-plank"
  | "mosaic-teal"
  | "granite-speckle"
  | "sanitary-porcelain"
  | "adhesive-mortar";

export interface User {
  id: string;
  phone: string;
  fullName: string;
  email?: string;
  firebaseUid?: string;
  authProvider?: "OTP" | "GOOGLE" | "EMAIL" | "PILOT";
  roles: GlobalRole[];
  activeRole: GlobalRole;
  preferredLocale: Locale;
  createdAt: string;
}

export interface OtpChallenge {
  id: string;
  phone: string;
  code?: string;
  codeHash?: string;
  attempts: number;
  expiresAt: string;
  consumedAt?: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  nameEn: string;
  nameBn: string;
  district: string;
  addressEn: string;
  addressBn: string;
  contactPhone: string;
  isMainBranch: boolean;
}

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  userPhone: string;
  userName: string;
  memberRole: OrgMemberRole;
  isActive: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  slug: string;
  tradeNameEn: string;
  tradeNameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  primaryDistrict: string;
  contactPhone: string;
  verificationStatus: VerificationStatus;
  tradeLicenseNo: string;
  tinNumber: string;
  ownerNid: string;
  verifiedAt?: string;
  moderationNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
}

export interface ProductVariant {
  id: string;
  labelEn: string;
  labelBn: string;
  dimensionsMm: string;
  surfaceFinish: string;
  priceDeltaBdt: number;
}

export interface DealerListing {
  id: string;
  organizationId: string;
  branchId: string;
  categoryId: string;
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
  thicknessMm: string;
  slipResistance: string;
  peiRating?: string;
  applicationArea: string;
  sqftPerBox: number;
  piecesPerBox: number;
  pricePerSqftBdt: number;
  pricePerBoxBdt: number;
  minOrderBoxes: number;
  stockBoxes: number;
  servicingDistricts: string[];
  swatchPattern: SwatchPattern;
  variants: ProductVariant[];
  visibilityStatus: ListingVisibility;
  moderationStatus: ModerationStatus;
  moderationNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockLot {
  id: string;
  listingId: string;
  branchId: string;
  batchCode: string;
  shadeCode: string;
  caliberMm: number;
  availableBoxes: number;
  updatedAt: string;
}

export interface OrderStockReservation {
  branch: Pick<Branch, "id" | "nameEn" | "nameBn" | "addressEn" | "addressBn">;
  items: {
    listingId: string;
    sku: string;
    lotId?: string;
    batchCode?: string;
    shadeCode?: string;
    caliberMm?: number;
    boxes: number;
  }[];
  reservedAt: string;
  releasedAt?: string;
}

export interface RfqItem {
  listingId: string;
  categoryId?: string;
  sku: string;
  titleEn: string;
  titleBn: string;
  dimensionsMm: string;
  surfaceFinish: string;
  requestedBoxes: number;
  sqftPerBox: number;
  totalSqft: number;
  indicativePricePerBoxBdt: number;
  indicativePricePerSqftBdt: number;
}

export interface Rfq {
  id: string;
  rfqNumber: string;
  customerUserId: string;
  customerName: string;
  customerPhone: string;
  organizationId: string;
  organizationNameEn: string;
  organizationNameBn: string;
  deliveryDistrict: string;
  deliveryAddress: string;
  preferredWindow: string;
  projectNotes: string;
  status: RfqStatus;
  convertedOrderId?: string;
  items: RfqItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  listingId: string;
  categoryId?: string;
  sku: string;
  titleEn: string;
  titleBn: string;
  dimensionsMm: string;
  surfaceFinish: string;
  quotedBoxes: number;
  sqftPerBox: number;
  totalSqft: number;
  unitPricePerBoxBdt: number;
  unitPricePerSqftBdt: number;
  lineTotalBdt: number;
}

export interface CommercialSnapshot {
  quoteNumber: string;
  issuedAt: string;
  validUntil: string;
  buyer: {
    fullName: string;
    deliveryDistrict: string;
    deliveryAddress: string;
  };
  seller: {
    organizationId: string;
    legalNameEn: string;
    legalNameBn: string;
    tradeLicenseNo: string;
    tinNumber: string;
    contactPhone: string;
    branchNameEn: string;
    branchNameBn: string;
    branchAddressEn: string;
    branchAddressBn: string;
    verifiedAt?: string;
  };
  items: QuotationItem[];
  pricing: {
    subtotalBdt: number;
    deliveryFeeBdt: number;
    vatBdt: number;
    discountBdt: number;
    grandTotalBdt: number;
    paymentTerms: string;
    deliveryTerms: string;
  };
  verificationReference: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  rfqId: string;
  organizationId: string;
  organizationNameEn: string;
  organizationNameBn: string;
  issuedByUserId: string;
  issuedByName: string;
  versionNumber: number;
  items: QuotationItem[];
  subtotalBdt: number;
  deliveryFeeBdt: number;
  vatBdt?: number;
  discountBdt: number;
  totalAmountBdt: number;
  validUntil: string;
  paymentTerms: string;
  deliveryTerms: string;
  status: QuotationStatus;
  createdAt: string;
  commercialSnapshot?: CommercialSnapshot;
}

export interface OrderStateTransition {
  id: string;
  fromState: OrderState | "INITIAL";
  toState: OrderState;
  actorUserId: string;
  actorName: string;
  actorRole: GlobalRole;
  note: string;
  createdAt: string;
}

export interface DeliveryCoordination {
  mode: "DEALER_ARRANGED" | "BUYER_PICKUP";
  pickupBranchName: string;
  dropDistrict: string;
  dropAddress: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  vehicleRegistration: string;
  scheduledDate: string;
  packagingVerified: boolean;
  unloadingNote: string;
  deliveryProofNote: string;
}

export interface OrderDispute {
  raisedByUserId: string;
  raisedByRole: GlobalRole;
  reason: string;
  description: string;
  status: "OPEN" | "RESOLVED";
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  rfqId: string;
  quotationId: string;
  customerUserId: string;
  organizationId: string;
  state: OrderState;
  currency: "BDT";
  preferredCrew?: PreferredCrew;
  buyerSnapshot: {
    userId: string;
    fullName: string;
    phone: string;
    deliveryDistrict: string;
    deliveryAddress: string;
  };
  sellerSnapshot: {
    organizationId: string;
    tradeNameEn: string;
    tradeNameBn: string;
    branchName: string;
    contactPhone: string;
    tradeLicenseNo: string;
  };
  itemSnapshots: QuotationItem[];
  pricingSnapshot: {
    subtotalBdt: number;
    deliveryFeeBdt: number;
    vatBdt?: number;
    discountBdt: number;
    grandTotalBdt: number;
    paymentTerms: string;
    deliveryTerms: string;
  };
  commercialSnapshot?: CommercialSnapshot;
  deliveryCoordination: DeliveryCoordination;
  stockReservation?: OrderStockReservation;
  dispute?: OrderDispute;
  stateHistory: OrderStateTransition[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  category: "RFQ" | "QUOTE" | "ORDER" | "VERIFICATION";
  titleEn: string;
  titleBn: string;
  bodyEn: string;
  bodyBn: string;
  linkPath: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: GlobalRole;
  action: string;
  entityType: "ORGANIZATION" | "LISTING" | "ORDER" | "RFQ" | "USER";
  entityId: string;
  summary: string;
  createdAt: string;
}

export interface RuntimeDatabase {
  serviceDirectory?: ServiceDirectory;
  users: User[];
  otpChallenges: OtpChallenge[];
  organizations: Organization[];
  branches: Branch[];
  memberships: OrganizationMembership[];
  categories: Category[];
  listings: DealerListing[];
  stockLots?: StockLot[];
  rfqs: Rfq[];
  quotations: Quotation[];
  orders: Order[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}
