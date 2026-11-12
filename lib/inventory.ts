import { randomUUID } from "crypto";
import type { DealerListing, Order, OrderStockReservation, RuntimeDatabase, StockLot } from "./types";

export type StockErrorCode =
  | "INVALID_STOCK_LOT"
  | "STOCK_CHANGED"
  | "DISPATCH_BRANCH_REQUIRED"
  | "INSUFFICIENT_BRANCH_STOCK"
  | "SINGLE_LOT_REQUIRED";

export class StockError extends Error {
  constructor(public readonly code: StockErrorCode) {
    super(code);
  }
}

export function unallocatedBoxes(listing: DealerListing, lots: StockLot[]): number {
  const allocated = lots.filter((lot) => lot.listingId === listing.id)
    .reduce((total, lot) => total + lot.availableBoxes, 0);
  return Math.max(0, Math.floor(listing.stockBoxes) - allocated);
}

export function setStockLot(
  db: RuntimeDatabase,
  organizationId: string,
  input: {
    listingId: string;
    branchId: string;
    batchCode: string;
    shadeCode: string;
    caliberMm: number;
    availableBoxes: number;
    expectedAvailableBoxes?: number;
  },
  now: string
): StockLot {
  const listing = db.listings.find((item) => item.id === input.listingId && item.organizationId === organizationId);
  const branch = db.branches.find((item) => item.id === input.branchId && item.organizationId === organizationId);
  if (!listing || !branch) throw new Error("Forbidden: The branch or listing does not belong to this dealer.");

  const batchCode = typeof input.batchCode === "string" ? input.batchCode.trim().toUpperCase() : "";
  const shadeCode = typeof input.shadeCode === "string" ? input.shadeCode.trim().toUpperCase() : "";
  const { caliberMm, availableBoxes, expectedAvailableBoxes } = input;
  if (!/^[A-Z0-9][A-Z0-9 ._/-]{0,39}$/.test(batchCode) ||
      !/^[A-Z0-9][A-Z0-9 ._/-]{0,39}$/.test(shadeCode) ||
      !Number.isFinite(caliberMm) || caliberMm <= 0 || caliberMm > 10000 ||
      !Number.isSafeInteger(availableBoxes) || availableBoxes < 0 || availableBoxes > 1000000) {
    throw new StockError("INVALID_STOCK_LOT");
  }

  const lots = db.stockLots ?? [];
  const existing = lots.find((lot) =>
    lot.listingId === listing.id && lot.branchId === branch.id &&
    lot.batchCode === batchCode && lot.shadeCode === shadeCode && lot.caliberMm === caliberMm
  );
  if (existing?.availableBoxes !== expectedAvailableBoxes) throw new StockError("STOCK_CHANGED");

  const lot: StockLot = existing ?? {
    id: `lot_${randomUUID()}`, listingId: listing.id, branchId: branch.id,
    batchCode, shadeCode, caliberMm, availableBoxes: 0, updatedAt: now,
  };
  const change = availableBoxes - lot.availableBoxes;
  // Allocate existing boxes first. Only a quantity beyond unallocated stock is a receipt.
  const movedFromUnallocated = Math.min(Math.max(0, change), unallocatedBoxes(listing, lots));
  listing.stockBoxes = listing.stockBoxes + change - movedFromUnallocated;
  lot.availableBoxes = availableBoxes;
  lot.updatedAt = now;
  if (!existing) lots.push(lot);
  db.stockLots = lots;
  return lot;
}

export function reserveOrderStock(
  db: RuntimeDatabase,
  order: Order,
  dispatchBranchId: string | undefined,
  now: string
): OrderStockReservation {
  const lots = db.stockLots ?? [];
  const requirements = new Map<string, { sku: string; boxes: number; sqft: number; categoryId?: string }>();
  for (const item of order.itemSnapshots) {
    if (!Number.isSafeInteger(item.quotedBoxes) || item.quotedBoxes <= 0) {
      throw new StockError("INSUFFICIENT_BRANCH_STOCK");
    }
    const previous = requirements.get(item.listingId);
    requirements.set(item.listingId, {
      sku: item.sku,
      boxes: (previous?.boxes ?? 0) + item.quotedBoxes,
      sqft: (previous?.sqft ?? 0) + item.quotedBoxes * item.sqftPerBox,
      categoryId: item.categoryId,
    });
  }

  const primaryListing = db.listings.find((item) =>
    item.id === order.itemSnapshots[0]?.listingId && item.organizationId === order.organizationId
  );
  const branch = db.branches.find((item) =>
    item.id === (dispatchBranchId ?? primaryListing?.branchId) && item.organizationId === order.organizationId
  );
  if (!branch) throw new StockError("DISPATCH_BRANCH_REQUIRED");

  const items: OrderStockReservation["items"] = [];
  const adjustments: { listing: DealerListing; boxes: number; lot?: StockLot }[] = [];
  for (const [listingId, requirement] of Array.from(requirements)) {
    const listing = db.listings.find((item) => item.id === listingId && item.organizationId === order.organizationId);
    if (!listing) throw new StockError("INSUFFICIENT_BRANCH_STOCK");
    const { boxes, sku } = requirement;
    const lot = lots.filter((item) =>
      item.branchId === branch.id && item.listingId === listingId && item.availableBoxes >= boxes
    ).sort((a, b) => a.availableBoxes - b.availableBoxes || a.id.localeCompare(b.id))[0];

    if (lot) {
      items.push({
        listingId, sku, boxes, lotId: lot.id,
        batchCode: lot.batchCode, shadeCode: lot.shadeCode, caliberMm: lot.caliberMm,
      });
    } else {
      const trackableTile = !["cat_sanitary", "cat_adhesive"].includes(requirement.categoryId ?? listing.categoryId);
      if (trackableTile && requirement.sqft >= 1000) throw new StockError("SINGLE_LOT_REQUIRED");
      if (listing.branchId !== branch.id || unallocatedBoxes(listing, lots) < boxes) {
        throw new StockError("INSUFFICIENT_BRANCH_STOCK");
      }
      items.push({ listingId, sku, boxes });
    }
    adjustments.push({ listing, boxes, lot });
  }

  for (const { listing, boxes, lot } of adjustments) {
    listing.stockBoxes -= boxes;
    if (lot) {
      lot.availableBoxes -= boxes;
      lot.updatedAt = now;
    }
  }

  const { id, nameEn, nameBn, addressEn, addressBn } = branch;
  return { branch: { id, nameEn, nameBn, addressEn, addressBn }, items, reservedAt: now };
}

export function releaseOrderStock(db: RuntimeDatabase, order: Order, now: string): void {
  const reservation = order.stockReservation;
  if (!reservation || reservation.releasedAt || order.stateHistory.some((entry) => entry.toState === "DISPATCHED")) return;

  for (const item of reservation.items) {
    const listing = db.listings.find((entry) => entry.id === item.listingId && entry.organizationId === order.organizationId);
    const lot = db.stockLots?.find((entry) => entry.id === item.lotId);
    if (listing) listing.stockBoxes += item.boxes;
    if (lot) {
      lot.availableBoxes += item.boxes;
      lot.updatedAt = now;
    }
  }
  reservation.releasedAt = now;
}
