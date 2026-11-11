import type { MetadataRoute } from "next";
import { guideSlugs } from "@/lib/marketplace-guides";
import { canonicalUrl } from "@/lib/seo";
import { isPublicListing, loadDatabase } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const db = loadDatabase();
  const organizations = new Map(db.organizations.map((organization) => [organization.id, organization]));
  const publicPages = [
    "/",
    "/marketplace",
    "/visualizer",
    "/services",
    "/guides",
    "/pitch-deck",
    ...guideSlugs.map((slug) => `/guides/${slug}`),
  ];
  const listingPages = db.listings.filter((listing) => isPublicListing(listing, organizations.get(listing.organizationId)));
  return [
    ...publicPages.map((path) => ({
      url: canonicalUrl(path),
      changeFrequency: path.startsWith("/guides") ? "monthly" as const : "weekly" as const,
      priority: path === "/" ? 1 : path.startsWith("/guides/") ? 0.6 : 0.8,
    })),
    ...listingPages.map((listing) => ({
      url: canonicalUrl(`/marketplace/${encodeURIComponent(listing.id)}`),
      lastModified: listing.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
