import { marketplaceGuides } from "@/lib/marketplace-guides";
import { getVerifiedServices } from "@/lib/service-store";
import { queryDiscoverableListings } from "@/lib/store";
import type { DealerListing } from "@/lib/types";

export type KnowledgeKind = "listing" | "showroom" | "guide" | "service" | "estimate";

export type KnowledgeChunk = {
  id: string;
  kind: KnowledgeKind;
  title: string;
  href: string;
  text: string;
};

type PublicListing = DealerListing & {
  organization?: {
    id: string;
    tradeNameEn: string;
    tradeNameBn: string;
    descriptionEn: string;
    descriptionBn: string;
    primaryDistrict: string;
  };
  branch?: { nameEn: string; nameBn: string; district: string };
  category?: { nameEn: string; nameBn: string };
};

export function loadPublicListings(): PublicListing[] {
  const items: PublicListing[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const batch = queryDiscoverableListings({ page, pageSize: 50, sort: "newest" });
    items.push(...(batch.items as PublicListing[]));
    totalPages = batch.totalPages;
    page += 1;
  } while (page <= totalPages && page < 20);
  return items;
}

function listingText(listing: PublicListing): string {
  const showroom = listing.organization;
  const branch = listing.branch;
  const variants = listing.variants
    .map((variant) => `${variant.labelEn} / ${variant.labelBn}, ${variant.dimensionsMm}, ${variant.surfaceFinish}, price difference BDT ${variant.priceDeltaBdt}`)
    .join("; ");
  return [
    `Published listing ${listing.sku}.`,
    `English title: ${listing.titleEn}.`,
    `Bangla title: ${listing.titleBn}.`,
    `Brand: ${listing.brand}. Material: ${listing.materialType}. Category: ${listing.category?.nameEn || listing.categoryId} / ${listing.category?.nameBn || ""}.`,
    `Dimensions: ${listing.dimensionsMm}. Finish: ${listing.surfaceFinish}. Grade: ${listing.grade}.`,
    `Water absorption: ${listing.waterAbsorption}. Thickness: ${listing.thicknessMm}. Slip resistance: ${listing.slipResistance}. PEI: ${listing.peiRating || "not published"}.`,
    `Application: ${listing.applicationArea}.`,
    `Coverage: ${listing.sqftPerBox} sq.ft per box, ${listing.piecesPerBox} pieces per box.`,
    `Indicative asking price, not a confirmed quotation: BDT ${listing.pricePerSqftBdt} per sq.ft, BDT ${listing.pricePerBoxBdt} per box. Minimum order ${listing.minOrderBoxes} boxes.`,
    `Servicing districts: ${listing.servicingDistricts.join(", ")}.`,
    showroom
      ? `Verified showroom: ${showroom.tradeNameEn} / ${showroom.tradeNameBn}, ${showroom.primaryDistrict}. ${showroom.descriptionEn} ${showroom.descriptionBn}`
      : "",
    branch ? `Dispatch branch name: ${branch.nameEn} / ${branch.nameBn}, ${branch.district}.` : "",
    variants ? `Published variants: ${variants}.` : "",
    "A buyer confirms the payable amount by requesting an itemized BDT quotation.",
  ].filter(Boolean).join(" ");
}

function listingContext(listing: PublicListing): string {
  const showroom = listing.organization;
  const place = showroom
    ? `${showroom.tradeNameEn} in ${showroom.primaryDistrict}`
    : listing.servicingDistricts[0] || "Bangladesh";
  return `Context: ${listing.titleEn} is a published ${listing.category?.nameEn || "catalogue"} record from ${place}. The next sentences are that record's own fields.`;
}

