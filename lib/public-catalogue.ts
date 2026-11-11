import { isPublicListing, loadDatabase, publicShowroom, queryDiscoverableListings } from "./store";
import type { DiscoveryFilterParams } from "./store";

export function discoverCatalogue(filters: DiscoveryFilterParams) {
  const discovery = queryDiscoverableListings(filters);
  const db = loadDatabase();
  return {
    ...discovery,
    categories: db.categories,
    verifiedShowrooms: db.organizations.filter((org) => org.verificationStatus === "VERIFIED").map(publicShowroom),
  };
}

export function discoverListing(id: string) {
  const db = loadDatabase();
  const listing = db.listings.find((entry) => entry.id === id);
  const organization = db.organizations.find((entry) => entry.id === listing?.organizationId);
  if (!listing || !organization || !isPublicListing(listing, organization)) return null;
  return {
    listing,
    organization: publicShowroom(organization),
    branches: db.branches.filter((branch) => branch.organizationId === organization.id),
    category: db.categories.find((category) => category.id === listing.categoryId),
    relatedListings: db.listings.filter((entry) => entry.id !== listing.id &&
      (entry.organizationId === listing.organizationId || entry.categoryId === listing.categoryId) &&
      isPublicListing(entry, db.organizations.find((dealer) => dealer.id === entry.organizationId))).slice(0, 3),
  };
}
