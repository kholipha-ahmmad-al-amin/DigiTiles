import { isPublicListing } from "./store";
import type { RuntimeDatabase } from "./types";

const percent = (part: number, total: number) => total ? 100 * part / total : null;

export function calculateAnalytics(db: RuntimeDatabase, organizationId?: string) {
  const inScope = (entry: { organizationId: string }) => !organizationId || entry.organizationId === organizationId;
  const rfqs = db.rfqs.filter(inScope);
  const orders = db.orders.filter(inScope);
  const converted = new Set(orders.map((order) => order.rfqId));
  const firstQuote = new Map<string, number>();
  for (const quote of db.quotations.filter(inScope)) {
    const issuedAt = Date.parse(quote.createdAt);
    if (Number.isFinite(issuedAt) && issuedAt < (firstQuote.get(quote.rfqId) ?? Infinity)) {
      firstQuote.set(quote.rfqId, issuedAt);
    }
  }
  const responseTimes = rfqs.flatMap((rfq) => {
    const elapsed = (firstQuote.get(rfq.id) ?? NaN) - Date.parse(rfq.createdAt);
    return Number.isFinite(elapsed) && elapsed >= 0 ? [elapsed / 3600000] : [];
  });
  const organizations = new Map(db.organizations.map((org) => [org.id, org]));
  const publicListings = db.listings.filter((listing) =>
    inScope(listing) && isPublicListing(listing, organizations.get(listing.organizationId)) &&
    Number.isFinite(listing.pricePerSqftBdt) && listing.pricePerSqftBdt > 0
  );
  const categoryIndex = db.categories.flatMap((category) => {
    const prices = publicListings.filter((listing) => listing.categoryId === category.id).map((listing) => listing.pricePerSqftBdt);
    return prices.length ? [{
      id: category.id, nameEn: category.nameEn, nameBn: category.nameBn,
      price: prices.reduce((sum, price) => sum + price, 0) / prices.length, count: prices.length,
    }] : [];
  });
  const branches = db.branches.filter(inScope);
  const branchScores = branches.map((branch) => {
    const assigned = orders.filter((order) => {
      if (order.organizationId !== branch.organizationId) return false;
      if (!order.stateHistory.some((event) => event.toState === "CONFIRMED")) return false;
      const name = order.deliveryCoordination.pickupBranchName;
      if (order.stockReservation) return order.stockReservation.branch.id === branch.id;
      return (name === branch.nameEn || name === branch.nameBn) &&
        branches.filter((other) => other.organizationId === branch.organizationId &&
          (other.nameEn === name || other.nameBn === name)).length === 1;
    });
    const fulfilled = assigned.filter((order) => order.state === "DELIVERED" || order.state === "COMPLETED").length;
    return {
      id: branch.id, nameEn: branch.nameEn, nameBn: branch.nameBn,
      count: assigned.length, fulfilled, score: percent(fulfilled, assigned.length),
    };
  });

  return {
    averageResponseHours: responseTimes.length ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length : null,
    responseCount: responseTimes.length,
    conversionRate: percent(rfqs.filter((rfq) => converted.has(rfq.id)).length, rfqs.length),
    rfqCount: rfqs.length,
    categoryIndex,
    branchScores,
  };
}

export type OperationalAnalytics = ReturnType<typeof calculateAnalytics>;
