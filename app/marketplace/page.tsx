import { discoverCatalogue } from "@/lib/public-catalogue";
import { MarketplaceContent, type MarketplaceFilters } from "./MarketplaceContent";

export const dynamic = "force-dynamic";

export default function MarketplacePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const value = (key: string, fallback = "ALL") => {
    const input = searchParams[key];
    return typeof input === "string" && input ? input : fallback;
  };
  const sort = value("sort", "newest");
  const filters: MarketplaceFilters = {
    q: value("q", ""),
    categoryId: value("categoryId"),
    district: value("district"),
    finish: value("finish"),
    dimensions: value("dimensions"),
    organizationId: value("organizationId"),
    sort: sort === "price_asc" || sort === "price_desc" ? sort : "newest",
  };

  return <MarketplaceContent key={JSON.stringify(filters)} initialFilters={filters} initialCatalogue={discoverCatalogue(filters)} />;
}
