import { createHash } from "node:crypto";
import type { Branch, CommercialSnapshot, Organization, Quotation, Rfq } from "./types";

export function getCommercialBranch(branches: Branch[], organizationId: string) {
  return branches.find((branch) => branch.organizationId === organizationId && branch.isMainBranch)
    ?? branches.find((branch) => branch.organizationId === organizationId);
}

export function snapshotQuotation(
  quotation: Quotation,
  rfq: Rfq,
  organization: Organization,
  branch?: Branch
): CommercialSnapshot {
  const content: Omit<CommercialSnapshot, "verificationReference"> = {
    quoteNumber: quotation.quoteNumber,
    issuedAt: quotation.createdAt,
    validUntil: quotation.validUntil,
    buyer: {
      fullName: rfq.customerName,
      deliveryDistrict: rfq.deliveryDistrict,
      deliveryAddress: rfq.deliveryAddress,
    },
    seller: {
      organizationId: organization.id,
      legalNameEn: quotation.organizationNameEn,
      legalNameBn: quotation.organizationNameBn,
      tradeLicenseNo: organization.tradeLicenseNo,
      tinNumber: organization.tinNumber,
      contactPhone: organization.contactPhone,
      branchNameEn: branch?.nameEn ?? "",
      branchNameBn: branch?.nameBn ?? "",
      branchAddressEn: branch?.addressEn ?? "",
      branchAddressBn: branch?.addressBn ?? "",
      verifiedAt: organization.verifiedAt,
    },
    items: quotation.items.map((item) => ({ ...item })),
    pricing: {
      subtotalBdt: quotation.subtotalBdt,
      deliveryFeeBdt: quotation.deliveryFeeBdt,
      vatBdt: quotation.vatBdt ?? 0,
      discountBdt: quotation.discountBdt,
      grandTotalBdt: quotation.totalAmountBdt,
      paymentTerms: quotation.paymentTerms,
      deliveryTerms: quotation.deliveryTerms,
    },
  };
  return {
    ...content,
    verificationReference: createHash("sha256").update(JSON.stringify(content)).digest("hex"),
  };
}