export function buildKnowledgeCorpus(): KnowledgeChunk[] {
  const listings = loadPublicListings();
  const chunks: KnowledgeChunk[] = [];
  for (const listing of listings) {
    const context = listingContext(listing);
    const full = listingText(listing);
    const href = `/marketplace/${listing.id}`;
    chunks.push({
      id: `listing:${listing.id}`,
      kind: "listing",
      title: listing.titleEn,
      href,
      text: `${context} ${full}`,
    });
    chunks.push({
      id: `listing:${listing.id}:spec`,
      kind: "listing",
      title: `${listing.titleEn} specifications`,
      href,
      text: `${context} Brand ${listing.brand}. Material ${listing.materialType}. Dimensions ${listing.dimensionsMm}. Finish ${listing.surfaceFinish}. Grade ${listing.grade}. Water absorption ${listing.waterAbsorption}. Thickness ${listing.thicknessMm}. Slip resistance ${listing.slipResistance}. Application ${listing.applicationArea}.`,
    });
    chunks.push({
      id: `listing:${listing.id}:price`,
      kind: "listing",
      title: `${listing.titleEn} price`,
      href,
      text: `${context} Indicative asking price, not a confirmed quotation: BDT ${listing.pricePerSqftBdt} per sq.ft and BDT ${listing.pricePerBoxBdt} per box. Coverage ${listing.sqftPerBox} sq.ft per box. Minimum order ${listing.minOrderBoxes} boxes. Servicing districts: ${listing.servicingDistricts.join(", ")}.`,
    });
  }

  const seenShowrooms = new Set<string>();
  for (const listing of listings) {
    const showroom = listing.organization;
    if (!showroom || seenShowrooms.has(showroom.id)) continue;
    seenShowrooms.add(showroom.id);
    chunks.push({
      id: `showroom:${showroom.id}`,
      kind: "showroom",
      title: showroom.tradeNameEn,
      href: `/marketplace?organizationId=${showroom.id}`,
      text: `Verified showroom ${showroom.tradeNameEn} / ${showroom.tradeNameBn} in ${showroom.primaryDistrict}. ${showroom.descriptionEn} ${showroom.descriptionBn} Public listings from this showroom can be filtered in the marketplace. Prices there are indicative asking prices.`,
    });
  }

  for (const [slug, guide] of Object.entries(marketplaceGuides)) {
    chunks.push({
      id: `guide:${slug}:intro`,
      kind: "guide",
      title: guide.title.en,
      href: `/guides/${slug}`,
      text: `Context: introduction of the DigiTiles guide ${guide.title.en}. ${guide.intro.en} ${guide.intro.bn}`,
    });
    guide.steps.forEach((step, index) => {
      chunks.push({
        id: `guide:${slug}:step:${index + 1}`,
        kind: "guide",
        title: `${guide.title.en} step ${index + 1}`,
        href: `/guides/${slug}`,
        text: `Context: step ${index + 1} of the DigiTiles guide ${guide.title.en}. ${step.en} ${step.bn}`,
      });
    });
    guide.faq.forEach((item, index) => {
      chunks.push({
        id: `guide:${slug}:faq:${index + 1}`,
        kind: "guide",
        title: `${guide.title.en} question ${index + 1}`,
        href: `/guides/${slug}`,
        text: `Context: question ${index + 1} of the DigiTiles guide ${guide.title.en}. Question: ${item.question.en} ${item.question.bn} Answer: ${item.answer.en} ${item.answer.bn}`,
      });
    });
  }

  const services = getVerifiedServices();
  for (const crew of services.crews) {
    const unit = crew.rateUnit === "SQFT" ? "per sq.ft" : "per day";
    chunks.push({
      id: `crew:${crew.id}`,
      kind: "service",
      title: crew.nameEn,
      href: "/services",
      text: `Verified installation crew ${crew.nameEn} / ${crew.nameBn}. Districts: ${crew.districts.join(", ")}. Specialties: ${crew.specialties.join(", ")}. Published labour rate BDT ${crew.rateBdt} ${unit}. Completed projects recorded on the directory: ${crew.completedProjects}. This rate is a directory figure, not a work order.`,
    });
  }
  for (const fleet of services.transport) {
    const rates = Object.entries(fleet.rates)
      .map(([district, rate]) => rate ? `${district}: base BDT ${rate.baseBdt} plus BDT ${rate.perKmBdt} per km` : "")
      .filter(Boolean)
      .join("; ");
    chunks.push({
      id: `transport:${fleet.id}`,
      kind: "service",
      title: fleet.nameEn,
      href: "/services",
      text: `Verified transport ${fleet.nameEn} / ${fleet.nameBn}. Vehicle class ${fleet.vehicleType}. Districts: ${fleet.districts.join(", ")}. Directory fare estimates: ${rates}. A directory fare is not a dealer delivery quotation.`,
    });
  }

  return chunks;
}
